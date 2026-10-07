import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Review } from "@/lib/content/types";

const FILE = path.join(process.cwd(), "data", "google-reviews-cache.json");
const DAY = 24 * 60 * 60 * 1000;

type CacheFile = { savedAt: number; reviews: Review[] };

export async function loadGoogleReviews(): Promise<Review[] | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!key || !placeId) return null;

  try {
    const cached = JSON.parse(await readFile(FILE, "utf8")) as CacheFile;
    if (cached?.savedAt && Date.now() - cached.savedAt < DAY && Array.isArray(cached.reviews) && cached.reviews.length) {
      return cached.reviews;
    }
  } catch {
    // Brak pamięci podręcznej. Pobierzemy opinie z Google, jeśli klucz jest ustawiony.
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "reviews");
  url.searchParams.set("language", "pl");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      result?: { reviews?: Array<{ author_name?: string; text?: string; rating?: number }> };
    };
    const reviews = (payload.result?.reviews ?? [])
      .map((review) => ({
        name: String(review.author_name ?? "").trim(),
        service: "Google",
        text: String(review.text ?? "").trim(),
      }))
      .filter((review) => review.name && review.text)
      .slice(0, 6);
    if (!reviews.length) return null;
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify({ savedAt: Date.now(), reviews }, null, 2), "utf8");
    return reviews;
  } catch {
    return null;
  }
}
