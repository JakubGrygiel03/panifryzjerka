import { SALON, STAFF } from "@/lib/brand";
import type { HairLength, ServiceGroup, ServiceVariant, WorkingWindow } from "@/lib/booking/types";

export const CATEGORIES = [
  "Koloryzacja & #szycieSiwizny",
  "Strzyżenie & Modelowanie",
  "Afroloki",
  "Pielęgnacja",
] as const;

const LENGTHS: HairLength[] = ["short", "medium", "long", "very_long"];
const LENGTH_LABEL: Record<HairLength, string> = {
  short: "Krótkie",
  medium: "Średnie",
  long: "Długie",
  very_long: "Bardzo długie",
};

const IRYNA = STAFF.iryna.id;

let sequence = 1;

function nextVariantId(): string {
  const id = `10000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`;
  sequence += 1;
  return id;
}

function withLengths(
  id: string,
  name: string,
  category: string,
  staffIds: string[],
  prices: [number, number, number, number],
  durations: [number, number, number, number],
  highlight = false,
): ServiceGroup {
  const variants: ServiceVariant[] = LENGTHS.map((hairLength, index) => ({
    id: nextVariantId(),
    hairLength,
    label: LENGTH_LABEL[hairLength],
    durationMinutes: durations[index],
    priceCents: prices[index] * 100,
    bufferMinutes: SALON.bufferMinutes,
  }));

  return { id, name, category, highlight, staffIds, variants };
}

function single(
  id: string,
  name: string,
  category: string,
  staffIds: string[],
  price: number,
  durationMinutes: number,
): ServiceGroup {
  return {
    id,
    name,
    category,
    staffIds,
    variants: [
      {
        id: nextVariantId(),
        hairLength: null,
        label: "Standard",
        durationMinutes,
        priceCents: price * 100,
        bufferMinutes: SALON.bufferMinutes,
      },
    ],
  };
}

const color = CATEGORIES[0];
const cut = CATEGORIES[1];
const afro = CATEGORIES[2];
const care = CATEGORIES[3];

export const SERVICE_CATALOG: ServiceGroup[] = [
  withLengths("farbowanie-odrostow", "Farbowanie odrostów", color, [IRYNA], [130, 160, 190, 230], [90, 105, 120, 150]),
  withLengths("farbowanie-calosci", "Farbowanie całości", color, [IRYNA], [180, 210, 230, 280], [120, 135, 150, 180]),
  withLengths("balayage", "Balayage / Ombre", color, [IRYNA], [350, 420, 490, 560], [180, 210, 240, 270]),
  withLengths("airtouch", "Airtouch", color, [IRYNA], [750, 890, 990, 1190], [240, 270, 300, 330]),
  withLengths("szycie-siwizny", "Szycie siwizny", color, [IRYNA], [1100, 1300, 1500, 1800], [180, 210, 240, 300], true),
  withLengths("strzyzenie-damskie-modelowanie", "Strzyżenie damskie + mycie + modelowanie", cut, [IRYNA], [120, 130, 140, 150], [60, 70, 80, 90]),
  withLengths("strzyzenie-damskie-mycie", "Strzyżenie damskie + mycie", cut, [IRYNA], [100, 110, 120, 140], [45, 50, 60, 70]),
  single("strzyzenie-meskie", "Strzyżenie męskie", cut, [IRYNA], 100, 45),
  single("strzyzenie-dzieciece", "Strzyżenie dziecięce (do 12 lat)", cut, [IRYNA], 50, 30),
  single("czesanie-slubne", "Czesanie ślubne / okolicznościowe", cut, [IRYNA], 150, 90),
  single("grzywka", "Grzywka", cut, [IRYNA], 30, 15),
  withLengths("afroloki", "Afroloki", afro, [IRYNA], [360, 420, 480, 560], [180, 210, 240, 300]),
  withLengths("przedluzanie", "Przedłużanie krok po kroku", afro, [IRYNA], [250, 300, 360, 420], [120, 150, 180, 210]),
  withLengths("de-dredy", "De-dredy", afro, [IRYNA], [170, 230, 290, 350], [120, 150, 180, 240]),
  withLengths("dredy", "Dredy syntetyczne", afro, [IRYNA], [400, 480, 560, 640], [240, 270, 300, 360]),
  withLengths("cornrowy", "Cornrowy", afro, [IRYNA], [120, 150, 180, 220], [60, 75, 90, 120]),
  withLengths("mycie-modelowanie", "Mycie i modelowanie", care, [IRYNA], [70, 80, 90, 110], [40, 45, 50, 60]),
  withLengths("kuracja-regenerujaca", "Kuracja regenerująca", care, [IRYNA], [120, 140, 160, 190], [45, 50, 60, 75]),
  withLengths("rytual-pielegnacyjny", "Rytuał pielęgnacyjny", care, [IRYNA], [90, 110, 130, 150], [30, 40, 45, 60]),
];

export const DEFAULT_WORKING_HOURS: WorkingWindow[] = [
  ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek, startTime: "09:00", endTime: "20:00" })),
  { dayOfWeek: 6, startTime: "09:00", endTime: "18:00" },
];

export function allVariants() {
  return SERVICE_CATALOG.flatMap((group) =>
    group.variants.map((variant) => ({ group, variant })),
  );
}

export function findVariant(variantId: string) {
  return allVariants().find((entry) => entry.variant.id === variantId);
}

export function staffName(staffId: string): string {
  if (staffId === STAFF.iryna.id) return STAFF.iryna.name;
  return "Pani Iryna";
}
