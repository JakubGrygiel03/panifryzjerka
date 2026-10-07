import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, customerCookieOptions } from "@/lib/account/session";
import { sameOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.redirect(new URL("/konto", request.url), 303);
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(CUSTOMER_COOKIE, "", { ...customerCookieOptions(), maxAge: 0 });
  return response;
}
