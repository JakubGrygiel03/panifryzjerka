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
  passwordsMatch,
} from "@/lib/cms/session";
import { SECTION_TYPES, type HomeSection } from "@/lib/cms/section-types";
import { isSalonImagePath } from "@/lib/media/paths";
import type { ComparisonPair } from "@/lib/cms/showcase-types";
import { readCms, writeCms, type FaqItem, type PricePatch } from "@/lib/cms/store";
import { LENGTH_ORDER, type LengthGuide } from "@/lib/content/length-guide";
import type { OpeningHour, Review } from "@/lib/content/types";

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
  const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!expected || !passwordsMatch(password, expected)) {
    redirect("/admin/logowanie?blad=1");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions());
  redirect("/admin");
}

const settingsSchema = z.object({
  phone: z.string().trim().min(5).max(40),
  noticeText: z.string().trim().max(240),
  noticeEnabled: z.boolean(),
  googleRating: z.number().min(0).max(5),
  googleReviewCount: z.number().int().min(0).max(100000),
  openingHours: z.array(z.object({ day: z.string().trim().min(1).max(80), hours: z.string().trim().min(1).max(40) })).min(1).max(7),
});

export async function saveSettings(input: {
  phone: string;
  noticeText: string;
  noticeEnabled: boolean;
  googleRating: number;
  googleReviewCount: number;
  openingHours: OpeningHour[];
}) {
  await requireAdmin();
  const parsed = settingsSchema.parse(input);
  const current = readCms();
  await writeCms({
    ...current,
    settings: {
      ...(current.settings ?? {}),
      phone: parsed.phone,
      noticeText: parsed.noticeText,
      noticeEnabled: parsed.noticeEnabled,
      googleRating: parsed.googleRating,
      googleReviewCount: parsed.googleReviewCount,
      openingHours: parsed.openingHours,
    },
  });
  publish();
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

export async function saveLengthGuide(guide: LengthGuide) {
  await requireAdmin();
  const parsed = lengthGuideSchema.parse(guide);
  const items = LENGTH_ORDER.map((id) => parsed.items.find((item) => item.id === id)).filter((item) => item !== undefined);
  if (items.length !== 4) throw new Error("Szablon musi mieć wszystkie cztery długości.");
  const current = readCms();
  await writeCms({ ...current, lengthGuide: { note: parsed.note, items } });
  publish();
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

const reviewSchema = z.object({
  name: z.string().trim().min(1).max(80),
  service: z.string().trim().max(80),
  text: z.string().trim().min(1).max(600),
});

export async function saveReviews(reviews: Review[]) {
  await requireAdmin();
  const clean = z.array(reviewSchema).min(1).max(24).parse(reviews);
  const current = readCms();
  await writeCms({ ...current, reviews: clean });
  publish();
}

export async function saveSections(sections: HomeSection[]) {
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
      }),
    )
    .min(1)
    .max(40)
    .parse(sections);
  const current = readCms();
  await writeCms({ ...current, sections: clean });
  publish();
}

export async function saveFaq(faq: FaqItem[]) {
  await requireAdmin();
  const clean = z
    .array(z.object({ q: z.string().trim().min(1).max(180), a: z.string().trim().min(1).max(800) }))
    .min(1)
    .max(30)
    .parse(faq);
  const current = readCms();
  await writeCms({ ...current, faq: clean });
  publish();
}

export async function saveShowcase(input: { heroSlides: string[]; heroDevices?: Record<string, { phone: boolean; tablet: boolean; desktop: boolean }>; comparisons: ComparisonPair[] }) {
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
        title: z.string().trim().min(1).max(80),
        text: z.string().trim().max(400),
        before: z.string().refine(isSalonImagePath),
        after: z.string().refine(isSalonImagePath),
        beforeSide: z.enum(["left", "right"]),
      }),
    )
    .max(12)
    .parse(input.comparisons);
  const current = readCms();
  await writeCms({ ...current, heroSlides, heroDevices, comparisons });
  publish();
}
