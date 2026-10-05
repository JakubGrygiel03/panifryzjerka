import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { PromoCards } from "@/components/home/promo-cards";
import { SalonStory } from "@/components/home/salon-story";
import { Team } from "@/components/home/team";
import { PriceList } from "@/components/pricing/price-list";
import { ComparisonGrid } from "@/components/visual/comparison-grid";
import { WorkGallery } from "@/components/visual/work-gallery";
import { featuredGallery } from "@/lib/content/gallery";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function HomePage() {
  const content = await getSalonContent();
  const mensVariantId = content.services.find((service) => service.id === "strzyzenie-meskie")?.variants[0]?.id ?? "";

  return (
    <>
      <Hero />
      <PromoCards mensVariantId={mensVariantId} />
      <section id="cennik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Usługi</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Cennik</h2>
        <div className="mt-8">
          <PriceList services={content.services} />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="eyebrow">Prace salonu</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Metamorfozy</h2>
        <p className="mt-4 max-w-xl text-base leading-7 font-medium text-ink">
          Szycie siwizny, koloryzacja, strzyżenie i trwała — prace Pani Iryny. Suwakiem porównasz stan przed zabiegiem i po nim.
        </p>
        <div className="mt-8">
          <ComparisonGrid />
        </div>
        <div className="mt-10">
          <WorkGallery photos={featuredGallery.filter((photo) => photo.src !== "/salon/biz-05.jpg")} />
        </div>
        <Link href="/metamorfozy" className="mt-8 inline-block text-sm font-semibold text-berry">
          Wszystkie metamorfozy
        </Link>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Salon</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">Pani Iryna i pies Bella</h2>
        <div className="mt-8">
          <Team members={content.team} />
        </div>
      </section>
      <SalonStory />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="eyebrow">Goście</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Opinie</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.reviews.map((review) => (
            <blockquote key={review.name} className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/5">
              <p className="font-display text-4xl leading-none text-berry/70">“</p>
              <p className="mt-3 text-[15px] leading-7">{review.text}</p>
              <footer className="mt-5 text-sm text-mauve">
                {review.name}
                <span className="text-ink"> · {review.service}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
