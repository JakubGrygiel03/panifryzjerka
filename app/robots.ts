import type { MetadataRoute } from "next";
import { SALON } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/salon", "/konto"] },
    sitemap: `${SALON.siteUrl}/sitemap.xml`,
  };
}
