import { HomeSections } from "@/components/home/home-sections";
import { getHomeSections } from "@/lib/cms/sections";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function HomePage() {
  const content = await getSalonContent();
  return <HomeSections sections={getHomeSections()} content={content} />;
}
