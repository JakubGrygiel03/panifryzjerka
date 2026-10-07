export const SECTION_TYPES = [
  "hero",
  "promo",
  "cennik",
  "metamorfozy",
  "zespol",
  "zapis",
  "szycie",
  "pielegnacja",
  "pytania",
  "opinie",
  "dojazd",
  "tekst",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

import type { DeviceVisibility } from "@/lib/cms/devices";

export type SectionCopy = { eyebrow: string; title: string; body: string };

export type HomeSection = {
  id: string;
  type: SectionType;
  enabled: boolean;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  devices?: DeviceVisibility;
  ru?: SectionCopy;
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Wejście",
  promo: "Promocje",
  cennik: "Cennik",
  metamorfozy: "Metamorfozy",
  zespol: "Zespół",
  zapis: "Jak wygląda zapis",
  szycie: "Techniki",
  pielegnacja: "Przed i po zabiegu",
  pytania: "Pytania",
  opinie: "Opinie",
  dojazd: "Dojazd",
  tekst: "Własna sekcja",
};

export function defaultSections(): HomeSection[] {
  const rows: Omit<HomeSection, "image">[] = [
    { id: "hero", type: "hero", enabled: true, eyebrow: "Gdańsk", title: "Twój rodzinny salon fryzjerski w Gdańsku", body: "Mistrzowska koloryzacja, szycie siwizny i afroloki — w ciepłej, rodzinnej atmosferze." },
    { id: "promo", type: "promo", enabled: true, eyebrow: "", title: "Promocje", body: "" },
    { id: "cennik", type: "cennik", enabled: true, eyebrow: "Usługi", title: "Cennik", body: "" },
    { id: "metamorfozy", type: "metamorfozy", enabled: true, eyebrow: "Prace salonu", title: "Metamorfozy", body: "Szycie siwizny, koloryzacja, strzyżenie i trwała — prace Pani Iryny. Suwakiem porównasz stan przed zabiegiem i po nim." },
    { id: "zespol", type: "zespol", enabled: true, eyebrow: "Salon", title: "Pani Iryna i pies Bella", body: "" },
    { id: "zapis", type: "zapis", enabled: true, eyebrow: "Rezerwacja", title: "Jak wygląda zapis", body: "" },
    { id: "szycie", type: "szycie", enabled: true, eyebrow: "", title: "Techniki", body: "" },
    { id: "pielegnacja", type: "pielegnacja", enabled: true, eyebrow: "", title: "Przed wizytą i po zabiegu", body: "" },
    { id: "pytania", type: "pytania", enabled: true, eyebrow: "", title: "Pytania", body: "" },
    { id: "opinie", type: "opinie", enabled: true, eyebrow: "Goście", title: "Opinie", body: "" },
    { id: "dojazd", type: "dojazd", enabled: true, eyebrow: "Dojazd", title: "ul. Skarpowa 24", body: "Bezpłatny parking jest przy budynku. Wjazd dla wózka jest na miejscu." },
  ];
  return rows.map((row) => ({ ...row, image: "" }));
}
