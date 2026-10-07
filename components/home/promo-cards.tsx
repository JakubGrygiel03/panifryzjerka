"use client";

import { SERVICE_CATALOG } from "@/lib/booking/catalog";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function PromoCards({ mensVariantId }: { mensVariantId: string }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const openBooking = useBookingStore((state) => state.openBooking);
  const szycie = SERVICE_CATALOG.find((service) => service.id === "szycie-siwizny");
  const szycieVariant = szycie?.variants.find((variant) => variant.hairLength === "medium") ?? szycie?.variants[0];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-ink/5 md:grid-cols-2">
        <article className="flex flex-col justify-between gap-6 p-8 sm:p-10 md:border-r md:border-ink/8">
          <div>
            <p className="eyebrow">{copy.everyThursday}</p>
            <h2 className="mt-3 font-display text-3xl">{copy.promoThursday}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-mauve">{copy.promoThursdayText}</p>
          </div>
          <button
            type="button"
            data-track="Usługa · Strzyżenie męskie"
            onClick={() => openBooking("strzyzenie-meskie", mensVariantId)}
            className="self-start text-sm font-semibold text-berry underline decoration-berry/30 underline-offset-4"
          >
            {copy.bookMens}
          </button>
        </article>
        <article className="flex flex-col justify-between gap-6 bg-ink p-8 text-white sm:p-10">
          <div>
            <p className="text-base font-semibold text-white">{copy.technique}</p>
            <h2 className="mt-3 font-display text-3xl">#szycieSiwizny</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">{copy.techniqueLead}</p>
          </div>
          <button type="button" data-track="Usługa · Szycie siwizny" onClick={() => openBooking(szycie?.id, szycieVariant?.id)} className="self-start text-sm font-semibold text-pink-100 underline decoration-white/30 underline-offset-4">
            {copy.bookGrey}
          </button>
        </article>
      </div>
    </section>
  );
}
