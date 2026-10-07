"use client";

import { useState } from "react";
import { saveFaq } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import type { FaqItem } from "@/lib/cms/store";

export function FaqForm({ items }: { items: FaqItem[] }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const [rows, setRows] = useState(items);
  const save = useSave(() => saveFaq(rows, locale));

  function edit(index: number, key: "q" | "a", value: string) {
    setRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      if (locale === "RU") return { ...row, ru: { q: row.ru?.q ?? "", a: row.ru?.a ?? "", [key]: value } };
      return { ...row, [key]: value };
    }));
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader title={copy.questionsTitle} text={copy.questionsText} />
      <button type="button" className="mb-4 inline-flex rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white" onClick={() => setRows((current) => [...current, { q: "", a: "" }])}>
        {copy.addQuestion}
      </button>
      <div className="grid max-w-3xl gap-4">
        {rows.map((item, index) => (
          <section key={`${item.q}-${index}`} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <Field label={copy.question}>
              <input
                className={fieldClass}
                value={locale === "RU" ? (item.ru?.q ?? "") : item.q}
                placeholder={locale === "RU" ? item.q : undefined}
                onChange={(event) => edit(index, "q", event.target.value)}
              />
            </Field>
            <Field label={copy.answer}>
              <textarea
                className={fieldClass}
                rows={4}
                value={locale === "RU" ? (item.ru?.a ?? "") : item.a}
                placeholder={locale === "RU" ? item.a : undefined}
                onChange={(event) => edit(index, "a", event.target.value)}
              />
            </Field>
            <button type="button" className="justify-self-start text-sm font-semibold text-berry" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
              {copy.removeQuestion}
            </button>
          </section>
        ))}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
