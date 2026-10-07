"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminCookieValue,
  isAdminCookieValue,
} from "@/lib/cms/session";
import { alignPair, savedMessage } from "@/lib/cms/align";
import { getHomeSections } from "@/lib/cms/sections";
import { SECTION_TYPES, type HomeSection } from "@/lib/cms/section-types";
import { galleryCatalog } from "@/lib/cms/gallery";
import { getComparisons } from "@/lib/cms/showcase";
import { isSalonImagePath } from "@/lib/media/paths";
import type { ComparisonPair } from "@/lib/cms/showcase-types";
import { getFaqItems, getLengthGuide, readCms, writeCms, type FaqItem, type PricePatch } from "@/lib/cms/store";
import { LENGTH_ORDER, type LengthGuide } from "@/lib/content/length-guide";
import type { OpeningHour, Review } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

async function requireAdmin() {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    throw new Error("Zaloguj się do panelu.");
  }
}

function publish() {
  revalidatePath("/", "layout");
  revalidatePath("/cennik");
  revalidatePath("/faq");
  revalidatePath("/metamorfozy");
  revalidatePath("/rezerwacja");
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const { adminPasswordMatches } = await import("@/lib/account/admin-password");
  if (!(await adminPasswordMatches(password))) {
    redirect("/admin/logowanie?blad=1");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions());
  redirect("/admin");
}

const settingsSchema = z.object({
  phone: z.string().trim().min(5).max(40),
  noticeText: z.string().trim().max(240),
  noticeTextRu: z.string().trim().max(240).optional(),
  noticeEnabled: z.boolean(),
  googleRating: z.number().min(0).max(5),
  googleReviewCount: z.number().int().min(0).max(100000),
  bookingLeadMinutes: z.number().int().min(0).max(240),
  openingHours: z.array(z.object({
    day: z.string().trim().max(80),
    hours: z.string().trim().max(40),
    dayRu: z.string().trim().max(80).optional(),
    hoursRu: z.string().trim().max(40).optional(),
  })).min(1).max(7),
});

export async function saveSettings(input: {
  phone: string;
  noticeText: string;
  noticeTextRu?: string;
  noticeEnabled: boolean;
  googleRating: number;
  googleReviewCount: number;
  bookingLeadMinutes: number;
  openingHours: OpeningHour[];
}, source: Locale = "PL") {
  await requireAdmin();
  const parsed = settingsSchema.parse(input);
  const current = readCms();
  const previous = current.settings ?? {};
  const previousHours = previous.openingHours ?? [];
  let failed = 0;
  const notice = await alignPair(source, String(previous.noticeText ?? ""), parsed.noticeText, String(previous.noticeTextRu ?? ""), parsed.noticeTextRu ?? "");
  if (notice.failed) failed += 1;
  const openingHours: OpeningHour[] = [];
  for (const [index, row] of parsed.openingHours.entries()) {
    const before = previousHours[index];
    const day = await alignPair(source, String(before?.day ?? ""), row.day, String(before?.dayRu ?? ""), row.dayRu ?? "");
    const hours = await alignPair(source, String(before?.hours ?? ""), row.hours, String(before?.hoursRu ?? ""), row.hoursRu ?? "");
    if (day.failed) failed += 1;
    if (hours.failed) failed += 1;
    if (!day.pl || !hours.pl) throw new Error("Godziny potrzebują dnia i zakresu.");
    openingHours.push({ day: day.pl, hours: hours.pl, dayRu: day.ru, hoursRu: hours.ru });
  }
  await writeCms({
    ...current,
    settings: {
      ...(current.settings ?? {}),
      phone: parsed.phone,
      noticeText: notice.pl,
      noticeTextRu: notice.ru,
      noticeEnabled: parsed.noticeEnabled,
      googleRating: parsed.googleRating,
      googleReviewCount: parsed.googleReviewCount,
      bookingLeadMinutes: parsed.bookingLeadMinutes,
      openingHours,
    },
  });
  publish();
  return savedMessage(failed);
}

const mailSchema = z.object({
  emailClientSubject: z.string().trim().min(1).max(140),
  emailClientBody: z.string().trim().min(1).max(2000),
  emailSalonSubject: z.string().trim().min(1).max(140),
  emailSalonBody: z.string().trim().min(1).max(2000),
  emailReminderSubject: z.string().trim().min(1).max(140),
  emailReminderBody: z.string().trim().min(1).max(2000),
  emailReviewSubject: z.string().trim().min(1).max(140),
  emailReviewBody: z.string().trim().min(1).max(2000),
});

export async function saveMails(input: z.infer<typeof mailSchema>) {
  await requireAdmin();
  const parsed = mailSchema.parse(input);
  const current = readCms();
  await writeCms({
    ...current,
    settings: { ...(current.settings ?? {}), ...parsed },
  });
  return "Zapisane. Kolejne potwierdzenia pójdą z tą treścią.";
}

