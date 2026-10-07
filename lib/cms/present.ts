import type { HomeSection } from "@/lib/cms/section-types";
import type { FaqItem } from "@/lib/cms/store";
import type { ComparisonPair } from "@/lib/cms/showcase-types";
import type { LengthGuide } from "@/lib/content/length-guide";
import type { OpeningHour, Review, SalonSettings } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

export function pick(locale: Locale, pl: string, ru?: string) {
  if (locale === "RU" && ru?.trim()) return ru.trim();
  return pl;
}

export function presentSection(section: HomeSection, locale: Locale): HomeSection {
  if (locale !== "RU") return section;
  return {
    ...section,
    eyebrow: pick(locale, section.eyebrow, section.ru?.eyebrow),
    title: pick(locale, section.title, section.ru?.title),
    body: pick(locale, section.body, section.ru?.body),
  };
}

export function presentFaq(item: FaqItem, locale: Locale): FaqItem {
  if (locale !== "RU") return item;
  return { ...item, q: pick(locale, item.q, item.ru?.q), a: pick(locale, item.a, item.ru?.a) };
}

export function presentReview(review: Review, locale: Locale): Review {
  if (locale !== "RU") return review;
  return {
    ...review,
    service: pick(locale, review.service, review.ru?.service),
    text: pick(locale, review.text, review.ru?.text),
  };
}

export function presentComparison(item: ComparisonPair, locale: Locale): ComparisonPair {
  if (locale !== "RU") return item;
  return { ...item, title: pick(locale, item.title, item.ru?.title), text: pick(locale, item.text, item.ru?.text) };
}

export function presentLengthGuide(guide: LengthGuide, locale: Locale): LengthGuide {
  if (locale !== "RU") return guide;
  return {
    note: pick(locale, guide.note, guide.ru?.note),
    items: guide.items.map((item) => {
      const ru = guide.ru?.items.find((row) => row.id === item.id);
      return {
        ...item,
        title: pick(locale, item.title, ru?.title),
        mark: pick(locale, item.mark, ru?.mark),
        hint: pick(locale, item.hint, ru?.hint),
      };
    }),
  };
}

export function presentHours(hours: OpeningHour[], locale: Locale): OpeningHour[] {
  if (locale !== "RU") return hours;
  return hours.map((row) => ({
    ...row,
    day: pick(locale, row.day, row.dayRu),
    hours: pick(locale, row.hours, row.hoursRu),
  }));
}

export function presentSettings(settings: SalonSettings, locale: Locale): SalonSettings {
  if (locale !== "RU") return settings;
  return {
    ...settings,
    noticeText: pick(locale, settings.noticeText, settings.noticeTextRu),
    openingHours: presentHours(settings.openingHours, locale),
  };
}
