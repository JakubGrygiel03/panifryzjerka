import { recordEvent } from "@/lib/analytics/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: unknown; type?: unknown; label?: unknown; visitor?: unknown } | null;
  const pathName = typeof body?.path === "string" ? body.path.slice(0, 120) : "/";
  if (!pathName.startsWith("/") || pathName.startsWith("/admin") || pathName.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }
  const type = body?.type === "click" ? "click" : "view";
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 80) : "";
  const visitor = typeof body?.visitor === "string" && /^[a-zA-Z0-9-]{8,40}$/.test(body.visitor) ? body.visitor : undefined;
  if (type === "click" && !label) return new Response(null, { status: 204 });
  recordEvent({ type, path: pathName, label: label || undefined, visitor });
  return new Response(null, { status: 204 });
}
