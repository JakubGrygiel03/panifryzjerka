"use client";

import { saveSettings } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import type { OpeningHour } from "@/lib/content/types";
import { useState } from "react";

type SettingsFormProps = {
  phone: string;
  noticeText: string;
  noticeTextRu?: string;
  noticeEnabled: boolean;
  googleRating: number;
  googleReviewCount: number;
  openingHours: OpeningHour[];
};

export function SettingsForm(props: SettingsFormProps) {
  const locale = useWritingLocale();
  const [phone, setPhone] = useState(props.phone);
  const [noticeText, setNoticeText] = useState(props.noticeText);
  const [noticeTextRu, setNoticeTextRu] = useState(props.noticeTextRu ?? "");
  const [noticeEnabled, setNoticeEnabled] = useState(props.noticeEnabled);
  const [googleRating, setGoogleRating] = useState(String(props.googleRating));
  const [googleReviewCount, setGoogleReviewCount] = useState(String(props.googleReviewCount));
  const [openingHours, setOpeningHours] = useState(props.openingHours);
  const save = useSave(() =>
    saveSettings({
      phone,
      noticeText,
      noticeTextRu,
      noticeEnabled,
      googleRating: Number(googleRating),
      googleReviewCount: Number(googleReviewCount),
      openingHours,
    }, locale),
  );

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader title="Ustawienia" text="Pasek na górze strony, telefon, godziny i ocena Google. To samo widzi klientka po zapisaniu." />
      <div className="grid max-w-3xl gap-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        <Field label="Telefon na stronie">
          <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={noticeEnabled} onChange={(event) => setNoticeEnabled(event.target.checked)} />
          Pokaż pasek ogłoszenia
        </label>
        <Field label="Treść paska, na przykład urlop">
          <input
            className={fieldClass}
            value={locale === "RU" ? noticeTextRu : noticeText}
            placeholder={locale === "RU" ? noticeText || "Przerwa urlopowa 10–18.08" : "Przerwa urlopowa 10–18.08"}
            onChange={(event) => (locale === "RU" ? setNoticeTextRu(event.target.value) : setNoticeText(event.target.value))}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ocena Google">
            <input className={fieldClass} inputMode="decimal" value={googleRating} onChange={(event) => setGoogleRating(event.target.value)} />
          </Field>
          <Field label="Liczba opinii">
            <input className={fieldClass} inputMode="numeric" value={googleReviewCount} onChange={(event) => setGoogleReviewCount(event.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-medium">Godziny</p>
          {openingHours.map((row, index) => (
            <div key={`${row.day}-${index}`} className="grid gap-2 sm:grid-cols-2">
              <input
                className={fieldClass}
                value={locale === "RU" ? (row.dayRu ?? "") : row.day}
                placeholder={locale === "RU" ? row.day : undefined}
                onChange={(event) =>
                  setOpeningHours((hours) => hours.map((item, itemIndex) => (itemIndex === index ? { ...item, [locale === "RU" ? "dayRu" : "day"]: event.target.value } : item)))
                }
              />
              <input
                className={fieldClass}
                value={locale === "RU" ? (row.hoursRu ?? "") : row.hours}
                placeholder={locale === "RU" ? row.hours : undefined}
                onChange={(event) =>
                  setOpeningHours((hours) => hours.map((item, itemIndex) => (itemIndex === index ? { ...item, [locale === "RU" ? "hoursRu" : "hours"]: event.target.value } : item)))
                }
              />
            </div>
          ))}
        </div>
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
