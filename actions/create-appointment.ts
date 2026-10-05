"use server";

import { z } from "zod";
import { SALON } from "@/lib/brand";
import { staffName } from "@/lib/booking/catalog";
import {
  buildIcs,
  googleCalendarUrl,
  sendAppointmentEmail,
  sendAppointmentSms,
} from "@/lib/booking/notifications";
import { bookingBackend, listPublicSlots, saveAppointment } from "@/lib/booking/repository";
import type { ActionResult, BookingConfirmation } from "@/lib/booking/types";

const schema = z.object({
  variantId: z.string().uuid(),
  staffId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().regex(/^[+0-9][0-9\s-]{4,20}$/, "Podaj numer telefonu."),
  customerEmail: z.string().trim().email().or(z.literal("")).optional(),
  notes: z.string().trim().max(1000).optional(),
  website: z.string().max(200).optional(),
});

export async function createAppointment(input: unknown): Promise<ActionResult<BookingConfirmation>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza." };
  }

  if (parsed.data.website) {
    return { ok: false, error: "Nie udało się zapisać wizyty." };
  }

  if (bookingBackend() === "unconfigured") {
    return { ok: false, error: "Rezerwacje online wymagają konfiguracji Supabase." };
  }

  const { findVariant } = await import("@/lib/booking/catalog");
  const match = findVariant(parsed.data.variantId);
  if (!match || !match.group.staffIds.includes(parsed.data.staffId)) {
    return { ok: false, error: "Ta stylistka nie wykonuje wybranej usługi." };
  }

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(parsed.data.startsAt));

  const slots = await listPublicSlots(date, parsed.data.variantId, parsed.data.staffId);
  const slot = slots.find((item) => item.start === parsed.data.startsAt && item.staffId === parsed.data.staffId);
  if (!slot) {
    return { ok: false, error: "Ten termin nie jest już wolny. Wybierz inną godzinę." };
  }

  try {
    const saved = await saveAppointment({
      serviceId: parsed.data.variantId,
      staffId: parsed.data.staffId,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      notes: parsed.data.notes || null,
      startsAt: slot.start,
      endsAt: slot.end,
      source: "online",
    });

    const stylist = staffName(saved.staffId);
    const ics = buildIcs({
      id: saved.id,
      serviceName: match.group.name,
      staffId: saved.staffId,
      startsAt: saved.startsAt,
      endsAt: saved.endsAt,
    });
    const calendarUrl = googleCalendarUrl({
      serviceName: match.group.name,
      startsAt: saved.startsAt,
      endsAt: saved.endsAt,
    });

    let emailSent = false;
    let smsSent = false;
    if (saved.customerEmail) {
      emailSent = await sendAppointmentEmail({
        to: saved.customerEmail,
        customerName: saved.customerName,
        serviceName: match.group.name,
        staffName: stylist,
        startsAt: saved.startsAt,
        endsAt: saved.endsAt,
        ics,
        googleCalendarUrl: calendarUrl,
      });
    }
    smsSent = await sendAppointmentSms(saved.customerPhone, saved.startsAt);

    return {
      ok: true,
      data: {
        id: saved.id,
        serviceName: match.group.name,
        staffName: stylist,
        customerName: saved.customerName,
        startsAt: saved.startsAt,
        endsAt: saved.endsAt,
        googleCalendarUrl: calendarUrl,
        ics,
        emailSent,
        smsSent,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zapisać wizyty." };
  }
}
