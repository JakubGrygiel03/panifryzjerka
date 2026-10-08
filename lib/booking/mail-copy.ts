import { SALON } from "@/lib/brand";

export type MailKind = "client" | "salon" | "reminder" | "review";

export type MailTemplates = {
  emailClientSubject: string;
  emailClientBody: string;
  emailSalonSubject: string;
  emailSalonBody: string;
  emailReminderSubject: string;
  emailReminderBody: string;
  emailReviewSubject: string;
  emailReviewBody: string;
};

export const DEFAULT_MAILS: MailTemplates = {
  emailClientSubject: "Potwierdzenie wizyty — PaniFryzjerka",
  emailClientBody:
    "Cześć {imie},\n\nTwoja wizyta jest zapisana.\n\n{usluga}\n{termin}\n{adres}\nTelefon salonu: {telefon}\n\nPłatność w salonie, po zabiegu. Odwołanie zrób telefonicznie najpóźniej poprzedniego dnia.\n\nDo zobaczenia,\nPaniFryzjerka",
  emailSalonSubject: "Nowa rezerwacja — {imie}",
  emailSalonBody: "Nowa wizyta jest zapisana.\n\n{imie}\n{usluga}\n{termin}\nTelefon klientki: {telefon}\nE-mail klientki: {mail}\n\nSzczegóły są w terminarzu.",
  emailReminderSubject: "Jutro wizyta — PaniFryzjerka",
  emailReminderBody: "Cześć {imie},\n\njutro czekamy na Ciebie.\n\n{usluga}\n{termin}\n{adres}\nTel. {telefon}",
  emailReviewSubject: "Jak minęła wizyta? — PaniFryzjerka",
  emailReviewBody: "Cześć {imie},\n\ndziękujemy za wczorajszą wizytę ({usluga}). Jeśli chcesz, zostaw krótką opinię w Google.\n\n{opinia}",
};

export function mailTemplates(saved?: Partial<MailTemplates> | null): MailTemplates {
  return {
    emailClientSubject: saved?.emailClientSubject?.trim() || DEFAULT_MAILS.emailClientSubject,
    emailClientBody: saved?.emailClientBody?.trim() || DEFAULT_MAILS.emailClientBody,
    emailSalonSubject: saved?.emailSalonSubject?.trim() || DEFAULT_MAILS.emailSalonSubject,
    emailSalonBody: saved?.emailSalonBody?.trim() || DEFAULT_MAILS.emailSalonBody,
    emailReminderSubject: saved?.emailReminderSubject?.trim() || DEFAULT_MAILS.emailReminderSubject,
    emailReminderBody: saved?.emailReminderBody?.trim() || DEFAULT_MAILS.emailReminderBody,
    emailReviewSubject: saved?.emailReviewSubject?.trim() || DEFAULT_MAILS.emailReviewSubject,
    emailReviewBody: saved?.emailReviewBody?.trim() || DEFAULT_MAILS.emailReviewBody,
  };
}

export function fillMail(template: string, values: Record<string, string>) {
  return template.replace(/\{(imie|usluga|termin|adres|telefon|mail|opinia)\}/g, (token, key: string) => values[key] ?? token);
}

export type MailFacts = {
  imie?: string;
  usluga?: string;
  termin?: string;
  adres?: string;
  telefon?: string;
  mail?: string;
  opinia?: string;
};

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function telHref(display: string) {
  const digits = display.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("48")) return `tel:+${digits}`;
  if (digits.length === 9) return `tel:+48${digits}`;
  return `tel:${digits}`;
}

function isDetail(line: string, facts: MailFacts) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const exact = [facts.imie, facts.usluga, facts.termin, facts.adres, facts.telefon, facts.opinia].filter((item): item is string => Boolean(item?.trim()));
  if (exact.includes(trimmed)) return true;
  return Boolean(facts.telefon && trimmed.includes(facts.telefon) && trimmed.length < facts.telefon.length + 32);
}

function paragraphs(lines: string[]) {
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const text = current.join("\n").trim();
    if (text) blocks.push(text);
    current = [];
  };
  for (const line of lines) {
    if (!line.trim()) flush();
    else current.push(line.trim());
  }
  flush();
  return blocks;
}

function splitCopy(text: string, facts: MailFacts) {
  const before: string[] = [];
  const after: string[] = [];
  let seen = false;
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    if (isDetail(line, facts)) {
      seen = true;
      continue;
    }
    (seen ? after : before).push(line);
  }
  return { before: paragraphs(before), after: paragraphs(after) };
}

function prose(blocks: string[], lead = false) {
  return blocks
    .map((block, index) => {
      const html = esc(block).replace(/\n/g, "<br/>");
      const signOff = /^(Do zobaczenia|До встречи)/i.test(block);
      if (lead && index === 0 && block.length < 48) {
        return `<p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.15;color:#1F1A24">${html}</p>`;
      }
      if (signOff) {
        return `<p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.35;color:#C02674">${html}</p>`;
      }
      return `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1F1A24">${html}</p>`;
    })
    .join("");
}

function splitWhen(termin: string) {
  const match = termin.match(/\d{1,2}:\d{2}/);
  if (!match || match.index === undefined) return { time: "", rest: termin.trim() };
  const rest = `${termin.slice(0, match.index)} ${termin.slice(match.index + match[0].length)}`
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,\s]+|[,\s]+$/g, "");
  return { time: match[0], rest };
}

