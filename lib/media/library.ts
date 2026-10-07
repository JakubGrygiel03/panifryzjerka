import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { readCms } from "@/lib/cms/store";
import {
  isSalonImagePath,
  LIBRARY_MAX_BYTES,
  LIBRARY_MAX_FILES,
  MAX_IMAGE_EDGE,
  UPLOAD_MAX_BYTES,
  type MediaKind,
  type MediaRef,
} from "@/lib/media/paths";

type MediaEntry = MediaRef & {
  hash: string;
  mtimeMs: number;
};

type MediaIndex = { items: MediaEntry[] };

const SALON_DIR = path.join(process.cwd(), "public", "salon");
const LIBRARY_DIR = path.join(SALON_DIR, "library");
const INDEX_FILE = path.join(process.cwd(), "data", "media-index.json");

export class MediaError extends Error {}

let tail: Promise<unknown> = Promise.resolve();

function exclusive<T>(task: () => Promise<T>) {
  const run = tail.then(task, task);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function sha256(data: Buffer) {
  return createHash("sha256").update(data).digest("hex");
}

function sniff(data: Buffer) {
  if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpeg";
  if (data.length > 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (data.length > 12 && data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

async function readIndex(): Promise<MediaIndex> {
  try {
    const parsed = JSON.parse(await readFile(INDEX_FILE, "utf8")) as MediaIndex;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

async function writeIndex(index: MediaIndex) {
  await mkdir(path.dirname(INDEX_FILE), { recursive: true });
  const temp = `${INDEX_FILE}.tmp`;
  await writeFile(temp, JSON.stringify(index), "utf8");
  await rename(temp, INDEX_FILE);
}

async function collect(dir: string, srcPrefix: string, kind: MediaKind) {
  let names: string[] = [];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const root = path.resolve(dir);
  const files: { abs: string; src: string; kind: MediaKind; bytes: number; mtimeMs: number }[] = [];
  for (const name of names) {
    if (name.startsWith(".")) continue;
    if (kind === "catalog" && !/\.(jpe?g|png|webp)$/i.test(name)) continue;
    if (kind === "upload" && !/^[a-f0-9]{16}\.webp$/.test(name)) continue;
    const abs = path.resolve(dir, name);
    if (abs !== root && !abs.startsWith(`${root}${path.sep}`)) continue;
    const stat = await lstat(abs);
    if (!stat.isFile()) continue;
    files.push({ abs, src: `${srcPrefix}${name}`, kind, bytes: stat.size, mtimeMs: stat.mtimeMs });
  }
  return files;
}

async function describe(file: { abs: string; src: string; kind: MediaKind; bytes: number; mtimeMs: number }, previous?: MediaEntry): Promise<MediaEntry> {
  if (previous && previous.mtimeMs === file.mtimeMs && previous.bytes === file.bytes && previous.hash) return previous;
  const data = await readFile(file.abs);
  return { src: file.src, hash: sha256(data), bytes: data.length, kind: file.kind, mtimeMs: file.mtimeMs };
}

async function refreshIndex() {
  const current = await readIndex();
  const files = [
    ...(await collect(SALON_DIR, "/salon/", "catalog")),
    ...(await collect(LIBRARY_DIR, "/salon/library/", "upload")),
  ];
  let changed = files.length !== current.items.length;
  const items: MediaEntry[] = [];
  for (const file of files) {
    const previous = current.items.find((item) => item.src === file.src);
    const next = await describe(file, previous);
    if (!previous || previous.hash !== next.hash || previous.mtimeMs !== next.mtimeMs) changed = true;
    items.push(next);
  }
  const index = { items };
  if (changed) await writeIndex(index);
  return index;
}

function toRef(entry: MediaEntry): MediaRef {
  return { src: entry.src, bytes: entry.bytes, kind: entry.kind };
}

async function encode(input: Buffer) {
  const pipeline = sharp(input, { limitInputPixels: 48_000_000, sequentialRead: true, failOn: "error" }).rotate();
  async function render(quality: number) {
    return pipeline
      .clone()
      .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();
  }
  try {
    const first = await render(72);
    if (first.length <= 900_000) return first;
    return render(58);
  } catch {
    throw new MediaError("Zdjęcie ma za dużą rozdzielczość albo jest uszkodzone.");
  }
}

async function storeUploadInner(input: Buffer) {
  if (input.length <= 0 || input.length > UPLOAD_MAX_BYTES) {
    throw new MediaError("Zdjęcie może mieć najwyżej 8 MB.");
  }
  if (!sniff(input)) throw new MediaError("Dozwolone są zdjęcia JPG, PNG i WebP.");
  const hash = sha256(input);
  const index = await refreshIndex();
  const known = index.items.find((item) => item.hash === hash);
  if (known) return { ...toRef(known), reused: true };

  const filename = `${hash.slice(0, 16)}.webp`;
  const src = `/salon/library/${filename}`;
  const abs = path.resolve(LIBRARY_DIR, filename);
  const root = path.resolve(LIBRARY_DIR);
  if (!abs.startsWith(`${root}${path.sep}`)) throw new MediaError("Niedozwolona nazwa pliku.");

  try {
    const stat = await lstat(abs);
    if (stat.isFile()) return { src, bytes: stat.size, kind: "upload" as const, reused: true };
  } catch {
    // Pliku jeszcze nie ma — zapisujemy jedną skompresowaną kopię.
  }

  const uploads = index.items.filter((item) => item.kind === "upload");
  if (uploads.length >= LIBRARY_MAX_FILES) {
    throw new MediaError("Biblioteka wgranych zdjęć jest pełna. Usuń nieużywane pliki.");
  }

  const output = await encode(input);
  const used = uploads.reduce((sum, item) => sum + item.bytes, 0);
  if (used + output.length > LIBRARY_MAX_BYTES) {
    throw new MediaError("Brak miejsca na kolejne zdjęcia. Limit wgranych plików to 25 MB.");
  }

  await mkdir(LIBRARY_DIR, { recursive: true });
  try {
    await writeFile(abs, output);
  } catch {
    throw new MediaError("Na tym serwerze nie da się zapisać pliku. Wgraj zdjęcie na komputerze z panelem.");
  }
  const stat = await lstat(abs);
  index.items.push({ src, hash, bytes: output.length, kind: "upload", mtimeMs: stat.mtimeMs });
  await writeIndex(index);
  return { src, bytes: output.length, kind: "upload" as const, reused: false };
}

function sectionUses(src: string) {
  const sections = readCms().sections ?? [];
  return sections.some((section) => section?.image === src);
}

async function removeUploadInner(src: string) {
  if (!src.startsWith("/salon/library/") || !isSalonImagePath(src)) {
    throw new MediaError("Zdjęcia z katalogu salonu zostają w jednym wspólnym miejscu.");
  }
  if (sectionUses(src)) {
    throw new MediaError("To zdjęcie jest podpięte do sekcji. Odłącz je w układzie strony.");
  }
  const filename = src.slice("/salon/library/".length);
  const abs = path.resolve(LIBRARY_DIR, filename);
  const root = path.resolve(LIBRARY_DIR);
  if (!abs.startsWith(`${root}${path.sep}`)) throw new MediaError("Niedozwolona nazwa pliku.");
  try {
    await unlink(abs);
  } catch {
    throw new MediaError("Plik już nie istnieje.");
  }
  const index = await readIndex();
  await writeIndex({ items: index.items.filter((item) => item.src !== src) });
}

export function listMedia() {
  return exclusive(async () => {
    const index = await refreshIndex();
    return index.items
      .map(toRef)
      .sort((a, b) => a.src.localeCompare(b.src, "pl"));
  });
}

export function storeUpload(input: Buffer) {
  return exclusive(() => storeUploadInner(input));
}

export function removeUpload(src: string) {
  return exclusive(() => removeUploadInner(src));
}
