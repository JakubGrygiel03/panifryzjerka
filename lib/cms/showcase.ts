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
  const rows: ComparisonPair[] = [];
  for (const item of saved) {
    const before = String(item.before ?? "");
    const after = String(item.after ?? "");
    const id = String(item.id ?? "").slice(0, 80);
    const title = String(item.title ?? "").slice(0, 80);
    if (!id || !title || !isSalonImagePath(before) || !isSalonImagePath(after)) continue;
    const titleRu = String(item.ru?.title ?? "").slice(0, 80);
    const textRu = String(item.ru?.text ?? "").slice(0, 400);
    rows.push({
      id,
      title,
      text: String(item.text ?? "").slice(0, 400),
      before,
      after,
      beforeSide: side(item.beforeSide),
      ru: titleRu || textRu ? { title: titleRu, text: textRu } : undefined,
    });
  }
  return rows.slice(0, 12);
}
