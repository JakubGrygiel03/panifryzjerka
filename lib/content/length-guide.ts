import type { HairLength } from "@/lib/booking/types";

export type LengthGuideItem = {
  id: HairLength;
  title: string;
  mark: string;
  hint: string;
};

export type LengthGuide = {
  note: string;
  items: LengthGuideItem[];
  ru?: { note: string; items: LengthGuideItem[] };
};

export const LENGTH_ORDER: HairLength[] = ["short", "medium", "long", "very_long"];

export const DEFAULT_LENGTH_GUIDE: LengthGuide = {
  note: "Sucha, rozpuszczona długość. Nie mierzymy linijką — liczy się, gdzie kończą się włosy.",
  items: [
    {
      id: "short",
      title: "Krótkie",
      mark: "Nad ramionami",
      hint: "Końce nie sięgają ramion. Włosy kończą się przy szyi albo brodzie.",
    },
    {
      id: "medium",
      title: "Średnie",
      mark: "Do łopatek",
      hint: "Końce leżą na ramionach albo tuż pod nimi, najwyżej do łopatek.",
    },
    {
      id: "long",
      title: "Długie",
      mark: "Do biustu",
      hint: "Końce schodzą poniżej łopatek i sięgają linii biustu.",
    },
    {
      id: "very_long",
      title: "Bardzo długie",
      mark: "Poniżej biustu",
      hint: "Końce są poniżej biustu, do pasa i dalej.",
    },
  ],
};

export function lengthItem(guide: LengthGuide, id: HairLength) {
  return guide.items.find((item) => item.id === id) ?? DEFAULT_LENGTH_GUIDE.items.find((item) => item.id === id)!;
}
