import { NextResponse } from "next/server";
import { registerCustomer, normalizeEmail } from "@/lib/account/customers";
import { adminEmail, createCustomerCookieValue, customerCookieOptions, CUSTOMER_COOKIE } from "@/lib/account/session";
import { sameOrigin } from "@/lib/security/origin";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function back(request: Request, blad: string) {
  const url = new URL("/konto/rejestracja", request.url);
  url.searchParams.set("blad", blad);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return back(request, "odswiez");
  if (!rateLimit(`register:${clientKey(request.headers)}`, 5, 60 * 60 * 1000)) return back(request, "limit");
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  if (name.length < 2 || name.length > 80 || phone.length < 5 || phone.length > 30 || !email.includes("@") || email.length > 120 || password.length < 8 || password.length > 128) {
    return back(request, "dane");
  }
  if (email === adminEmail()) return back(request, "admin");

  try {
    const user = await registerCustomer({ name, phone, email, password });
    const response = NextResponse.redirect(new URL("/konto", request.url), 303);
    response.cookies.set(CUSTOMER_COOKIE, createCustomerCookieValue(user.id), customerCookieOptions());
    return response;
  } catch (error) {
    const full = error instanceof Error && error.message === "full";
    const url = new URL(full ? "/konto/rejestracja" : "/konto/logowanie", request.url);
    url.searchParams.set("blad", full ? "pelne" : "istnieje");
    if (!full) url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  }
}
