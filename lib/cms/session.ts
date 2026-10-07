import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "pf-admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || "";
}

export function adminCookieOptions() {
  const https = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: https,
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };
}

export function createAdminCookieValue() {
  const secret = adminSecret();
  if (!secret) throw new Error("Brak ADMIN_SESSION_SECRET");
  const exp = String(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000);
  const payload = `1.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function isAdminCookieValue(value: string | undefined) {
  if (!value) return false;
  const secret = adminSecret();
  if (!secret || value === "1") return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [flag, exp, sig] = parts;
  if (flag !== "1" || !exp || !sig || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(`${flag}.${exp}`).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  } catch {
    return false;
  }
  return true;
}

export function passwordsMatch(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
