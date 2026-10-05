import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PriceList } from "@/components/pricing/price-list";
import { PrintButton } from "@/components/pricing/print-button";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const metadata: Metadata = { title: "Cennik" };

export default async function PricePage() {
  const content = await getSalonContent();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/cennik", label: "Cennik" }]} />
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Cennik</h1>
        <PrintButton />
      </div>
      <PriceList services={content.services} />
    </section>
  );
}
