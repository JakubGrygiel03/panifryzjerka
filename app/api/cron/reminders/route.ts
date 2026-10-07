import { SALON } from "@/lib/brand";
import { listAppointments } from "@/lib/booking/repository";
import { fillMail, mailTemplates } from "@/lib/booking/mail-copy";
import { sendFilledMail } from "@/lib/booking/notifications";
import { findPublishedVariant, readCms } from "@/lib/cms/store";
import { markSent, wasSent } from "@/lib/salon/desk";
import { warsawDay } from "@/lib/salon/report";
import { addDays, formatWarsawDate, formatWarsawTime, warsawToday } from "@/lib/utils";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const today = warsawToday();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const templates = mailTemplates(readCms().settings);
  const reviewUrl = readCms().settings?.googleReviewsUrl?.trim() || SALON.reviewsUrl;
  const rows = await listAppointments();
  let reminders = 0;
  let reviews = 0;

  for (const row of rows) {
    if (row.status === "cancelled" || !row.customerEmail) continue;
    const day = warsawDay(row.startsAt);
    const kind = day === tomorrow ? "reminder" : day === yesterday ? "review" : "";
    if (!kind) continue;
    const key = `${kind}:${row.id}`;
    if (await wasSent(key)) continue;
    const service = findPublishedVariant(row.serviceId)?.group.name ?? "wizyta";
    const values = {
      imie: row.customerName,
      usluga: service,
      termin: `${formatWarsawDate(row.startsAt)}, ${formatWarsawTime(row.startsAt)}`,
      adres: `${SALON.street}, ${SALON.postalCode} ${SALON.city}`,
      telefon: SALON.phoneDisplay,
      opinia: reviewUrl,
    };
    const subject = kind === "reminder" ? templates.emailReminderSubject : templates.emailReviewSubject;
    const body = kind === "reminder" ? templates.emailReminderBody : templates.emailReviewBody;
    const sent = await sendFilledMail({
      to: row.customerEmail,
      subject: fillMail(subject, values),
      body: fillMail(body, values),
      facts: values,
    });
    if (!sent) continue;
    await markSent(key);
    if (kind === "reminder") reminders += 1;
    else reviews += 1;
  }

  return Response.json({ ok: true, reminders, reviews });
}
