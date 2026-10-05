"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { SALON } from "@/lib/brand";
import { ReviewsCard } from "@/components/home/reviews-card";
import { TrustBadges } from "@/components/home/trust-badges";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function Hero() {
  const copy = t(useLocaleStore((state) => state.locale));
  const openBooking = useBookingStore((state) => state.openBooking);

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-6 pb-10 sm:px-6 md:grid-cols-[1.25fr_0.75fr] md:pt-8">
      <div>
        <p className="eyebrow">{SALON.addressLabel}</p>
        <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-ink">
          <span className="font-semibold">{copy.tag}</span> {copy.heroLead}
        </p>
        <div className="mt-6">
          <ReviewsCard />
        </div>
        <div className="mt-6">
          <TrustBadges />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openBooking()}
            className="rounded-full bg-berry px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_-16px_#C02674] transition-colors duration-200 hover:bg-berry-deep"
          >
            {copy.book}
          </button>
          <a
            href={SALON.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-ink ring-1 ring-ink/10 transition-colors duration-200 hover:bg-blush"
          >
            <Phone size={16} className="text-berry" aria-hidden />
            {copy.callNumber}
          </a>
        </div>
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_24px_50px_-32px_rgba(31,26,36,0.55)]">
        <Image
          src="/salon/biz-06.jpg"
          alt="Szycie siwizny i airtouch w salonie PaniFryzjerka"
          fill
          priority
          sizes="(min-width: 768px) 28vw, 80vw"
          className="object-cover object-[72%_22%]"
        />
      </div>
    </section>
  );
}
