"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Monitor, Smartphone, Tablet } from "lucide-react";
import { saveSections } from "@/actions/cms-admin";
import { DeviceToggles } from "@/components/admin/device-toggles";
import { AdminPageHeader, Field, SaveBar, fieldClass, useSave } from "@/components/admin/editor";
import { ALL_DEVICES } from "@/lib/cms/devices";
import { ImageField } from "@/components/admin/media-library";
import { SECTION_LABELS, type HomeSection, type SectionType } from "@/lib/cms/section-types";

const SECTION_LABELS_RU: Record<SectionType, string> = {
  hero: "Шапка",
  promo: "Акции",
  cennik: "Прайс",
  metamorfozy: "Преображения",
  zespol: "Команда",
  zapis: "Как проходит запись",
  szycie: "Техники",
  pielegnacja: "До и после процедуры",
  pytania: "Вопросы",
  opinie: "Отзывы",
  dojazd: "Как добраться",
  tekst: "Свой блок",
};
import type { MediaRef } from "@/lib/media/paths";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";

export function LayoutEditor({ initial, media }: { initial: HomeSection[]; media: MediaRef[] }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const [sections, setSections] = useState(initial);
  const [library, setLibrary] = useState(media);
  const [openId, setOpenId] = useState<string | null>(initial[0]?.id ?? null);
  const [preview, setPreview] = useState<"phone" | "tablet" | "desktop">("desktop");
  const save = useSave(() => saveSections(sections, locale));

  function editCopy(id: string, key: "eyebrow" | "title" | "body", value: string) {
    setSections((current) => current.map((item) => {
      if (item.id !== id) return item;
      if (locale !== "RU") return { ...item, [key]: value };
      return { ...item, ru: { eyebrow: item.ru?.eyebrow ?? "", title: item.ru?.title ?? "", body: item.ru?.body ?? "", [key]: value } };
    }));
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setSections(copy);
  }

  function patch(id: string, change: Partial<HomeSection>) {
    setSections((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)));
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader
        title={copy.layoutTitle}
        text={copy.layoutText}
      />
      <div className="mb-6 max-w-3xl rounded-[1.75rem] bg-white p-4 ring-1 ring-pink-100">
        <p className="text-sm font-semibold text-ink">{locale === "RU" ? "Просмотр сайта" : "Podgląd strony"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["phone", locale === "RU" ? "Телефон" : "Telefon", Smartphone],
            ["tablet", "Tablet", Tablet],
            ["desktop", locale === "RU" ? "Компьютер" : "Komputer", Monitor],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setPreview(id)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${preview === id ? "bg-berry text-white" : "bg-blush text-ink"}`}>
              <Icon size={14} aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div className={`mt-4 overflow-hidden rounded-2xl bg-blush ${preview === "desktop" ? "" : "mx-auto"}`} style={{ width: preview === "phone" ? 390 : preview === "tablet" ? 768 : "100%", maxWidth: "100%" }}>
          <iframe title="Podgląd strony salonu" src="/" className="h-[32rem] w-full bg-white" />
        </div>
      </div>
      <button
        type="button"
        className="mb-4 inline-flex rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white"
        onClick={() => {
          const id = crypto.randomUUID();
          setSections((current) => [...current, { id, type: "tekst", enabled: true, eyebrow: "", title: "Nowa sekcja", body: "", image: "", devices: { ...ALL_DEVICES } }]);
          setOpenId(id);
        }}
      >
        {copy.addSection}
      </button>
      <ul className="grid max-w-3xl gap-3">
        {sections.map((section, index) => {
          const open = openId === section.id;
          return (
            <li key={section.id} className={`rounded-[1.75rem] bg-white ring-1 ring-pink-100 ${section.enabled ? "" : "opacity-70"}`}>
              <div className="flex items-center gap-2 px-4 py-3">
                <GripVertical size={16} className="text-mauve" aria-hidden />
                <button type="button" className="min-w-0 flex-1 text-left text-sm font-semibold" onClick={() => setOpenId(open ? null : section.id)}>
                  {section.type === "tekst" ? (locale === "RU" ? section.ru?.title || section.title : section.title) || (locale === "RU" ? "Свой блок" : "Własna sekcja") : (locale === "RU" ? SECTION_LABELS_RU[section.type] : SECTION_LABELS[section.type])}
                </button>
                <button type="button" aria-label="Wyżej" onClick={() => move(index, -1)} className="rounded-full p-1 text-ink hover:bg-blush">
                  <ChevronUp size={16} />
                </button>
                <button type="button" aria-label="Niżej" onClick={() => move(index, 1)} className="rounded-full p-1 text-ink hover:bg-blush">
                  <ChevronDown size={16} />
                </button>
                <button type="button" aria-label={section.enabled ? "Ukryj" : "Pokaż"} onClick={() => patch(section.id, { enabled: !section.enabled })} className={section.enabled ? "text-berry" : "text-mauve"}>
                  {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {open ? (
                <div className="grid gap-3 border-t border-pink-100 px-4 py-4">
                  <Field label="Nadtytuł">
                    <input className={fieldClass} value={locale === "RU" ? (section.ru?.eyebrow ?? "") : section.eyebrow} placeholder={locale === "RU" ? section.eyebrow : undefined} onChange={(event) => editCopy(section.id, "eyebrow", event.target.value)} />
                  </Field>
                  <Field label="Nagłówek">
                    <input className={fieldClass} value={locale === "RU" ? (section.ru?.title ?? "") : section.title} placeholder={locale === "RU" ? section.title : undefined} onChange={(event) => editCopy(section.id, "title", event.target.value)} />
                  </Field>
                  <Field label="Treść">
                    <textarea className={fieldClass} rows={4} value={locale === "RU" ? (section.ru?.body ?? "") : section.body} placeholder={locale === "RU" ? section.body : undefined} onChange={(event) => editCopy(section.id, "body", event.target.value)} />
                  </Field>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink">Gdzie widać tę sekcję</p>
                    <DeviceToggles value={section.devices ?? ALL_DEVICES} onChange={(devices) => patch(section.id, { devices })} />
                  </div>
                  {section.type === "hero" || section.type === "metamorfozy" ? (
                    <p className="text-sm leading-6 text-ink/75">
                      {section.type === "hero"
                        ? "Zdjęcia w wejściu strony ustawisz w panelu Pokaz. Wybieraj kadry bez napisu."
                        : "Pary przed i po, każde z dwóch zdjęć i opisu, ustawisz w panelu Pokaz."}
                    </p>
                  ) : (
                    <ImageField
                      value={section.image}
                      options={library}
                      onChange={(src) => patch(section.id, { image: src })}
                      onUploaded={(item) => setLibrary((current) => (current.some((row) => row.src === item.src) ? current : [...current, item]))}
                    />
                  )}
                  {section.type === "tekst" ? (
                    <button type="button" className="justify-self-start text-sm font-semibold text-berry" onClick={() => setSections((current) => current.filter((item) => item.id !== section.id))}>
                      Usuń sekcję
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
