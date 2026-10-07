import { ShowcaseForm } from "@/components/admin/showcase-form";
import { getComparisons, getHeroSlides } from "@/lib/cms/showcase";
import { listMedia } from "@/lib/media/library";

export default async function ShowcasePage() {
  const [hero, comparisons, media] = await Promise.all([Promise.resolve(getHeroSlides()), Promise.resolve(getComparisons()), listMedia()]);
  return <ShowcaseForm hero={hero} comparisons={comparisons} media={media} />;
}
