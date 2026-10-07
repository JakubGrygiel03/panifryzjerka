import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "customers.json");

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

type CustomersFile = { users: CustomerUser[] };

export type PublicCustomer = Pick<CustomerUser, "id" | "email" | "name" | "phone">;

function readFile(): CustomersFile {
  if (!existsSync(FILE)) return { users: [] };
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as CustomersFile;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

async function writeFileSafe(data: CustomersFile) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2), "utf8");
  await rename(temp, FILE);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function toPublic(user: CustomerUser): PublicCustomer {
  return { id: user.id, email: user.email, name: user.name, phone: user.phone };
}

type CustomerRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  password_hash: string;
  created_at: string;
};

function fromRow(row: CustomerRow): CustomerUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function remoteCustomer(column: "email" | "id", value: string) {
  if (!isSupabaseAdminConfigured()) return undefined;
  const admin = createAdminClient();
  const { data, error } = await admin.from("customers").select("id,email,name,phone,password_hash,created_at").eq(column, value).maybeSingle();
  if (error) return undefined;
  return data ? fromRow(data as CustomerRow) : null;
}

export async function findCustomerByEmail(email: string) {
  const key = normalizeEmail(email);
  const remote = await remoteCustomer("email", key);
  if (remote !== undefined) return remote ?? undefined;
  return readFile().users.find((user) => user.email === key);
}

export async function findCustomerById(id: string) {
  const remote = await remoteCustomer("id", id);
  if (remote !== undefined) return remote ?? undefined;
  return readFile().users.find((user) => user.id === id);
}

export async function registerCustomer(input: { email: string; name: string; phone: string; password: string }) {
  const email = normalizeEmail(input.email);
  const existing = await findCustomerByEmail(email);
  if (existing) throw new Error("Konto z tym e-mailem już istnieje. Zaloguj się.");
  const user: CustomerUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { error } = await admin.from("customers").insert({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    });
    if (!error) return toPublic(user);
  }
  const users = readFile();
  if (users.users.length >= 2000) throw new Error("full");
  users.users.push(user);
  await writeFileSafe(users);
  return toPublic(user);
}

export async function setCustomerPassword(email: string, password: string) {
  const key = normalizeEmail(email);
  const passwordHash = hashPassword(password);
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("customers").update({ password_hash: passwordHash }).eq("email", key).select("id");
    if (!error && data && data.length > 0) return true;
    if (!error) return false;
  }
  const data = readFile();
  const user = data.users.find((item) => item.email === key);
  if (!user) return false;
  user.passwordHash = passwordHash;
  await writeFileSafe(data);
  return true;
}
