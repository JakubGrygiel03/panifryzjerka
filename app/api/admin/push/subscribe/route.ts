import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { savePushSubscription } from "@/lib/booking/push";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";
import { sameOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Odśwież kalendarz i włącz powiadomienia jeszcze raz." }, { status: 403 });
  }
  const jar = await cookies();
  if (!isAdminCookieValue(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Telefon nie przekazał danych powiadomień." }, { status: 400 });

  try {
    await savePushSubscription({
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nie udało się włączyć powiadomień.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
