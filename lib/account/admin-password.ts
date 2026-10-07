import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword, verifyPassword } from "@/lib/account/customers";
import { passwordsMatch } from "@/lib/cms/session";
import { isSupabaseAdminConfigured, createAdminClient } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "admin-password.json");

function readFileHash() {
  if (!existsSync(FILE)) return "";
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as { hash?: string };
    return typeof parsed.hash === "string" ? parsed.hash : "";
  } catch {
    return "";
  }
}

async function readRemoteHash() {
  if (!isSupabaseAdminConfigured()) return "";
  const admin = createAdminClient();
  const { data, error } = await admin.from("admin_credentials").select("password_hash").eq("id", 1).maybeSingle();
  if (error || !data || typeof data.password_hash !== "string") return "";
  return data.password_hash;
}

export async function adminPasswordMatches(password: string) {
  const override = (await readRemoteHash()) || readFileHash();
  if (override) return verifyPassword(password, override);
  const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";
  return Boolean(expected) && passwordsMatch(password, expected);
}

async function writeFileHash(hash: string) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify({ hash }, null, 2), "utf8");
  await rename(temp, FILE);
}

export async function setAdminPassword(password: string) {
  const hash = hashPassword(password);
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { error } = await admin.from("admin_credentials").upsert({ id: 1, password_hash: hash });
    if (!error) return;
  }
  await writeFileHash(hash);
}