const lengthGuideSchema = z.object({
  note: z.string().trim().min(1).max(240),
  items: z
    .array(
      z.object({
        id: z.enum(["short", "medium", "long", "very_long"]),
        title: z.string().trim().min(1).max(40),
        mark: z.string().trim().min(1).max(40),
        hint: z.string().trim().min(1).max(180),
      }),
    )
    .length(4),
});

export async function saveLengthGuide(guide: LengthGuide, source: Locale = "PL") {
  await requireAdmin();
  const parsed = lengthGuideSchema.parse({ note: guide.note, items: guide.items });
  const items = LENGTH_ORDER.map((id) => parsed.items.find((item) => item.id === id)).filter((item) => item !== undefined);
  if (items.length !== 4) throw new Error("Szablon musi mieć wszystkie cztery długości.");
  const previous = getLengthGuide();
  let failed = 0;
  const note = await alignPair(source, previous.note, parsed.note, previous.ru?.note ?? "", guide.ru?.note ?? "");
  if (note.failed) failed += 1;
  const ruItems = [];
  const nextItems = [];
  for (const item of items) {
    const before = previous.items.find((row) => row.id === item.id);
    const beforeRu = previous.ru?.items.find((row) => row.id === item.id);
    const nextRu = guide.ru?.items.find((row) => row.id === item.id);
    const title = await alignPair(source, before?.title ?? "", item.title, beforeRu?.title ?? "", nextRu?.title ?? "");
    const mark = await alignPair(source, before?.mark ?? "", item.mark, beforeRu?.mark ?? "", nextRu?.mark ?? "");
    const hint = await alignPair(source, before?.hint ?? "", item.hint, beforeRu?.hint ?? "", nextRu?.hint ?? "");
    if (title.failed || mark.failed || hint.failed) failed += 1;
    nextItems.push({ id: item.id, title: title.pl, mark: mark.pl, hint: hint.pl });
    ruItems.push({ id: item.id, title: title.ru, mark: mark.ru, hint: hint.ru });
  }
  const current = readCms();
  await writeCms({ ...current, lengthGuide: { note: note.pl, items: nextItems, ru: { note: note.ru, items: ruItems } } });
  publish();
  return savedMessage(failed);
}

export async function savePrices(prices: Record<string, PricePatch>) {
  await requireAdmin();
  const clean: Record<string, PricePatch> = {};
  for (const [id, patch] of Object.entries(prices)) {
    if (!z.string().uuid().safeParse(id).success) continue;
    const price = Number(patch.priceCents);
    const duration = Number(patch.durationMinutes);
    if (!Number.isFinite(price) || !Number.isFinite(duration)) continue;
    clean[id] = {
      priceCents: Math.min(500_000, Math.max(0, Math.round(price))),
      durationMinutes: Math.min(600, Math.max(5, Math.round(duration))),
    };
  }
  const current = readCms();
  await writeCms({ ...current, prices: clean });
  publish();
}

export async function saveReviews(reviews: Review[], source: Locale = "PL") {
  await requireAdmin();
  const loose = z.array(z.object({
    name: z.string().trim().min(1).max(80),
    service: z.string().trim().max(80),
    text: z.string().trim().max(600),
    ru: z.object({ service: z.string().trim().max(80), text: z.string().trim().max(600) }).optional(),
  })).max(24).parse(reviews);
  const previous = readCms().reviews ?? [];
  let failed = 0;
  const clean: Review[] = [];
  for (const [index, row] of loose.entries()) {
    const before = previous[index]?.name === row.name ? previous[index] : previous.find((item) => item.name === row.name);
    const service = await alignPair(source, before?.service ?? "", row.service, before?.ru?.service ?? "", row.ru?.service ?? "");
    const text = await alignPair(source, before?.text ?? "", row.text, before?.ru?.text ?? "", row.ru?.text ?? "");
    if (service.failed || text.failed) failed += 1;
    if (!text.pl) throw new Error("Każda opinia potrzebuje treści.");
    clean.push({ name: row.name, service: service.pl, text: text.pl, ru: { service: service.ru, text: text.ru } });
  }
  if (clean.length < 1) throw new Error("Zostaw przynajmniej jedną opinię.");
  const current = readCms();
  await writeCms({ ...current, reviews: clean });
  publish();
  return savedMessage(failed);
}

