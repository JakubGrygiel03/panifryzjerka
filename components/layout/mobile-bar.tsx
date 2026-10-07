"use client";

import { Phone } from "lucide-react";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function MobileBar({ phoneHref }: { phoneHref: string }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const openBooking = useBookingStore((state) => state.openBooking);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-ink/8 bg-white/95 p-3 backdrop-blur md:hidden">
      <a href={phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-pink-200 py-3 text-sm font-semibold">
        <Phone size={16} className="text-berry" aria-hidden />
        {copy.call}
      </a>
      <button type="button" onClick={() => openBooking()} className="rounded-full bg-berry py-3 text-sm font-semibold text-white">
        {copy.book}
      </button>
    </div>
  );
}
