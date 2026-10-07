import type { DeviceVisibility } from "@/lib/cms/devices";

export type HeroSlide = { src: string; devices: DeviceVisibility };

export type ComparisonSide = "left" | "right";

export type ComparisonPair = {
  id: string;
  title: string;
  text: string;
  before: string;
  after: string;
  beforeSide: ComparisonSide;
  ru?: { title: string; text: string };
};

export const DEFAULT_HERO_SLIDES = [
  "/salon/biz-11.jpg",
  "/salon/biz-04.jpg",
  "/salon/biz-02.jpg",
  "/salon/biz-12.jpg",
  "/salon/biz-07.jpg",
];

export const DEFAULT_COMPARISONS: ComparisonPair[] = [
  {
    id: "szycie",
    title: "Szycie siwizny",
    text: "Po jednej stronie widać odrost i siwiznę, po drugiej kolor po zabiegu. To dwie połówki jednego zdjęcia. W panelu możesz wgrać dwa osobne pliki: przed i po.",
    before: "/salon/biz-05.jpg",
    after: "/salon/biz-05.jpg",
    beforeSide: "right",
  },
  {
    id: "kolor",
    title: "Koloryzacja",
    text: "Róż schowany pod brązem. Suwak rozdziela jedną fotografię na stan przed i po. Dwa różne pliki zastąpią ten podział.",
    before: "/salon/inspiration-07.jpg",
    after: "/salon/inspiration-07.jpg",
    beforeSide: "left",
  },
  {
    id: "perm",
    title: "Trwała ondulacja",
    text: "Osobne zdjęcie wałków i osobne zdjęcie gotowych loków. Lewa strona suwaka to stan przed, prawa to efekt.",
    before: "/salon/perm-before.jpg",
    after: "/salon/perm-after.jpg",
    beforeSide: "right",
  },
];
