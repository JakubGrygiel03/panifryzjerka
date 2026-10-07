"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Phone } from "lucide-react";
import { SALON } from "@/lib/brand";
import { ALL_DEVICES, type DeviceVisibility } from "@/lib/cms/devices";
import { ReviewsCard } from "@/components/home/reviews-card";
import { TrustBadges } from "@/components/home/trust-badges";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function Hero({
  rating,
  reviewCount,
  reviewsUrl,
  phoneDisplay,
  phoneHref,
  title,
  lead,
  slides,
}: {
  rating: number;
  reviewCount: number;
  reviewsUrl: string;
  phoneDisplay: string;
  phoneHref: string;
  title: string;
  lead: string;
  slides: { src: string; devices?: DeviceVisibility }[];
}) {
  const copy = t(useLocaleStore((state) => state.locale));
  const openBooking = useBookingStore((state) => state.openBooking);
  const [bucket, setBucket] = useState<"phone" | "tablet" | "desktop">("desktop");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function apply() {
      const width = window.innerWidth;
      setBucket(width < 768 ? "phone" : width < 1024 ? "tablet" : "desktop");
    }
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const photos = (slides.length ? slides : [{ src: "/salon/biz-11.jpg", devices: ALL_DEVICES }])
    .filter((slide) => (slide.devices ?? ALL_DEVICES)[bucket])
    .map((slide) => slide.src);
  const visible = photos.length ? photos : ["/salon/biz-11.jpg"];
  const key = `${bucket}:${visible.join("|")}`;

  useEffect(() => {
    setIndex(0);
  }, [key]);

  useEffect(() => {
    if (visible.length < 2) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % visible.length), 5000);
    return () => window.clearTimeout(timer);
  }, [index, key, visible.length]);

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-6 pb-10 sm:px-6 md:grid-cols-[1.25fr_0.75fr] md:pt-8">
      <div>
        <p className="eyebrow">{SALON.addressLabel}</p>
        <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          {title || copy.heroTitle}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-ink">
          <span className="font-semibold">{copy.tag}</span> {lead || copy.heroLead}
        </p>
        <div className="mt-6">
          <ReviewsCard rating={rating} reviewCount={reviewCount} reviewsUrl={reviewsUrl} />
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
            href={phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-ink ring-1 ring-ink/10 transition-colors duration-200 hover:bg-blush"
          >
            <Phone size={16} className="text-berry" aria-hidden />
            {copy.call}: {phoneDisplay}
          </a>
        </div>
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_24px_50px_-32px_rgba(31,26,36,0.55)]">
        {visible.map((src, photoIndex) => (
          <Image
            key={`${src}-${photoIndex}`}
            src={src}
            alt="Praca salonu PaniFryzjerka, bez napisu na zdjęciu"
            fill
            priority={photoIndex === 0}
            quality={68}
            sizes="(min-width: 768px) 28vw, 80vw"
            className={`object-cover object-center transition-opacity duration-700 ${photoIndex === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {visible.length > 1 ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {visible.map((src, photoIndex) => (
              <button
                key={`${src}-dot-${photoIndex}`}
                type="button"
                aria-label={`Pokaż zdjęcie ${photoIndex + 1}`}
                onClick={() => setIndex(photoIndex)}
                className={`h-2 rounded-full bg-white transition-all ${photoIndex === index ? "w-6" : "w-2 opacity-70"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
