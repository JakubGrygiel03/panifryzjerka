"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { bookingBackend, listPublicSlots, saveAppointment, updateAppointmentStatus } from "@/lib/booking/repository";
import type { ActionResult, AppointmentStatus } from "@/lib/booking/types";

const walkInSchema = z.object({
  variantId: z.string().uuid(),
  staffId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().regex(/^[+0-9][0-9\s-]{4,20}$/),
  source: z.enum(["phone", "walk_in"]),
});

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
});

async function assertStaff() {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Panel salonu wymaga logowania Supabase.");
    }
    return;
  }
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) throw new Error("Zaloguj się, aby zmienić grafik.");
}

export async function createWalkIn(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = walkInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Uzupełnij imię, telefon, usługę i godzinę." };

  try {
    await assertStaff();
    if (bookingBackend() === "unconfigured") {
      return { ok: false, error: "Panel wymaga konfiguracji Supabase." };
    }
    const { SALON } = await import("@/lib/brand");
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: SALON.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(parsed.data.startsAt));
    const slots = await listPublicSlots(date, parsed.data.variantId, parsed.data.staffId);
    const slot = slots.find((item) => item.start === parsed.data.startsAt);
    if (!slot) return { ok: false, error: "Ta godzina jest już zajęta." };

    const saved = await saveAppointment({
      serviceId: parsed.data.variantId,
      staffId: parsed.data.staffId,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: null,
      notes: null,
      startsAt: slot.start,
      endsAt: slot.end,
      source: parsed.data.source,
    });
    revalidatePath("/salon/kalendarz");
    return { ok: true, data: { id: saved.id } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zablokować terminu." };
  }
}

export async function setAppointmentStatus(input: unknown): Promise<ActionResult<{ status: AppointmentStatus }>> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nieprawidłowy status." };
  try {
    await assertStaff();
    await updateAppointmentStatus(parsed.data.id, parsed.data.status);
    revalidatePath("/salon/kalendarz");
    return { ok: true, data: { status: parsed.data.status } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zmienić statusu." };
  }
}
