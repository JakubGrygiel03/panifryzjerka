import { NextResponse } from "next/server";
import { z } from "zod";
import { listPublicSlots } from "@/lib/booking/repository";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  variantId: z.string().uuid(),
  staffId: z.string().uuid().or(z.literal("any")),
});

export async function GET(request: Request) {
  if (!rateLimit(`slots:${clientKey(request.headers)}`, 90, 60 * 1000)) {
    return NextResponse.json({ error: "Za dużo pytań o terminy. Spróbuj za chwilę." }, { status: 429 });
  }
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: url.searchParams.get("date"),
    variantId: url.searchParams.get("variantId"),
    staffId: url.searchParams.get("staffId") ?? "any",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Podaj dzień, usługę i stylistkę." }, { status: 400 });
  }

  try {
    const slots = await listPublicSlots(parsed.data.date, parsed.data.variantId, parsed.data.staffId);
    return NextResponse.json({ slots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nie udało się policzyć terminów.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
