"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/booking/catalog";
import type { ServiceGroup } from "@/lib/booking/types";
import { DEFAULT_LENGTH_GUIDE, lengthItem, type LengthGuide } from "@/lib/content/length-guide";
import { formatPln } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

const ALL = "Wszystkie";

export function StepService({ services, lengthGuide = DEFAULT_LENGTH_GUIDE }: { services: ServiceGroup[]; lengthGuide?: LengthGuide }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const groupId = useBookingStore((state) => state.groupId);
  const variantId = useBookingStore((state) => state.variantId);
  const setGroup = useBookingStore((state) => state.setGroup);
  const setVariant = useBookingStore((state) => state.setVariant);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [lengthsOpen, setLengthsOpen] = useState(false);
  const openRow = useRef<HTMLDivElement>(null);
  const group = services.find((item) => item.id === groupId) ?? null;
  const chosen = group?.variants.find((variant) => variant.id === variantId);

  useEffect(() => {
    if (!lengthsOpen) return;
    openRow.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [lengthsOpen, groupId]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const inCategory = category === ALL || service.category === category;
      return inCategory && (!needle || `${service.name} ${service.category}`.toLowerCase().includes(needle));
    });
  }, [services, query, category]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <label className="block shrink-0 text-sm">
        Szukaj usługi
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 w-full rounded-full bg-blush px-4 py-2.5 text-sm ring-1 ring-pink-100 outline-none"
          placeholder="np. szycie, grzywka, afroloki, tonowanie"
        />
      </label>
      <div className="flex shrink-0 flex-wrap gap-2">
        {[ALL, ...CATEGORIES].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1.5 text-xs ${item === category ? "bg-ink text-white" : "bg-blush text-ink ring-1 ring-pink-100"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {visible.map((service) => {
          const selected = service.id === group?.id;
          const hasLengths = service.variants.some((variant) => variant.hairLength);
          const picked = hasLengths && selected ? service.variants.find((variant) => variant.id === variantId) : undefined;
          const pickedGuide = picked?.hairLength ? lengthItem(lengthGuide, picked.hairLength) : null;
          return (
            <div key={service.id} ref={selected ? openRow : undefined} className={`rounded-2xl ${selected ? "bg-berry text-white" : "bg-blush text-ink"}`}>
              <button
                type="button"
                onClick={() => {
                  setGroup(service.id);
                  const preferred = service.variants.find((item) => item.hairLength === "medium") ?? service.variants[0];
                  setVariant(preferred.id);
                  setLengthsOpen(hasLengths);
                }}
                className="block w-full px-4 py-3 text-left text-sm"
              >
                <span className="block font-semibold">{service.name}</span>
                <span className={`block text-xs ${selected ? "text-white/80" : "text-mauve"}`}>{service.category}</span>
              </button>
              {selected && hasLengths ? (
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    aria-expanded={lengthsOpen}
                    onClick={() => setLengthsOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/15 px-3 py-2 text-left text-sm text-white"
                  >
                    <span>
                      <span className="block text-xs text-white/75">{lengthsOpen ? "Zwiń długość" : "Pokaż długość"}</span>
                      <span className="font-semibold">{pickedGuide ? `${pickedGuide.title} · ${pickedGuide.mark}` : copy.length}</span>
                    </span>
                    <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${lengthsOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${lengthsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="min-h-0 overflow-hidden" inert={!lengthsOpen} aria-hidden={!lengthsOpen}>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {service.variants.map((variant) => {
                          const item = variant.hairLength ? lengthItem(lengthGuide, variant.hairLength) : null;
                          const active = variant.id === variantId;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => setVariant(variant.id)}
                              className={`rounded-2xl px-3 py-2 text-left text-sm ${active ? "bg-ink text-white" : "bg-white text-ink"}`}
                            >
                              <span className="block font-semibold">{item?.title ?? variant.label}</span>
                              {item ? <span className={`block text-xs ${active ? "text-white/75" : "text-berry"}`}>{item.mark}</span> : null}
                              <span className={`block text-xs ${active ? "text-white/80" : "text-mauve"}`}>
                                {formatPln(variant.priceCents)} · {variant.durationMinutes} {copy.minutes}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {chosen?.hairLength ? <p className="mt-2 text-xs leading-5 text-white/90">{lengthItem(lengthGuide, chosen.hairLength).hint}</p> : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {visible.length === 0 ? <p className="text-sm text-ink">Nie ma takiej usługi.</p> : null}
      </div>
    </div>
  );
}
