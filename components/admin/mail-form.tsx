"use client";

import { saveMails } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { brandedHtml, fillMail, type MailTemplates } from "@/lib/booking/mail-copy";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import { useState } from "react";

const sample = {
  imie: "Anna",
  usluga: "Szycie siwizny",
  termin: "czwartek, 9 października, 12:30",
  adres: "ul. Skarpowa 24, 80-145 Gdańsk",
  telefon: "880-606-454",
  opinia: "https://maps.google.com",
};

export function MailForm({ initial }: { initial: MailTemplates }) {
  const copy = adminCopy(useWritingLocale());
  const [draft, setDraft] = useState(initial);
  const save = useSave(() => saveMails(draft));

  function set(key: keyof MailTemplates, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={save.onSubmit} className="grid gap-6">
      <AdminPageHeader title={copy.mailTitle} text={copy.mailText} />
      <MailCard title={copy.toClient} subjectLabel={copy.subject} bodyLabel={copy.body} subject={draft.emailClientSubject} body={draft.emailClientBody} onSubject={(value) => set("emailClientSubject", value)} onBody={(value) => set("emailClientBody", value)} />
      <MailCard title={copy.toSalon} subjectLabel={copy.subject} bodyLabel={copy.body} subject={draft.emailSalonSubject} body={draft.emailSalonBody} onSubject={(value) => set("emailSalonSubject", value)} onBody={(value) => set("emailSalonBody", value)} />
      <MailCard title={copy.reminder} subjectLabel={copy.subject} bodyLabel={copy.body} subject={draft.emailReminderSubject} body={draft.emailReminderBody} onSubject={(value) => set("emailReminderSubject", value)} onBody={(value) => set("emailReminderBody", value)} />
      <MailCard title={copy.reviewMail} subjectLabel={copy.subject} bodyLabel={copy.body} subject={draft.emailReviewSubject} body={draft.emailReviewBody} onSubject={(value) => set("emailReviewSubject", value)} onBody={(value) => set("emailReviewBody", value)} />
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}

function MailCard({
  title,
  subjectLabel,
  bodyLabel,
  subject,
  body,
  onSubject,
  onBody,
}: {
  title: string;
  subjectLabel: string;
  bodyLabel: string;
  subject: string;
  body: string;
  onSubject: (value: string) => void;
  onBody: (value: string) => void;
}) {
  const facts = {
    imie: sample.imie,
    usluga: sample.usluga,
    termin: sample.termin,
    adres: sample.adres,
    telefon: sample.telefon,
    opinia: body.includes("{opinia}") ? sample.opinia : undefined,
  };
  const preview = brandedHtml(fillMail(body, sample), facts);
  return (
    <section className="grid gap-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-pink-100 lg:grid-cols-2">
      <div className="grid gap-3">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <Field label={subjectLabel}>
          <input className={fieldClass} value={subject} onChange={(event) => onSubject(event.target.value)} />
        </Field>
        <Field label={bodyLabel}>
          <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => onBody(event.target.value)} />
        </Field>
      </div>
      <div className="overflow-hidden rounded-[1.25rem] bg-blush">
        <p className="px-4 pt-3 text-xs font-semibold tracking-wide text-mauve uppercase">{fillMail(subject, sample)}</p>
        <iframe title={title} className="h-[720px] w-full bg-transparent" srcDoc={preview} />
      </div>
    </section>
  );
}
