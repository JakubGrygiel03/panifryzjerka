import { mkdir, rename, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findVariant, SERVICE_CATALOG } from "@/lib/booking/catalog";
import type { ServiceGroup } from "@/lib/booking/types";
import { FAQ } from "@/lib/content/guides";
import type { HomeSection } from "@/lib/cms/section-types";
import type { DeviceVisibility } from "@/lib/cms/devices";
import type { ComparisonPair } from "@/lib/cms/showcase-types";
import { DEFAULT_LENGTH_GUIDE, LENGTH_ORDER, type LengthGuide, type LengthGuideItem } from "@/lib/content/length-guide";
import type { OpeningHour, Review, SalonContent, SalonSettings } from "@/lib/content/types";

const FILE = path.join(process.cwd(), "data", "cms.json");

export type FaqItem = { q: string; a: string };
export type PricePatch = { priceCents: number; durationMinutes: number };

type CmsFile = {
  settings?: Partial<SalonSettings>;
  prices?: Record<string, PricePatch>;
  reviews?: Review[];
  faq?: FaqItem[];
  sections?: HomeSection[];
  heroSlides?: string[];
  heroDevices?: Record<string, DeviceVisibility>;
  comparisons?: ComparisonPair[];
  lengthGuide?: { note?: string; items?: Partial<LengthGuideItem>[] };
};

function readFile(): CmsFile {
  if (!existsSync(FILE)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(FILE, "utf8"));
    return parsed && typeof parsed === "object" ? (parsed as CmsFile) : {};
  } catch {
    return {};
  }
}

export async function writeCms(next: CmsFile) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(next, null, 2), "utf8");
  await rename(temp, FILE);
}

export function readCms(): CmsFile {
  return readFile();
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function clampDecimal(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number * 10) / 10));
}

export function applyCms(content: SalonContent): SalonContent {
  const cms = readFile();
  const settings = { ...content.settings, ...(cms.settings ?? {}) };
  if (!Array.isArray(settings.openingHours) || settings.openingHours.length === 0) {
    settings.openingHours = content.settings.openingHours;
  }
  settings.googleRating = clampDecimal(settings.googleRating, 0, 5, content.settings.googleRating);
  settings.googleReviewCount = clamp(settings.googleReviewCount, 0, 100000, content.settings.googleReviewCount);
  settings.noticeEnabled = Boolean(settings.noticeEnabled);
  settings.noticeText = String(settings.noticeText ?? "");
  settings.phone = String(settings.phone || content.settings.phone);

  return {
    ...content,
    settings,
    services: applyPrices(content.services, cms.prices ?? {}).filter((service) => service.category !== "Paznokcie & Rzęsy"),
    reviews: cleanReviews(cms.reviews) ?? content.reviews,
  };
}

export function applyPrices(services: ServiceGroup[], prices: Record<string, PricePatch>): ServiceGroup[] {
  return services.map((group) => ({
    ...group,
    variants: group.variants.map((variant) => {
      const patch = prices[variant.id];
      if (!patch) return variant;
      return {
        ...variant,
        priceCents: clamp(patch.priceCents, 0, 500_000, variant.priceCents),
        durationMinutes: clamp(patch.durationMinutes, 5, 600, variant.durationMinutes),
      };
    }),
  }));
}

function cleanReviews(reviews: Review[] | undefined): Review[] | null {
  if (!reviews?.length) return null;
  const clean = reviews
    .map((review) => ({
      name: String(review.name ?? "").trim(),
      service: String(review.service ?? "").trim(),
      text: String(review.text ?? "").trim(),
    }))
    .filter((review) => review.name && review.text);
  return clean.length ? clean : null;
}

function textOr(value: unknown, fallback: string, max: number) {
  const text = String(value ?? "").trim().slice(0, max);
  return text || fallback;
}

export function getLengthGuide(): LengthGuide {
  const saved = readFile().lengthGuide;
  const items = LENGTH_ORDER.map((id) => {
    const fallback = DEFAULT_LENGTH_GUIDE.items.find((item) => item.id === id) as LengthGuideItem;
    const row = saved?.items?.find((item) => item?.id === id);
    return {
      id,
      title: textOr(row?.title, fallback.title, 40),
      mark: textOr(row?.mark, fallback.mark, 40),
      hint: textOr(row?.hint, fallback.hint, 180),
    };
  });
  return { note: textOr(saved?.note, DEFAULT_LENGTH_GUIDE.note, 240), items };
}

export function getFaqItems(): FaqItem[] {
  const saved = readFile().faq;
  if (!saved?.length) return FAQ.map((item) => ({ q: item.q, a: item.a }));
  const clean = saved
    .map((item) => ({ q: String(item.q ?? "").trim(), a: String(item.a ?? "").trim() }))
    .filter((item) => item.q && item.a);
  return clean.length ? clean : FAQ.map((item) => ({ q: item.q, a: item.a }));
}

export function findPublishedVariant(variantId: string) {
  const prices = readFile().prices ?? {};
  const match = findVariant(variantId);
  if (!match) return undefined;
  const patch = prices[variantId];
  if (!patch) return match;
  return {
    group: match.group,
    variant: {
      ...match.variant,
      priceCents: clamp(patch.priceCents, 0, 500_000, match.variant.priceCents),
      durationMinutes: clamp(patch.durationMinutes, 5, 600, match.variant.durationMinutes),
    },
  };
}

export function currentPrices(): Record<string, PricePatch> {
  const saved = readFile().prices ?? {};
  const prices: Record<string, PricePatch> = {};
  for (const group of SERVICE_CATALOG) {
    for (const variant of group.variants) {
      const patch = saved[variant.id];
      prices[variant.id] = {
        priceCents: clamp(patch?.priceCents, 0, 500_000, variant.priceCents),
        durationMinutes: clamp(patch?.durationMinutes, 5, 600, variant.durationMinutes),
      };
    }
  }
  return prices;
}

export function phoneHref(display: string) {
  const digits = display.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("48")) return `tel:+${digits}`;
  return `tel:+48${digits}`;
}

export function openingHoursOr(hours: OpeningHour[] | undefined, fallback: OpeningHour[]) {
  if (!hours?.length) return fallback;
  return hours.map((row) => ({ day: String(row.day ?? ""), hours: String(row.hours ?? "") }));
}
