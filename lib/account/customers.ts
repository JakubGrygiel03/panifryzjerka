import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

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

function hashPassword(password: string) {
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

export function findCustomerByEmail(email: string) {
  const key = normalizeEmail(email);
  return readFile().users.find((user) => user.email === key);
}

export function findCustomerById(id: string) {
  return readFile().users.find((user) => user.id === id);
}

export async function registerCustomer(input: { email: string; name: string; phone: string; password: string }) {
  const email = normalizeEmail(input.email);
  const users = readFile();
  if (users.users.some((user) => user.email === email)) {
    throw new Error("Konto z tym e-mailem już istnieje. Zaloguj się.");
  }
  if (users.users.length >= 2000) throw new Error("full");
  const user: CustomerUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  users.users.push(user);
  await writeFileSafe(users);
  return toPublic(user);
}
