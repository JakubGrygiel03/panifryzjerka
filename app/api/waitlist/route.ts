import { NextResponse } from "next/server";
import { z } from "zod";
import { addWait } from "@/lib/salon/desk";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { sameOrigin } from "@/lib/security/origin";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(9).max(20),
  serviceName: z.string().trim().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Zły adres." }, { status: 403 });
  if (!rateLimit(`wait:${clientKey(request.headers)}`, 6, 60 * 60_000)) {
    return NextResponse.json({ error: "Za dużo zgłoszeń. Zadzwoń do salonu." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Uzupełnij imię i telefon." }, { status: 400 });
  const digits = parsed.data.phone.replace(/\D/g, "");
  if (digits.length < 9) return NextResponse.json({ error: "Uzupełnij imię i telefon." }, { status: 400 });
  await addWait(parsed.data);
  return NextResponse.json({ ok: true });
}
