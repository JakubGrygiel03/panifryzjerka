import { NextResponse } from "next/server";
import { findCustomerByEmail, normalizeEmail, verifyPassword } from "@/lib/account/customers";
import { adminEmail, createCustomerCookieValue, customerCookieOptions, CUSTOMER_COOKIE } from "@/lib/account/session";
import { adminPasswordMatches } from "@/lib/account/admin-password";
import { ADMIN_COOKIE, adminCookieOptions, createAdminCookieValue } from "@/lib/cms/session";
import { sameOrigin } from "@/lib/security/origin";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function back(request: Request, blad: string, email?: string) {
  const url = new URL("/konto/logowanie", request.url);
  url.searchParams.set("blad", blad);
  if (email) url.searchParams.set("email", email);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return back(request, "odswiez");
  if (!rateLimit(`login:${clientKey(request.headers)}`, 8, 15 * 60 * 1000)) return back(request, "limit");
  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!email.includes("@") || password.length < 1 || password.length > 128) return back(request, "dane", email);

  if (email === adminEmail() && (await adminPasswordMatches(password))) {
    const response = NextResponse.redirect(new URL("/admin", request.url), 303);
    response.cookies.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions());
    return response;
  }

  const user = await findCustomerByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return back(request, "haslo", email);

  const response = NextResponse.redirect(new URL("/konto", request.url), 303);
  response.cookies.set(CUSTOMER_COOKIE, createCustomerCookieValue(user.id), customerCookieOptions());
  return response;
}
