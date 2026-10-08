import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { SALON } from "@/lib/brand";
import { brandedHtml } from "@/lib/booking/mail-copy";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "password-resets.json");
const TTL_MS = 30 * 60 * 1000;

type ResetRow = {
  hash: string;
  email: string;
  role: "customer" | "admin";
  exp: number;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readRows(): ResetRow[] {
  if (!existsSync(FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as ResetRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRows(rows: ResetRow[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
  await rename(temp, FILE);
}

async function saveRemoteReset(row: { hash: string; email: string; role: ResetRow["role"]; exp: string }) {
  if (!isSupabaseAdminConfigured()) return false;
  const admin = createAdminClient();
  await admin.from("password_resets").delete().eq("email", row.email);
  const { error } = await admin.from("password_resets").insert(row);
  return !error;
}

export async function createReset(email: string, role: ResetRow["role"]) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const saved = await saveRemoteReset({ hash: hashToken(token), email, role, exp: new Date(now + TTL_MS).toISOString() });
  if (saved) return token;
  const rows = readRows().filter((row) => row.exp > now && row.email !== email);
  rows.push({ hash: hashToken(token), email, role, exp: now + TTL_MS });
  await writeRows(rows.slice(-40));
  return token;
}

export async function peekReset(token: string) {
  if (!/^[A-Za-z0-9_-]{20,120}$/.test(token)) return null;
  const hash = hashToken(token);
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("password_resets").select("email,role,exp").eq("hash", hash).maybeSingle();
    if (!error) {
      if (!data || new Date(data.exp).getTime() < Date.now()) return null;
      if (data.role !== "customer" && data.role !== "admin") return null;
      return { email: data.email as string, role: data.role };
    }
  }
  const row = readRows().find((item) => item.hash === hash && item.exp > Date.now());
  return row ? { email: row.email, role: row.role } : null;
}

export async function consumeReset(token: string) {
  const found = await peekReset(token);
  if (!found) return null;
  const hash = hashToken(token);
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { error } = await admin.from("password_resets").delete().eq("hash", hash);
    if (!error) return found;
  }
  await writeRows(readRows().filter((row) => row.hash !== hash));
  return found;
}

export async function sendResetMail(email: string, token: string, origin: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const link = `${origin}/konto/haslo?token=${encodeURIComponent(token)}`;
  const html = brandedHtml(`Ustaw nowe hasło.\n\nLink działa 30 minut i tylko raz.\n\n${link}\n\nJeśli to nie Ty prosisz o zmianę, zignoruj tę wiadomość.\n\nPaniFryzjerka`);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "PaniFryzjerka <noreply@panifryzjerka.pl>",
      to: [email],
      subject: "Nowe hasło — PaniFryzjerka",
      html,
    }),
  });
  return response.ok;
}

export function resetOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    const proto = request.headers.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  }
  return SALON.siteUrl;
}
