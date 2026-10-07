import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "desk.json");

export type WaitEntry = {
  id: string;
  name: string;
  phone: string;
  serviceName: string;
  date: string;
  createdAt: string;
  done: boolean;
};

export type GiftVoucher = {
  id: string;
  code: string;
  amountZl: number;
  holder: string;
  note: string;
  createdAt: string;
  usedAt: string | null;
};

type DeskFile = {
  notes: Record<string, string>;
  waitlist: WaitEntry[];
  vouchers: GiftVoucher[];
  sent: string[];
  takings: Record<string, number>;
};

const empty = (): DeskFile => ({ notes: {}, waitlist: [], vouchers: [], sent: [], takings: {} });

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-9) || digits;
}

async function readDesk(): Promise<DeskFile> {
  try {
    const raw = (await readFile(FILE, "utf8")).replace(/^\uFEFF/, "").trim();
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<DeskFile>;
    return {
      notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
      waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist : [],
      vouchers: Array.isArray(parsed.vouchers) ? parsed.vouchers : [],
      sent: Array.isArray(parsed.sent) ? parsed.sent.filter((item) => typeof item === "string") : [],
      takings: parsed.takings && typeof parsed.takings === "object" ? parsed.takings : {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw error;
  }
}

async function writeDesk(data: DeskFile) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2), "utf8");
  await rename(temp, FILE);
}

export async function readNotes() {
  return (await readDesk()).notes;
}

export async function saveNote(phone: string, note: string) {
  const key = phoneKey(phone);
  if (!key) throw new Error("Brak numeru telefonu.");
  await enqueue(async () => {
    const data = await readDesk();
    const clean = note.trim().slice(0, 280);
    if (clean) data.notes[key] = clean;
    else delete data.notes[key];
    await writeDesk(data);
  });
}

export async function addWait(input: { name: string; phone: string; serviceName: string; date: string }) {
  return enqueue(async () => {
    const data = await readDesk();
    const key = phoneKey(input.phone);
    const existing = data.waitlist.find((row) => !row.done && row.date === input.date && phoneKey(row.phone) === key);
    if (existing) return existing;
    const created: WaitEntry = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      phone: input.phone.trim(),
      serviceName: input.serviceName.trim(),
      date: input.date,
      createdAt: new Date().toISOString(),
      done: false,
    };
    data.waitlist.unshift(created);
    data.waitlist = data.waitlist.slice(0, 400);
    await writeDesk(data);
    return created;
  });
}

export async function listWait() {
  const data = await readDesk();
  return data.waitlist.sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt));
}

export async function setWaitDone(id: string, done: boolean) {
  await enqueue(async () => {
    const data = await readDesk();
    const row = data.waitlist.find((item) => item.id === id);
    if (!row) throw new Error("Nie ma takiego zgłoszenia.");
    row.done = done;
    await writeDesk(data);
  });
}

function voucherCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `PF-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export async function addVoucher(input: { amountZl: number; holder: string; note: string }) {
  return enqueue(async () => {
    const data = await readDesk();
    const created: GiftVoucher = {
      id: crypto.randomUUID(),
      code: voucherCode(),
      amountZl: input.amountZl,
      holder: input.holder.trim(),
      note: input.note.trim().slice(0, 180),
      createdAt: new Date().toISOString(),
      usedAt: null,
    };
    data.vouchers.unshift(created);
    data.vouchers = data.vouchers.slice(0, 300);
    await writeDesk(data);
    return created;
  });
}

export async function listVouchers() {
  return (await readDesk()).vouchers;
}

export async function setVoucherUsed(id: string, used: boolean) {
  await enqueue(async () => {
    const data = await readDesk();
    const row = data.vouchers.find((item) => item.id === id);
    if (!row) throw new Error("Nie ma takiego bonu.");
    row.usedAt = used ? new Date().toISOString() : null;
    await writeDesk(data);
  });
}

export async function wasSent(key: string) {
  return (await readDesk()).sent.includes(key);
}

export async function markSent(key: string) {
  await enqueue(async () => {
    const data = await readDesk();
    if (!data.sent.includes(key)) data.sent.push(key);
    data.sent = data.sent.slice(-2000);
    await writeDesk(data);
  });
}

export async function setTaking(date: string, amountZl: number) {
  await enqueue(async () => {
    const data = await readDesk();
    if (amountZl <= 0) delete data.takings[date];
    else data.takings[date] = amountZl;
    await writeDesk(data);
  });
}

export async function takingsInMonth(month: string) {
  const data = await readDesk();
  return Object.entries(data.takings)
    .filter(([date]) => date.startsWith(month))
    .reduce((sum, [, amount]) => sum + amount, 0);
}

export async function takingOn(date: string) {
  return (await readDesk()).takings[date] ?? 0;
}
