import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/cms/session";
import { sameOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.redirect(new URL("/admin", request.url), 303);
  const response = NextResponse.redirect(new URL("/admin/logowanie", request.url));
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
