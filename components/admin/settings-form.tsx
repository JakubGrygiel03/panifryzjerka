"use client";

import { saveSettings } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import { HALF_HOURS, joinRange, splitRange } from "@/lib/booking/hours";
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
  const copy = adminCopy(locale);
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
      <AdminPageHeader title={copy.settingsTitle} text={copy.settingsText} />
      <div className="grid max-w-3xl gap-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        <Field label={copy.phone}>
          <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={noticeEnabled} onChange={(event) => setNoticeEnabled(event.target.checked)} />
          {copy.noticeToggle}
        </label>
        <Field label={copy.notice}>
          <input
            className={fieldClass}
            value={locale === "RU" ? noticeTextRu : noticeText}
            placeholder={locale === "RU" ? noticeText || "Przerwa urlopowa 10–18.08" : "Przerwa urlopowa 10–18.08"}
            onChange={(event) => (locale === "RU" ? setNoticeTextRu(event.target.value) : setNoticeText(event.target.value))}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={copy.rating}>
            <input className={fieldClass} inputMode="decimal" value={googleRating} onChange={(event) => setGoogleRating(event.target.value)} />
          </Field>
          <Field label={copy.reviewCount}>
            <input className={fieldClass} inputMode="numeric" value={googleReviewCount} onChange={(event) => setGoogleReviewCount(event.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-medium">{copy.hours}</p>
          <p className="text-sm text-mauve">{copy.hoursHint}</p>
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
              <HourRange
                value={locale === "RU" ? (row.hoursRu || row.hours) : row.hours}
                onChange={(value) =>
                  setOpeningHours((hours) => hours.map((item, itemIndex) => (itemIndex === index ? { ...item, hours: value, hoursRu: value } : item)))
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

function HourRange({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const range = splitRange(value);
  const start = range?.start ?? "closed";
  const end = range?.end ?? "20:00";
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <select
        className={fieldClass}
        value={start}
        onChange={(event) => {
          if (event.target.value === "closed") onChange("nieczynne");
          else onChange(joinRange(event.target.value, end));
        }}
      >
        <option value="closed">nieczynne</option>
        {HALF_HOURS.map((hour) => (
          <option key={`start-${hour}`}>{hour}</option>
        ))}
      </select>
      <span className="text-mauve">–</span>
      <select
        className={fieldClass}
        disabled={!range}
        value={end}
        onChange={(event) => onChange(joinRange(range?.start ?? "09:00", event.target.value))}
      >
        {HALF_HOURS.map((hour) => (
          <option key={`end-${hour}`}>{hour}</option>
        ))}
      </select>
    </div>
  );
}
