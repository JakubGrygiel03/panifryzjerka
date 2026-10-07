"use client";

import { useState } from "react";
import { saveLengthGuide } from "@/actions/cms-admin";
import { SaveBar, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import { ruPhrase } from "@/lib/i18n/phrases";
import type { LengthGuide, LengthGuideItem } from "@/lib/content/length-guide";

const inputClass = "mt-1 w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-berry";

function ruItems(guide: LengthGuide): LengthGuideItem[] {
  return guide.items.map((item) => {
    const ru = guide.ru?.items.find((row) => row.id === item.id);
    return { id: item.id, title: ru?.title ?? "", mark: ru?.mark ?? "", hint: ru?.hint ?? "" };
  });
}

function shownText(locale: "PL" | "RU", ru: string, pl: string) {
  if (locale !== "RU") return pl;
  return ru.trim() || ruPhrase(pl);
}

export function LengthGuideForm({ guide }: { guide: LengthGuide }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const [draft, setDraft] = useState<LengthGuide>({ ...guide, ru: guide.ru ?? { note: "", items: ruItems(guide) } });
  const save = useSave(() => saveLengthGuide(locale === "RU" ? withRussian(draft) : draft, locale));
  const shown = locale === "RU" ? (draft.ru ?? { note: "", items: ruItems(draft) }) : draft;

  function withRussian(current: LengthGuide): LengthGuide {
    const ru = current.ru ?? { note: "", items: ruItems(current) };
    return {
      ...current,
      ru: {
        note: ru.note.trim() || ruPhrase(current.note),
        items: current.items.map((item, index) => {
          const row = ru.items[index];
          return {
            id: item.id,
            title: row?.title.trim() || ruPhrase(item.title),
            mark: row?.mark.trim() || ruPhrase(item.mark),
            hint: row?.hint.trim() || ruPhrase(item.hint),
          };
        }),
      },
    };
  }

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
      <h2 className="font-display text-2xl text-ink">{copy.lengthTemplate}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">{copy.lengthTemplateText}</p>
      <label className="mt-4 block text-sm font-medium text-ink">
        {copy.lengthSentence}
        <textarea className={inputClass} rows={2} value={shownText(locale, shown.note, draft.note)} onChange={(event) => setNote(event.target.value)} />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {draft.items.map((item, index) => {
          const row = shown.items[index] ?? item;
          return (
          <fieldset key={item.id} className="rounded-2xl bg-blush p-4">
            <legend className="px-1 text-sm font-semibold text-berry">{shownText(locale, row.title, item.title) || copy.lengthFallback}</legend>
            <label className="mt-2 block text-sm font-medium text-ink">
              {copy.lengthName}
              <input className={inputClass} value={shownText(locale, row.title, item.title)} onChange={(event) => setItem(index, "title", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              {copy.lengthWhere}
              <input className={inputClass} value={shownText(locale, row.mark, item.mark)} onChange={(event) => setItem(index, "mark", event.target.value)} />
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              {copy.lengthClient}
              <textarea className={inputClass} rows={3} value={shownText(locale, row.hint, item.hint)} onChange={(event) => setItem(index, "hint", event.target.value)} />
            </label>
          </fieldset>
          );
        })}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
