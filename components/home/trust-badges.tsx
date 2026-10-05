"use client";

import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function TrustBadges() {
  const copy = t(useLocaleStore((state) => state.locale));
  const items = [copy.dogs, copy.parking, copy.access];

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/80">
      {items.map((label, index) => (
        <li key={label} className="flex items-center gap-4">
          {index > 0 ? <span className="h-1 w-1 rounded-full bg-berry" aria-hidden /> : null}
          {label}
        </li>
      ))}
    </ul>
  );
}
