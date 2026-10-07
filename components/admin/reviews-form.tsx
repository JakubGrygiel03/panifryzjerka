"use client";

import { useState } from "react";
import { saveReviews } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import type { Review } from "@/lib/content/types";

export function ReviewsForm({ reviews }: { reviews: Review[] }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const [rows, setRows] = useState(reviews);
  const save = useSave(() => saveReviews(rows, locale));

  function update(index: number, key: "name" | "service" | "text", value: string) {
    setRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      if (locale === "RU" && key !== "name") {
        return { ...row, ru: { service: row.ru?.service ?? "", text: row.ru?.text ?? "", [key]: value } };
      }
      return { ...row, [key]: value };
    }));
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader title={copy.reviewsTitle} text={copy.reviewsText} />
      <button
        type="button"
        className="mb-4 inline-flex rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white"
        onClick={() => setRows((current) => [...current, { name: "", service: "", text: "" }])}
      >
        {copy.addReview}
      </button>
      <div className="grid max-w-3xl gap-4">
        {rows.map((review, index) => (
          <section key={`${review.name}-${index}`} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Imię">
                <input className={fieldClass} value={review.name} onChange={(event) => update(index, "name", event.target.value)} />
              </Field>
              <Field label="Zabieg">
                <input
                  className={fieldClass}
                  value={locale === "RU" ? (review.ru?.service ?? "") : review.service}
                  placeholder={locale === "RU" ? review.service : undefined}
                  onChange={(event) => update(index, "service", event.target.value)}
                />
              </Field>
            </div>
            <Field label="Treść">
              <textarea
                className={fieldClass}
                rows={4}
                value={locale === "RU" ? (review.ru?.text ?? "") : review.text}
                placeholder={locale === "RU" ? review.text : undefined}
                onChange={(event) => update(index, "text", event.target.value)}
              />
            </Field>
            <button type="button" className="justify-self-start text-sm font-semibold text-berry" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
              Usuń opinię
            </button>
          </section>
        ))}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
