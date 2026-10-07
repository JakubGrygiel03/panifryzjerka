import { HomeSections } from "@/components/home/home-sections";
import { getHomeSections } from "@/lib/cms/sections";
import { getSalonContent } from "@/lib/content/get-salon-content";
import { getRequestLocale } from "@/lib/request-locale";

export default async function HomePage() {
  const [content, locale] = await Promise.all([getSalonContent(), getRequestLocale()]);
  return <HomeSections sections={getHomeSections()} content={content} locale={locale} />;
}
