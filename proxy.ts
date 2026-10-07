import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/api/admin/media") {
    if (request.method === "POST") {
      const length = Number(request.headers.get("content-length") ?? "");
      if (!Number.isFinite(length) || length <= 0 || length > 9 * 1024 * 1024) {
        return NextResponse.json({ error: "Zdjęcie jest za duże albo nie ma podanego rozmiaru. Limit to 8 MB." }, { status: 413 });
      }
    }
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (path.startsWith("/salon") && !path.startsWith("/salon/login") && !data.user) {
    const login = request.nextUrl.clone();
    login.pathname = "/salon/login";
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/salon/:path*", "/api/admin/media"],
};
