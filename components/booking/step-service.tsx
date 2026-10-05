"use client";

import type { ServiceGroup } from "@/lib/booking/types";
import { formatPln } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function StepService({ services }: { services: ServiceGroup[] }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const groupId = useBookingStore((state) => state.groupId);
  const variantId = useBookingStore((state) => state.variantId);
  const setGroup = useBookingStore((state) => state.setGroup);
  const setVariant = useBookingStore((state) => state.setVariant);
  const group = services.find((item) => item.id === groupId) ?? null;

  return (
    <div className="space-y-3">
      <div className="max-h-52 space-y-2 overflow-auto pr-1">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => {
              setGroup(service.id);
              const preferred = service.variants.find((item) => item.hairLength === "medium") ?? service.variants[0];
              setVariant(preferred.id);
            }}
            className={`block w-full rounded-2xl px-4 py-3 text-left text-sm ${
              service.id === group?.id ? "bg-berry text-white" : "bg-blush text-ink"
            }`}
          >
            {service.name}
          </button>
        ))}
      </div>
      {group ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-mauve">{copy.length}</p>
          <div className="flex flex-wrap gap-2">
            {group.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariant(variant.id)}
                className={`rounded-full px-3 py-2 text-sm ${
                  variant.id === variantId ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-pink-100"
                }`}
              >
                {(variant.hairLength === "short" && copy.short) ||
                  (variant.hairLength === "medium" && copy.medium) ||
                  (variant.hairLength === "long" && copy.long) ||
                  (variant.hairLength === "very_long" && copy.veryLong) ||
                  variant.label}{" "}
                · {formatPln(variant.priceCents)} · {variant.durationMinutes} {copy.minutes}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
