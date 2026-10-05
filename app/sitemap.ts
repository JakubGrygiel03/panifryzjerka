import type { MetadataRoute } from "next";
import { SALON } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/cennik", "/metamorfozy", "/o-nas", "/kontakt", "/rezerwacja", "/faq", "/przygotowanie", "/pielegnacja", "/szycie-siwizny", "/regulamin", "/prywatnosc", "/odwolanie"].map((path) => ({
    url: `${SALON.siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
