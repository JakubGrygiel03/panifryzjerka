import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ComparisonGrid } from "@/components/visual/comparison-grid";
import { WorkGallery } from "@/components/visual/work-gallery";
import { salonGallery } from "@/lib/content/gallery";

export const metadata: Metadata = { title: "Metamorfozy" };

export default function TransformationsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/metamorfozy", label: "Metamorfozy" }]} />
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Metamorfozy</h1>
      <p className="mt-4 max-w-xl text-base leading-7 font-medium text-ink">
        Efekty z salonu: szycie siwizny, airtouch, kamuflaż odrostu, strzyżenie i trwała ondulacja.
      </p>
      <div className="mt-8">
        <ComparisonGrid />
      </div>
      <div className="mt-10">
        <WorkGallery photos={salonGallery.filter((photo) => photo.src !== "/salon/biz-05.jpg")} />
      </div>
    </section>
  );
}
