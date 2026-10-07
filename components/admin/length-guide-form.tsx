"use client";

import { useState } from "react";
import { saveLengthGuide } from "@/actions/cms-admin";
import { SaveBar, useSave } from "@/components/admin/editor";
import type { LengthGuide } from "@/lib/content/length-guide";

const inputClass = "mt-1 w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-berry";

export function LengthGuideForm({ guide }: { guide: LengthGuide }) {
  const [draft, setDraft] = useState(guide);
  const save = useSave(() => saveLengthGuide(draft));

  function setItem(index: number, key: "title" | "mark" | "hint", value: string) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  return (
    <form onSubmit={save.onSubmit} className="mb-10 rounded-3xl bg-white p-5 ring-1 ring-pink-100 sm:p-6">
      <h2 className="font-display text-2xl text-ink">Szablon długości włosów</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">
        Klientka nie mierzy centymetrów. Wpisz, gdzie kończą się rozpuszczone włosy. Ten opis widać przy cenniku i w rezerwacji.
      </p>
      <label className="mt-4 block text-sm font-medium text-ink">
        Zdanie na górze
        <textarea className={inputClass} rows={2} value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {draft.items.map((item, index) => (
          <fieldset key={item.id} className="rounded-2xl bg-blush p-4">
            <legend className="px-1 text-sm font-semibold text-berry">{item.title || "Długość"}</legend>
            <label className="mt-2 block text-sm font-medium text-ink">
              Nazwa
              <input className={inputClass} value={item.title} onChange={(event) => setItem(index, "title", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              Gdzie kończą się włosy
              <input className={inputClass} value={item.mark} onChange={(event) => setItem(index, "mark", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              Opis dla klientki
              <textarea className={inputClass} rows={3} value={item.hint} onChange={(event) => setItem(index, "hint", event.target.value)} />
            </label>
          </fieldset>
        ))}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
