import { SALON } from "@/lib/brand";
import { staffName } from "@/lib/booking/catalog";
import { brandedHtml, fillMail, mailTemplates, type MailFacts, type MailKind } from "@/lib/booking/mail-copy";
import { adminEmail } from "@/lib/account/session";
import { readCms } from "@/lib/cms/store";
import { formatWarsawDate, formatWarsawTime } from "@/lib/utils";

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(input: {
  id: string;
  serviceName: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
}): string {
  const summary = `${input.serviceName} — ${SALON.name}`;
  const description = `${staffName(input.staffId)} · ${SALON.addressLabel}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PaniFryzjerka//Rezerwacje//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.id}@panifryzjerka.pl`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(input.startsAt)}`,
    `DTEND:${icsStamp(input.endsAt)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(`${SALON.street}, ${SALON.postalCode} ${SALON.city}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(input: {
  serviceName: string;
  startsAt: string;
  endsAt: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${input.serviceName} — ${SALON.name}`,
    dates: `${icsStamp(input.startsAt)}/${icsStamp(input.endsAt)}`,
    location: `${SALON.street}, ${SALON.postalCode} ${SALON.city}`,
    details: `${SALON.addressLabel}. Tel. ${SALON.phoneDisplay}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function postMail(input: { to: string; subject: string; html: string; ics?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !input.to) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "PaniFryzjerka <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
      attachments: input.ics
        ? [{ filename: "wizyta.ics", content: Buffer.from(input.ics, "utf8").toString("base64") }]
        : undefined,
    }),
  });
  return response.ok;
}

export async function sendFilledMail(input: { to: string; subject: string; body: string; facts?: MailFacts }) {
  return postMail({ to: input.to, subject: input.subject, html: brandedHtml(input.body, input.facts) });
}

export async function sendBookingMails(input: {
  to: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  startsAt: string;
  ics: string;
}): Promise<boolean> {
  const templates = mailTemplates(readCms().settings);
  const values = {
    imie: input.customerName,
    usluga: input.serviceName,
    termin: `${formatWarsawDate(input.startsAt)}, ${formatWarsawTime(input.startsAt)}`,
    adres: `${SALON.street}, ${SALON.postalCode} ${SALON.city}`,
    telefon: SALON.phoneDisplay,
  };
  const salonValues = {
    ...values,
    telefon: input.customerPhone,
    mail: input.to || "nie podano",
  };
  const clientOk = await postMail({
    to: input.to,
    subject: fillMail(templates.emailClientSubject, values),
    html: brandedHtml(fillMail(templates.emailClientBody, values), values),
    ics: input.ics,
  });
  await postMail({
    to: adminEmail(),
    subject: fillMail(templates.emailSalonSubject, salonValues),
    html: brandedHtml(fillMail(templates.emailSalonBody, salonValues), salonValues),
  });
  return clientOk;
}

export function mailPreview(kind: MailKind, templates = mailTemplates(readCms().settings)) {
  const values = {
    imie: "Anna",
    usluga: "Szycie siwizny",
    termin: "czwartek, 12:30",
    adres: `${SALON.street}, ${SALON.postalCode} ${SALON.city}`,
    telefon: kind === "salon" ? "500 600 700" : SALON.phoneDisplay,
    mail: kind === "salon" ? "anna@example.com" : "",
    opinia: SALON.reviewsUrl,
  };
  const subject = kind === "salon" ? templates.emailSalonSubject : kind === "reminder" ? templates.emailReminderSubject : kind === "review" ? templates.emailReviewSubject : templates.emailClientSubject;
  const body = kind === "salon" ? templates.emailSalonBody : kind === "reminder" ? templates.emailReminderBody : kind === "review" ? templates.emailReviewBody : templates.emailClientBody;
  return { subject: fillMail(subject, values), html: brandedHtml(fillMail(body, values), values) };
}

export async function sendAppointmentSms(phone: string, startsAt: string): Promise<boolean> {
  const token = process.env.SMSAPI_TOKEN;
  if (!token) return false;
  const when = `${formatWarsawDate(startsAt)} ${formatWarsawTime(startsAt)}`;
  const message = `${SALON.name}: wizyta ${when}, ${SALON.street}, ${SALON.city}. Do zobaczenia!`;
  const body = new URLSearchParams({
    to: phone.replace(/[^\d+]/g, ""),
    message,
    format: "json",
    from: process.env.SMSAPI_FROM ?? "PaniFryzjer",
  });
  const response = await fetch("https://api.smsapi.pl/sms.do", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return response.ok;
}

