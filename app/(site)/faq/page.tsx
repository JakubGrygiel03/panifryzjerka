import type { Metadata } from "next";
import { FaqList } from "@/components/home/faq-list";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FAQ } from "@/lib/content/guides";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pytania",
  description: "Kto strzyże, czy można z psem, parking, odwołanie wizyty i płatność w salonie PaniFryzjerka.",
};

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      <Breadcrumbs items={[{ href: "/faq", label: "FAQ" }]} />
      <h1 className="font-display text-4xl">Pytania</h1>
      <div className="mt-6">
        <FaqList items={FAQ} />
      </div>
    </section>
  );
}
