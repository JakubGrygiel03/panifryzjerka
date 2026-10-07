import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { findCustomerById, toPublic, type PublicCustomer } from "@/lib/account/customers";

export const CUSTOMER_COOKIE = "pf-customer";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || "";
}

export function customerCookieOptions() {
  const https = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: https,
    maxAge: MAX_AGE,
  };
}

export function createCustomerCookieValue(userId: string) {
  const key = secret();
  if (!key) throw new Error("Brak ADMIN_SESSION_SECRET");
  const exp = String(Date.now() + MAX_AGE * 1000);
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function customerIdFromCookie(value: string | undefined) {
  if (!value) return null;
  const key = secret();
  if (!key) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (!userId || !exp || !sig || Number(exp) < Date.now()) return null;
  const expected = createHmac("sha256", key).update(`${userId}.${exp}`).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function getCustomer(): Promise<PublicCustomer | null> {
  const store = await cookies();
  const id = customerIdFromCookie(store.get(CUSTOMER_COOKIE)?.value);
  if (!id) return null;
  const user = findCustomerById(id);
  return user ? toPublic(user) : null;
}

export function adminEmail() {
  return (process.env.ADMIN_EMAIL?.trim() || "admin@panifryzjerka.pl").toLowerCase();
}
