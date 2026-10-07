import { defaultSections, SECTION_TYPES, type HomeSection } from "@/lib/cms/section-types";
import { readCms } from "@/lib/cms/store";
import { isSalonImagePath } from "@/lib/media/paths";

function cleanSection(value: unknown): HomeSection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<HomeSection>;
  if (!row.id || !row.type || !SECTION_TYPES.includes(row.type)) return null;
  return {
    id: String(row.id).slice(0, 80),
    type: row.type,
    enabled: row.enabled !== false,
    eyebrow: String(row.eyebrow ?? "").slice(0, 80),
    title: String(row.title ?? "").slice(0, 160),
    body: String(row.body ?? "").slice(0, 2000),
    image: isSalonImagePath(String(row.image ?? "")) ? String(row.image) : "",
  };
}

export function getHomeSections(): HomeSection[] {
  const saved = readCms().sections?.map(cleanSection).filter((item): item is HomeSection => Boolean(item)) ?? [];
  if (saved.length === 0) return defaultSections();
  const missing = defaultSections().filter((item) => !saved.some((row) => row.type === item.type && row.type !== "tekst"));
  return [...saved, ...missing];
}