export async function saveSections(sections: HomeSection[], source: Locale = "PL") {
  await requireAdmin();
  const clean = z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        type: z.enum(SECTION_TYPES),
        enabled: z.boolean(),
        eyebrow: z.string().trim().max(80),
        title: z.string().trim().max(160),
        body: z.string().trim().max(2000),
        image: z.string().max(120).refine((value) => value === "" || isSalonImagePath(value)),
        devices: z
          .object({ phone: z.boolean(), tablet: z.boolean(), desktop: z.boolean() })
          .optional(),
        ru: z.object({ eyebrow: z.string().trim().max(80), title: z.string().trim().max(160), body: z.string().trim().max(2000) }).optional(),
      }),
    )
    .min(1)
    .max(40)
    .parse(sections);
  const previous = getHomeSections();
  let failed = 0;
  const translated: HomeSection[] = [];
  for (const section of clean) {
    const before = previous.find((item) => item.id === section.id);
    const eyebrow = await alignPair(source, before?.eyebrow ?? "", section.eyebrow, before?.ru?.eyebrow ?? "", section.ru?.eyebrow ?? "");
    const title = await alignPair(source, before?.title ?? "", section.title, before?.ru?.title ?? "", section.ru?.title ?? "");
    const body = await alignPair(source, before?.body ?? "", section.body, before?.ru?.body ?? "", section.ru?.body ?? "");
    if (eyebrow.failed || title.failed || body.failed) failed += 1;
    translated.push({ ...section, eyebrow: eyebrow.pl, title: title.pl, body: body.pl, ru: { eyebrow: eyebrow.ru, title: title.ru, body: body.ru } });
  }
  const current = readCms();
  await writeCms({ ...current, sections: translated });
  publish();
  return savedMessage(failed);
}

export async function saveFaq(faq: FaqItem[], source: Locale = "PL") {
  await requireAdmin();
  const loose = z
    .array(z.object({
      q: z.string().trim().max(180),
      a: z.string().trim().max(800),
      ru: z.object({ q: z.string().trim().max(180), a: z.string().trim().max(800) }).optional(),
    }))
    .max(30)
    .parse(faq);
  const previous = getFaqItems();
  let failed = 0;
  const clean: FaqItem[] = [];
  for (const row of loose.filter((item) => item.q || item.a || item.ru?.q || item.ru?.a)) {
    const before = previous.find((item) => item.q === row.q) ?? previous.find((item) => item.ru?.q && item.ru.q === row.ru?.q);
    const question = await alignPair(source, before?.q ?? "", row.q, before?.ru?.q ?? "", row.ru?.q ?? "");
    const answer = await alignPair(source, before?.a ?? "", row.a, before?.ru?.a ?? "", row.ru?.a ?? "");
    if (question.failed || answer.failed) failed += 1;
    if (!question.pl.trim() || !answer.pl.trim()) continue;
    clean.push({ q: question.pl, a: answer.pl, ru: { q: question.ru, a: answer.ru } });
  }
  if (clean.length < 1) throw new Error("Zostaw przynajmniej jedno pytanie i odpowiedź.");
  const current = readCms();
  await writeCms({ ...current, faq: clean });
  publish();
  return savedMessage(failed);
}

export async function saveShowcase(input: { heroSlides: string[]; heroDevices?: Record<string, { phone: boolean; tablet: boolean; desktop: boolean }>; comparisons: ComparisonPair[] }, source: Locale = "PL") {
  await requireAdmin();
  const heroSlides = z
    .array(z.string().refine(isSalonImagePath))
    .max(12)
    .parse(input.heroSlides);
  const heroDevices = z
    .record(z.string(), z.object({ phone: z.boolean(), tablet: z.boolean(), desktop: z.boolean() }))
    .optional()
    .parse(input.heroDevices);
  const comparisons = z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        title: z.string().trim().max(80),
        text: z.string().trim().max(400),
        before: z.string().refine(isSalonImagePath),
        after: z.string().refine(isSalonImagePath),
        beforeSide: z.enum(["left", "right"]),
        ru: z.object({ title: z.string().trim().max(80), text: z.string().trim().max(400) }).optional(),
      }),
    )
    .max(12)
    .parse(input.comparisons);
  const previous = getComparisons();
  let failed = 0;
  const translated: ComparisonPair[] = [];
  for (const pair of comparisons) {
    const before = previous.find((item) => item.id === pair.id);
    const title = await alignPair(source, before?.title ?? "", pair.title, before?.ru?.title ?? "", pair.ru?.title ?? "");
    const text = await alignPair(source, before?.text ?? "", pair.text, before?.ru?.text ?? "", pair.ru?.text ?? "");
    if (title.failed || text.failed) failed += 1;
    if (!title.pl) throw new Error("Każda metamorfoza potrzebuje nazwy.");
    translated.push({ ...pair, title: title.pl, text: text.pl, ru: { title: title.ru, text: text.ru } });
  }
  const current = readCms();
  await writeCms({ ...current, heroSlides, heroDevices, comparisons: translated });
  publish();
  return savedMessage(failed);
}

export async function saveGalleryOrder(order: string[]) {
  await requireAdmin();
  const allowed = new Set(galleryCatalog().map((photo) => photo.src));
  const clean = order.filter((src) => allowed.has(src));
  for (const src of allowed) {
    if (!clean.includes(src)) clean.push(src);
  }
  const current = readCms();
  await writeCms({ ...current, galleryOrder: clean });
  publish();
  return "Zapisane. Galeria na stronie jest w tej kolejności.";
}
