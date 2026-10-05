import { SALON } from "@/lib/brand";
import { staffName } from "@/lib/booking/catalog";
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

export async function sendAppointmentEmail(input: {
  to: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  startsAt: string;
  endsAt: string;
  ics: string;
  googleCalendarUrl: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !input.to) return false;

  const when = `${formatWarsawDate(input.startsAt)}, ${formatWarsawTime(input.startsAt)}`;
  const html = `
    <div style="font-family:Georgia,serif;color:#1F1A24;line-height:1.5">
      <p>Cześć ${escapeHtml(input.customerName)},</p>
      <p>wizyta w <strong>${SALON.name}</strong> jest potwierdzona.</p>
      <p><strong>${escapeHtml(input.serviceName)}</strong><br/>
      ${escapeHtml(input.staffName)}<br/>
      ${escapeHtml(when)}</p>
      <p>${SALON.street}<br/>${SALON.postalCode} ${SALON.city}<br/>
      <a href="${SALON.mapsUrl}">Otwórz w Google Maps</a></p>
      <p><a href="${input.googleCalendarUrl}">Dodaj do Kalendarza Google</a></p>
      <p>Do zobaczenia,<br/>${SALON.name}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "PaniFryzjerka <onboarding@resend.dev>",
      to: [input.to],
      subject: `Potwierdzenie wizyty — ${SALON.name}`,
      html,
      attachments: [
        {
          filename: "wizyta.ics",
          content: Buffer.from(input.ics, "utf8").toString("base64"),
        },
      ],
    }),
  });

  return response.ok;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
