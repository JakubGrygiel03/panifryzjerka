import { normalizeDevices } from "@/lib/cms/devices";
import { readCms } from "@/lib/cms/store";
import { DEFAULT_COMPARISONS, DEFAULT_HERO_SLIDES, type ComparisonPair, type ComparisonSide, type HeroSlide } from "@/lib/cms/showcase-types";
import { isSalonImagePath } from "@/lib/media/paths";

function side(value: unknown): ComparisonSide {
  return value === "left" ? "left" : "right";
}

export function getHeroSlides(): HeroSlide[] {
  const cms = readCms();
  const saved = (cms.heroSlides ?? []).map(String).filter(isSalonImagePath);
  const sources = (saved.length ? saved : [...DEFAULT_HERO_SLIDES]).slice(0, 12);
  return sources.map((src) => ({ src, devices: normalizeDevices(cms.heroDevices?.[src]) }));
}

export function getComparisons(): ComparisonPair[] {
  const saved = readCms().comparisons;
  if (!saved) return DEFAULT_COMPARISONS;
  return saved
    .map((item) => {
      const before = String(item.before ?? "");
      const after = String(item.after ?? "");
      if (!isSalonImagePath(before) || !isSalonImagePath(after)) return null;
      return {
        id: String(item.id).slice(0, 80),
        title: String(item.title ?? "").slice(0, 80),
        text: String(item.text ?? "").slice(0, 400),
        before,
        after,
        beforeSide: side(item.beforeSide),
      };
    })
    .filter((item): item is ComparisonPair => Boolean(item?.id && item.title))
    .slice(0, 12);
}
