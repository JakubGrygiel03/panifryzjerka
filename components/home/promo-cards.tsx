"use client";

import { useBookingStore } from "@/store/use-booking-store";

export function PromoCards({ mensVariantId }: { mensVariantId: string }) {
  const openBooking = useBookingStore((state) => state.openBooking);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-ink/5 md:grid-cols-2">
        <article className="flex flex-col justify-between gap-6 p-8 sm:p-10 md:border-r md:border-ink/8">
          <div>
            <p className="eyebrow">Każdy czwartek</p>
            <h2 className="mt-3 font-display text-3xl">Męski czwartek</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-mauve">Strzyżenie męskie 70 zł. W notatce dopisz: męski czwartek.</p>
          </div>
          <button
            type="button"
            onClick={() => openBooking("strzyzenie-meskie", mensVariantId)}
            className="self-start text-sm font-semibold text-berry underline decoration-berry/30 underline-offset-4"
          >
            Zapisz strzyżenie męskie
          </button>
        </article>
        <article className="flex flex-col justify-between gap-6 bg-ink p-8 text-white sm:p-10">
          <div>
            <p className="text-base font-semibold text-white">Każda środa</p>
            <h2 className="mt-3 font-display text-3xl">Rodzinna środa</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">−20% dla całej rodziny zapisanej tego dnia. W notatce dopisz: rodzinna środa.</p>
          </div>
          <button type="button" onClick={() => openBooking()} className="self-start text-sm font-semibold text-pink-100 underline decoration-white/30 underline-offset-4">
            Zapisz wizytę
          </button>
        </article>
      </div>
    </section>
  );
}
