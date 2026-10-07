import { LengthGuideForm } from "@/components/admin/length-guide-form";
import { PricesForm } from "@/components/admin/prices-form";
import { getLengthGuide } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function PricesPage() {
  const content = await getSalonContent();
  return (
    <>
      <LengthGuideForm guide={getLengthGuide()} />
      <PricesForm services={content.services} />
    </>
  );
}
