import { fallbackContent } from "@/lib/content/fallback";
import type { SalonContent, SalonSettings } from "@/lib/content/types";
import type { HairLength, ServiceGroup } from "@/lib/booking/types";
import { isSanityConfigured, sanityClient } from "@/lib/sanity/client";
import { salonContentQuery } from "@/lib/sanity/queries";

type SanityPayload = {
  settings: Partial<SalonSettings> | null;
  services: ServiceGroup[] | null;
  transformations: SalonContent["transformations"] | null;
  team: SalonContent["team"] | null;
};

function usableServices(services: ServiceGroup[] | null | undefined): ServiceGroup[] | null {
  if (!services || services.length === 0) return null;
  const lengths: Array<HairLength | null> = ["short", "medium", "long", "very_long", null];
  const valid = services.every(
    (service) =>
      service.id &&
      service.name &&
      service.category &&
      Array.isArray(service.variants) &&
      service.variants.length > 0 &&
      service.variants.every(
        (variant) =>
          variant.id &&
          variant.label &&
          Number.isFinite(variant.durationMinutes) &&
          Number.isFinite(variant.priceCents) &&
          (variant.hairLength === undefined || lengths.includes(variant.hairLength)),
      ),
  );
  return valid ? services : null;
}

export async function getSalonContent(): Promise<SalonContent> {
  if (!isSanityConfigured()) return fallbackContent;

  try {
    const payload = await sanityClient.fetch<SanityPayload>(salonContentQuery, {}, { next: { revalidate: 60 } });
    const services = usableServices(payload.services) ?? fallbackContent.services;
    return {
      settings: { ...fallbackContent.settings, ...(payload.settings ?? {}) },
      services,
      transformations:
        payload.transformations?.filter((item) => item.before && item.after).length
          ? payload.transformations.filter((item) => item.before && item.after)
          : fallbackContent.transformations,
      team: payload.team?.length ? payload.team : fallbackContent.team,
      reviews: fallbackContent.reviews,
    };
  } catch {
    return fallbackContent;
  }
}
