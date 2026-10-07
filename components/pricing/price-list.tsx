"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LengthGuideCard } from "@/components/pricing/length-guide";
import { CATEGORIES } from "@/lib/booking/catalog";
import type { HairLength, ServiceGroup } from "@/lib/booking/types";
import { DEFAULT_LENGTH_GUIDE, lengthItem, type LengthGuide } from "@/lib/content/length-guide";
import { formatPln } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { ruPhrase } from "@/lib/i18n/phrases";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

const lengthOrder: HairLength[] = ["short", "medium", "long", "very_long"];
const ALL = "Wszystkie";
const HITS = ["szycie-siwizny", "airtouch", "balayage", "farbowanie-odrostow", "strzyzenie-damskie-modelowanie", "afroloki"];

export function PriceList({ services, compact = false, lengthGuide = DEFAULT_LENGTH_GUIDE }: { services: ServiceGroup[]; compact?: boolean; lengthGuide?: LengthGuide }) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = t(locale);
  const name = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  const openBooking = useBookingStore((state) => state.openBooking);
  const [category, setCategory] = useState<string>(ALL);
  const [lengths, setLengths] = useState<Record<string, HairLength>>({});
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(!compact);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const inCategory = category === ALL || service.category === category;
      const haystack = `${service.name} ${service.category}`.toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [services, category, query]);

  const shown = useMemo(() => {
    if (expanded || query.trim() || category !== ALL) return visible;
    const hits = HITS.map((id) => visible.find((service) => service.id === id)).filter((service): service is ServiceGroup => Boolean(service));
    return hits.length ? hits : visible.slice(0, 6);
  }, [expanded, query, category, visible]);

  return (
    <div>
      <label className="mb-3 block text-sm">
        {copy.search}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 w-full rounded-full bg-white px-4 py-3 text-sm ring-1 ring-ink/10 outline-none"
          placeholder={copy.searchHint}
        />
      </label>
      <div className="flex flex-wrap gap-2 pb-2">
        {[ALL, ...CATEGORIES].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${
              item === category ? "bg-ink text-white" : "text-mauve hover:text-ink"
            }`}
          >
            {name(item)}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <LengthGuideCard guide={lengthGuide} />
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/5">
        {shown.map((service) => {
          const hasLengths = service.variants.some((variant) => variant.hairLength);
          const selectedLength = lengths[service.id] ?? "medium";
          const variant =
            service.variants.find((item) => item.hairLength === selectedLength) ?? service.variants[0];
          return (
            <article key={service.id} className="border-b border-ink/6 p-6 last:border-0 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl tracking-tight">
                    {name(service.name)}{" "}
                    {service.highlight ? <span className="text-berry">#szycieSiwizny</span> : null}
                  </h3>
                  {category === ALL || query.trim() ? <p className="mt-1 text-sm font-medium text-berry">{name(service.category)}</p> : null}
                  <p className="mt-1 text-sm text-mauve">
                    ok. {variant.durationMinutes} {copy.minutes}
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
                      const labels = {
                        short: lengthItem(lengthGuide, "short").title,
                        medium: lengthItem(lengthGuide, "medium").title,
                        long: lengthItem(lengthGuide, "long").title,
                        very_long: lengthItem(lengthGuide, "very_long").title,
                      };
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
                data-track={`Usługa · ${service.name}`}
                onClick={() => openBooking(service.id, variant.id)}
                className="mt-5 text-sm font-semibold text-berry underline decoration-berry/30 underline-offset-4"
              >
                {copy.reserve}
              </button>
            </article>
          );
        })}
        {shown.length === 0 ? <p className="p-6 text-sm text-ink">{copy.noMatch}</p> : null}
      </div>
      {compact && !expanded && category === ALL && !query.trim() ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-berry shadow-[0_10px_24px_-16px_rgba(192,38,116,0.9)] ring-1 ring-berry/15 transition-colors hover:bg-berry hover:text-white"
        >
          {copy.seeAllPrices}
          <ChevronDown size={16} aria-hidden />
        </button>
      ) : null}
      <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-mauve">{copy.priceNote} {copy.payAtSalon}</p>
    </div>
  );
}
