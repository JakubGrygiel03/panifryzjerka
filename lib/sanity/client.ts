import { createClient } from "next-sanity";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-10-05",
};

export function isSanityConfigured(): boolean {
  return sanityConfig.projectId.length > 0;
}

export const sanityClient = createClient({
  projectId: sanityConfig.projectId || "panifryzjerka",
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: true,
  perspective: "published",
});
