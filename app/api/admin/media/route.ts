import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";
import { listMedia, MediaError, removeUpload, storeUpload } from "@/lib/media/library";
import { UPLOAD_MAX_BYTES } from "@/lib/media/paths";
import { sameOrigin } from "@/lib/security/origin";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  if (!isAdminCookieValue(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const items = await listMedia();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Odśwież panel i wgraj zdjęcie jeszcze raz." }, { status: 403 });
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!rateLimit(`upload:${clientKey(request.headers)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Za dużo wgrań. Spróbuj za godzinę." }, { status: 429 });
  }

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Wybierz plik ze zdjęciem." }, { status: 400 });
  if (file.size <= 0 || file.size > UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Zdjęcie może mieć najwyżej 8 MB." }, { status: 413 });
  }

  try {
    const saved = await storeUpload(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof MediaError ? error.message : "Nie udało się zapisać zdjęcia.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Odśwież panel i spróbuj jeszcze raz." }, { status: 403 });
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!rateLimit(`upload:${clientKey(request.headers)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Za dużo operacji na zdjęciach. Spróbuj za godzinę." }, { status: 429 });
  }
  const src = new URL(request.url).searchParams.get("src") ?? "";
  try {
    await removeUpload(src);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof MediaError ? error.message : "Nie udało się usunąć zdjęcia.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
