"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { saveShowcase } from "@/actions/cms-admin";
import { DeviceToggles } from "@/components/admin/device-toggles";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { ImageField, PhotoGrid } from "@/components/admin/media-library";
import { ALL_DEVICES } from "@/lib/cms/devices";
import type { ComparisonPair, HeroSlide } from "@/lib/cms/showcase-types";
import type { MediaRef } from "@/lib/media/paths";
import { useWritingLocale } from "@/components/admin/writing-locale";

export function ShowcaseForm({
  hero,
  comparisons,
  media,
}: {
  hero: HeroSlide[];
  comparisons: ComparisonPair[];
  media: MediaRef[];
}) {
  const locale = useWritingLocale();
  const [slides, setSlides] = useState(hero);
  const [pairs, setPairs] = useState(comparisons);
  const [library, setLibrary] = useState(media);
  const save = useSave(() =>
    saveShowcase({
      heroSlides: slides.map((slide) => slide.src),
      heroDevices: Object.fromEntries(slides.map((slide) => [slide.src, slide.devices])),
      comparisons: pairs,
    }, locale),
  );
  const fallback = library[0]?.src ?? "/salon/biz-11.jpg";

  function addSlide(src: string) {
    if (!src || slides.some((slide) => slide.src === src) || slides.length >= 12) return;
    setSlides((current) => [...current, { src, devices: { ...ALL_DEVICES } }]);
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= slides.length) return;
    const copy = [...slides];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setSlides(copy);
  }

  function patchPair(id: string, change: Partial<ComparisonPair>) {
    setPairs((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)));
  }

  function editPair(id: string, key: "title" | "text", value: string) {
    setPairs((current) => current.map((item) => {
      if (item.id !== id) return item;
      if (locale !== "RU") return { ...item, [key]: value };
      return { ...item, ru: { title: item.ru?.title ?? "", text: item.ru?.text ?? "", [key]: value } };
    }));
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader
        title="Pokaz"
        text="Tu decydujesz, które zdjęcia zmieniają się w wejściu strony i które pary przed/po widać w metamorfozach. Każdy plik jest w bibliotece tylko raz."
      />

      <section className="max-w-3xl rounded-[1.75rem] bg-white p-6 ring-1 ring-pink-100">
        <h2 className="font-display text-3xl text-ink">Wejście strony</h2>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          Zdjęcia zmieniają się same co kilka sekund. Wybieraj kadry bez napisu na fotografii — hasztagi i podpisy zostaw poza tym miejscem.
        </p>
        <ul className="mt-4 grid gap-3">
          {slides.map((slide, index) => (
            <li key={`${slide.src}-${index}`} className="overflow-hidden rounded-2xl bg-blush">
              <div className="relative aspect-[4/3] w-full bg-white">
                <Image src={slide.src} alt={`Zdjęcie ${index + 1}`} fill sizes="(min-width: 768px) 640px, 100vw" quality={60} className="object-cover" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <p className="text-sm font-semibold text-ink">Zdjęcie {index + 1}</p>
                <DeviceToggles
                  value={slide.devices}
                  onChange={(devices) => setSlides((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, devices } : item)))}
                />
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Wyżej" onClick={() => moveSlide(index, -1)} className="rounded-full p-1 hover:bg-white">
                    <ChevronUp size={16} />
                  </button>
                  <button type="button" aria-label="Niżej" onClick={() => moveSlide(index, 1)} className="rounded-full p-1 hover:bg-white">
                    <ChevronDown size={16} />
                  </button>
                  <button type="button" className="ml-1 text-sm font-semibold text-berry" onClick={() => setSlides((current) => current.filter((_, item) => item !== index))}>
                    Usuń
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium text-ink">Dodaj zdjęcie do wejścia</p>
        <PhotoGrid options={library} disabled={slides.map((slide) => slide.src)} onSelect={addSlide} />
      </section>

      <section className="mt-6 max-w-3xl">
        <h2 className="font-display text-3xl text-ink">Przed i po</h2>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          Każda para to dwa pliki: stan przed i stan po, plus krótki opis. Lewa strona suwaka pokazuje „przed”, prawa „po”. Ten sam plik po obu stronach zostaje rozcięty na pół.
        </p>
        <ul className="mt-4 grid gap-4">
          {pairs.map((pair) => (
            <li key={pair.id} className="grid gap-3 rounded-[1.75rem] bg-white p-5 ring-1 ring-pink-100">
              <Field label="Nazwa zabiegu">
                <input className={fieldClass} value={locale === "RU" ? (pair.ru?.title ?? "") : pair.title} placeholder={locale === "RU" ? pair.title : undefined} onChange={(event) => editPair(pair.id, "title", event.target.value)} />
              </Field>
              <Field label="Opis">
                <textarea className={fieldClass} rows={3} value={locale === "RU" ? (pair.ru?.text ?? "") : pair.text} placeholder={locale === "RU" ? pair.text : undefined} onChange={(event) => editPair(pair.id, "text", event.target.value)} />
              </Field>
              <ImageField
                label="Zdjęcie przed"
                value={pair.before}
                options={library}
                allowEmpty={false}
                onChange={(src) => patchPair(pair.id, { before: src })}
                onUploaded={(item) => {
                  setLibrary((current) => (current.some((row) => row.src === item.src) ? current : [...current, item]));
                  patchPair(pair.id, { before: item.src });
                }}
              />
              <p className="-mt-2 text-xs font-semibold text-mauve">To zdjęcie jest stanem przed.</p>
              <ImageField
                label="Zdjęcie po"
                value={pair.after}
                options={library}
                allowEmpty={false}
                onChange={(src) => patchPair(pair.id, { after: src })}
                onUploaded={(item) => {
                  setLibrary((current) => (current.some((row) => row.src === item.src) ? current : [...current, item]));
                  patchPair(pair.id, { after: item.src });
                }}
              />
              <p className="-mt-2 text-xs font-semibold text-mauve">To zdjęcie jest stanem po.</p>
              <button type="button" className="justify-self-start text-sm font-semibold text-berry" onClick={() => setPairs((current) => current.filter((item) => item.id !== pair.id))}>
                Usuń parę
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-ink"
          onClick={() =>
            setPairs((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                title: "Nowa metamorfoza",
                text: "",
                before: fallback,
                after: library[1]?.src ?? fallback,
                beforeSide: "right",
              },
            ])
          }
        >
          Dodaj parę przed i po
        </button>
      </section>

      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
