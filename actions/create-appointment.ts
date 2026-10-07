"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { SALON } from "@/lib/brand";
import { staffName } from "@/lib/booking/catalog";
import { notifyOwner } from "@/lib/booking/push";
import {
  buildIcs,
  googleCalendarUrl,
  sendBookingMails,
  sendAppointmentSms,
} from "@/lib/booking/notifications";
import { bookingBackend, listPublicSlots, saveAppointment } from "@/lib/booking/repository";
import type { ActionResult, BookingConfirmation } from "@/lib/booking/types";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { formatWarsawDate, formatWarsawTime } from "@/lib/utils";

const schema = z.object({
  variantId: z.string().uuid(),
  staffId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().regex(/^[+0-9][0-9\s-]{4,20}$/, "Podaj numer telefonu."),
  customerEmail: z
    .string()
    .trim()
    .max(120, "Adres e-mail jest za długi.")
    .refine(
      (value) => value.length === 0 || z.string().email().safeParse(value).success,
      "To nie wygląda na adres e-mail. Popraw go albo zostaw pole puste.",
    )
    .transform((value) => value || null),
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

  if (!rateLimit(`book:${clientKey(await headers())}`, 12, 60 * 60 * 1000)) {
    return { ok: false, error: "Za dużo prób zapisu z tego połączenia. Spróbuj za godzinę." };
  }

  if (bookingBackend() === "unconfigured") {
    return { ok: false, error: "Rezerwacje online wymagają konfiguracji Supabase." };
  }

  const { findPublishedVariant } = await import("@/lib/cms/store");
  const match = findPublishedVariant(parsed.data.variantId);
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
  if (!slot?.available) {
    return { ok: false, error: "Ten termin nie jest już wolny. Wybierz inną godzinę." };
  }

  try {
    const { getCustomer } = await import("@/lib/account/session");
    const account = await getCustomer();
    const saved = await saveAppointment({
      serviceId: parsed.data.variantId,
      staffId: parsed.data.staffId,
      customerName: parsed.data.customerName,
      customerPhone: account?.phone && !parsed.data.customerPhone ? account.phone : parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
      customerId: account?.id ?? null,
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
    emailSent = await sendBookingMails({
      to: saved.customerEmail ?? "",
      customerName: saved.customerName,
      serviceName: match.group.name,
      startsAt: saved.startsAt,
      ics,
    });
    const { recordEvent } = await import("@/lib/analytics/store");
    recordEvent({ type: "book", path: "/rezerwacja", label: match.group.name });
    smsSent = await sendAppointmentSms(saved.customerPhone, saved.startsAt);
    const visitDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: SALON.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(saved.startsAt));
    revalidatePath("/admin/kalendarz");
    await notifyOwner({
      title: "Nowa wizyta",
      body: `${saved.customerName}, ${match.group.name}, ${formatWarsawDate(saved.startsAt)} ${formatWarsawTime(saved.startsAt)}`,
      url: `/admin/kalendarz?date=${visitDate}`,
      id: saved.id,
    });

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
