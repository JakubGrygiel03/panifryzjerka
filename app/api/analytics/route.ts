import { recordEvent } from "@/lib/analytics/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
  const pathName = typeof body?.path === "string" ? body.path.slice(0, 120) : "/";
  if (!pathName.startsWith("/") || pathName.startsWith("/admin") || pathName.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }
  recordEvent({ type: "view", path: pathName });
  return new Response(null, { status: 204 });
}
