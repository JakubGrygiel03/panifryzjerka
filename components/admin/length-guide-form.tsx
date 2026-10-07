"use client";

import { useState } from "react";
import { saveLengthGuide } from "@/actions/cms-admin";
import { SaveBar, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import type { LengthGuide, LengthGuideItem } from "@/lib/content/length-guide";

const inputClass = "mt-1 w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-berry";

function ruItems(guide: LengthGuide): LengthGuideItem[] {
  return guide.items.map((item) => {
    const ru = guide.ru?.items.find((row) => row.id === item.id);
    return { id: item.id, title: ru?.title ?? "", mark: ru?.mark ?? "", hint: ru?.hint ?? "" };
  });
}

export function LengthGuideForm({ guide }: { guide: LengthGuide }) {
  const locale = useWritingLocale();
  const [draft, setDraft] = useState<LengthGuide>({ ...guide, ru: guide.ru ?? { note: "", items: ruItems(guide) } });
  const save = useSave(() => saveLengthGuide(draft, locale));
  const shown = locale === "RU" ? (draft.ru ?? { note: "", items: ruItems(draft) }) : draft;

  function setNote(value: string) {
    setDraft((current) => (locale === "RU"
      ? { ...current, ru: { note: value, items: current.ru?.items ?? ruItems(current) } }
      : { ...current, note: value }));
  }

  function setItem(index: number, key: "title" | "mark" | "hint", value: string) {
    setDraft((current) => {
      if (locale !== "RU") {
        return { ...current, items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)) };
      }
      const items = (current.ru?.items ?? ruItems(current)).map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item));
      return { ...current, ru: { note: current.ru?.note ?? "", items } };
    });
  }

  return (
    <form onSubmit={save.onSubmit} className="mb-10 rounded-3xl bg-white p-5 ring-1 ring-pink-100 sm:p-6">
      <h2 className="font-display text-2xl text-ink">Szablon długości włosów</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">
        Klientka nie mierzy centymetrów. Wpisz, gdzie kończą się rozpuszczone włosy. Ten opis widać przy cenniku i w rezerwacji.
      </p>
      <label className="mt-4 block text-sm font-medium text-ink">
        Zdanie na górze
        <textarea className={inputClass} rows={2} value={shown.note} placeholder={locale === "RU" ? draft.note : undefined} onChange={(event) => setNote(event.target.value)} />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {draft.items.map((item, index) => {
          const row = shown.items[index] ?? item;
          return (
          <fieldset key={item.id} className="rounded-2xl bg-blush p-4">
            <legend className="px-1 text-sm font-semibold text-berry">{(locale === "RU" ? row.title || item.title : item.title) || "Długość"}</legend>
            <label className="mt-2 block text-sm font-medium text-ink">
              Nazwa
              <input className={inputClass} value={row.title} placeholder={locale === "RU" ? item.title : undefined} onChange={(event) => setItem(index, "title", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              Gdzie kończą się włosy
              <input className={inputClass} value={row.mark} placeholder={locale === "RU" ? item.mark : undefined} onChange={(event) => setItem(index, "mark", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              Opis dla klientki
              <textarea className={inputClass} rows={3} value={row.hint} placeholder={locale === "RU" ? item.hint : undefined} onChange={(event) => setItem(index, "hint", event.target.value)} />
            </label>
          </fieldset>
          );
        })}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
