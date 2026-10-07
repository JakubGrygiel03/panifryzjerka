"use client";

import { useState } from "react";
import { saveReviews } from "@/actions/cms-admin";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import type { Review } from "@/lib/content/types";

export function ReviewsForm({ reviews }: { reviews: Review[] }) {
  const [rows, setRows] = useState(reviews);
  const save = useSave(() => saveReviews(rows));

  function update(index: number, patch: Partial<Review>) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader title="Opinie" text="Cytaty na stronie głównej. Zostaw imię, zabieg i treść tak, jak mają być widoczne." />
      <div className="grid max-w-3xl gap-4">
        {rows.map((review, index) => (
          <section key={`${review.name}-${index}`} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Imię">
                <input className={fieldClass} value={review.name} onChange={(event) => update(index, { name: event.target.value })} />
              </Field>
              <Field label="Zabieg">
                <input className={fieldClass} value={review.service} onChange={(event) => update(index, { service: event.target.value })} />
              </Field>
            </div>
            <Field label="Treść">
              <textarea className={fieldClass} rows={4} value={review.text} onChange={(event) => update(index, { text: event.target.value })} />
            </Field>
            <button type="button" className="justify-self-start text-sm font-semibold text-berry" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
              Usuń opinię
            </button>
          </section>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-ink"
        onClick={() => setRows((current) => [...current, { name: "", service: "", text: "" }])}
      >
        Dodaj opinię
      </button>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