function labels(russian: boolean) {
  return russian
    ? { guest: "Клиентка", service: "Услуга", when: "Когда", place: "Адрес", phone: "Телефон", review: "Оставить отзыв в Google" }
    : { guest: "Klientka", service: "Usługa", when: "Kiedy", place: "Adres", phone: "Telefon", review: "Zostaw opinię w Google" };
}

function factRow(label: string, value: string) {
  return `<tr>
<td style="padding:11px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#C02674">${label}</td>
</tr>
<tr>
<td style="padding:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;color:#1F1A24">${value}</td>
</tr>`;
}

function nameOnOwnLine(text: string, name?: string) {
  if (!name?.trim()) return false;
  return text.replace(/\r\n/g, "\n").split("\n").some((line) => line.trim() === name.trim());
}

function visitCard(facts: MailFacts, russian: boolean, source: string) {
  if (!facts.usluga && !facts.termin && !facts.adres && !facts.telefon) return "";
  const copy = labels(russian);
  const when = splitWhen(facts.termin ?? "");
  const chip = when.time
    ? `<td width="96" valign="middle" bgcolor="#ffffff" style="width:96px;background:#ffffff;border:1px solid #F3C1D6;border-radius:18px;text-align:center;padding:18px 8px">
<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1;color:#C02674">${esc(when.time)}</p>
</td>`
    : "";
  const guest = nameOnOwnLine(source, facts.imie)
    ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C02674">${copy.guest}</p>
<p style="margin:-4px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.15;color:#1F1A24">${esc(facts.imie ?? "")}</p>`
    : "";
  const headline = [
    guest,
    facts.usluga
      ? `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C02674">${copy.service}</p>
<p style="margin:4px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.15;color:#1F1A24">${esc(facts.usluga)}</p>`
      : "",
    when.rest ? `<p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.35;color:#6E6277">${esc(when.rest)}</p>` : "",
  ].join("");
  const address = facts.adres
    ? `<a href="${esc(SALON.mapsUrl)}" style="color:#1F1A24;text-decoration:none">${esc(facts.adres)}</a>`
    : "";
  const phone = facts.telefon
    ? `<a href="${telHref(facts.telefon)}" style="color:#C02674;font-weight:bold;text-decoration:none">${esc(facts.telefon)}</a>`
    : "";
  const rows = [
    address ? factRow(copy.place, address) : "",
    phone ? factRow(copy.phone, phone) : "",
  ].join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;background:#FDF2F7;border:1px solid #F8D5E6;border-radius:22px">
<tr><td style="padding:16px 16px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
${chip}
<td valign="middle" style="padding-left:${chip ? "14px" : "0"}">${headline}</td>
</tr></table>
${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #F8D5E6">${rows}</table>` : ""}
</td></tr></table>`;
}

function reviewButton(url: string | undefined, text: string, russian: boolean) {
  if (!url || !/^https?:\/\//i.test(url) || !text.includes(url)) return "";
  const label = labels(russian).review;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 8px">
<tr><td align="center" style="padding:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:6px;color:#F59E0B">★★★★★</td></tr>
<tr><td align="center" bgcolor="#C02674" style="border-radius:999px;background:#C02674">
<a href="${esc(url)}" style="display:block;padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">${label}</a>
</td></tr></table>`;
}

function closing(blocks: string[]) {
  return blocks
    .map((block) => {
      const html = esc(block).replace(/\n/g, "<br/>");
      if (/^(Do zobaczenia|До встречи)/i.test(block)) {
        return `<p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.3;color:#C02674">${html}</p>`;
      }
      if (/płatność|оплат|odwoł|отмен/i.test(block)) {
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px"><tr><td style="padding:12px 14px;background:#FDF2F7;border-radius:14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6E6277">${html}</td></tr></table>`;
      }
      return `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1F1A24">${html}</p>`;
    })
    .join("");
}

export function brandedHtml(text: string, facts: MailFacts = {}) {
  const russian = /[А-Яа-яЁё]/.test(text);
  const { before, after } = splitCopy(text, facts);
  const lead = before[0]?.replace(/\s+/g, " ").slice(0, 90) ?? SALON.name;
  const tagline = russian ? "окрашивание · стрижка · афролоконы" : "koloryzacja · strzyżenie · afroloki";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FDF2F7">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(lead)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FDF2F7" style="background:#FDF2F7">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #F3C1D6">
<tr><td style="height:3px;background:#E7A3C4;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td align="center" bgcolor="#ffffff" style="background:#ffffff;padding:28px 28px 8px">
<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:#6E6277">${russian ? "салон" : "salon"} · Gdańsk</p>
<p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:.95;color:#9E1B5D">${SALON.name}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px auto 0"><tr><td width="52" height="2" bgcolor="#E7C98A" style="background:#E7C98A;font-size:0;line-height:0">&nbsp;</td></tr></table>
<p style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.4;color:#6E6277">${tagline}</p>
</td></tr>
<tr><td style="padding:28px 26px 8px">
${prose(before, true)}
${visitCard(facts, russian, text)}
${closing(after)}
${reviewButton(facts.opinia, text, russian)}
</td></tr>
<tr><td align="center" bgcolor="#FDF2F7" style="padding:18px 24px 22px;background:#FDF2F7;border-top:1px solid #F8D5E6;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6E6277">
${esc(SALON.street)} · ${esc(SALON.postalCode)} ${esc(SALON.city)}<br/>
<a href="${telHref(SALON.phoneDisplay)}" style="color:#C02674;font-weight:bold;text-decoration:none">${SALON.phoneDisplay}</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
