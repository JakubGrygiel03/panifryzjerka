import { NextResponse } from "next/server";
import { setAdminPassword } from "@/lib/account/admin-password";
import { findCustomerByEmail, normalizeEmail, setCustomerPassword } from "@/lib/account/customers";
import { consumeReset, createReset, resetOrigin, sendResetMail } from "@/lib/account/resets";
import { adminEmail } from "@/lib/account/session";
import { sameOrigin } from "@/lib/security/origin";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function back(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return back(request, "/konto/haslo?blad=odswiez");
  const form = await request.formData();
  const token = String(form.get("token") ?? "").trim();

  if (token) {
    if (!rateLimit(`reset-set:${clientKey(request.headers)}`, 8, 15 * 60 * 1000)) return back(request, "/konto/haslo?blad=limit");
    const password = String(form.get("password") ?? "");
    if (password.length < 8 || password.length > 128) return back(request, `/konto/haslo?token=${encodeURIComponent(token)}&blad=krotkie`);
    const row = await consumeReset(token);
    if (!row) return back(request, "/konto/haslo?blad=wygasl");
    if (row.role === "admin") await setAdminPassword(password);
    else {
      const saved = await setCustomerPassword(row.email, password);
      if (!saved) return back(request, "/konto/haslo?blad=wygasl");
    }
    return back(request, "/konto/logowanie?gotowe=1");
  }

  if (!rateLimit(`reset:${clientKey(request.headers)}`, 5, 60 * 60 * 1000)) return back(request, "/konto/haslo?blad=limit");
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!email.includes("@") || email.length > 120) return back(request, "/konto/haslo?blad=dane");

  if (email === adminEmail()) {
    const created = await createReset(email, "admin");
    await sendResetMail(email, created, resetOrigin(request));
  } else if (await findCustomerByEmail(email)) {
    const created = await createReset(email, "customer");
    await sendResetMail(email, created, resetOrigin(request));
  }

  return back(request, "/konto/haslo?wyslane=1");
}
