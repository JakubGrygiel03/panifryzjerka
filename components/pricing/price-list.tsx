"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/booking/catalog";
import type { HairLength, ServiceGroup } from "@/lib/booking/types";
import { formatPln } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

const lengthOrder: HairLength[] = ["short", "medium", "long", "very_long"];

export function PriceList({ services }: { services: ServiceGroup[] }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const openBooking = useBookingStore((state) => state.openBooking);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [lengths, setLengths] = useState<Record<string, HairLength>>({});
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      services.filter((service) => {
        const matchesCategory = service.category === category;
        const matchesQuery = service.name.toLowerCase().includes(query.trim().toLowerCase());
        return query.trim() ? matchesQuery : matchesCategory;
      }),
    [services, category, query],
  );

  return (
    <div>
      <label className="mb-3 block text-sm">
        Szukaj usługi
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 w-full rounded-full bg-white px-4 py-3 text-sm ring-1 ring-ink/10 outline-none"
          placeholder="np. szycie, grzywka, rzęsy"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${
              item === category ? "bg-ink text-white" : "text-mauve hover:text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/5">
        {visible.map((service) => {
          const hasLengths = service.variants.some((variant) => variant.hairLength);
          const selectedLength = lengths[service.id] ?? "medium";
          const variant =
            service.variants.find((item) => item.hairLength === selectedLength) ?? service.variants[0];
          return (
            <article key={service.id} className="border-b border-ink/6 p-6 last:border-0 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl tracking-tight">
                    {service.name}{" "}
                    {service.highlight ? <span className="text-berry">#szycieSiwizny</span> : null}
                  </h3>
                  <p className="mt-1 text-sm text-mauve">
                    ok. {variant.durationMinutes} {copy.minutes} + {variant.bufferMinutes} min na porządek stanowiska
                  </p>
                </div>
                <p className="font-display text-2xl text-ink">{formatPln(variant.priceCents)}</p>
              </div>
              {hasLengths ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-mauve">{copy.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {lengthOrder.map((length) => {
                      const option = service.variants.find((item) => item.hairLength === length);
                      if (!option) return null;
                      const active = option.id === variant.id;
                      const labels = { short: copy.short, medium: copy.medium, long: copy.long, very_long: copy.veryLong };
                      return (
                        <button
                          key={length}
                          type="button"
                          onClick={() => setLengths((current) => ({ ...current, [service.id]: length }))}
                          className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-berry text-white" : "bg-blush text-ink"}`}
                        >
                          {labels[length]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => openBooking(service.id, variant.id)}
                className="mt-5 text-sm font-semibold text-berry underline decoration-berry/30 underline-offset-4"
              >
                {copy.reserve}
              </button>
            </article>
          );
        })}
      </div>
      {visible.length === 0 ? <p className="mt-4 text-sm text-mauve">Brak usługi o tej nazwie w tej kategorii.</p> : null}
      <p className="mt-4 text-sm text-mauve">{copy.priceNote} Płatność w salonie, po zabiegu. Rezerwacja nie pobiera przedpłaty.</p>
    </div>
  );
}
