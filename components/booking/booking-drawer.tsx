"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { ServiceGroup } from "@/lib/booking/types";
import { useBookingStore } from "@/store/use-booking-store";

export function BookingDrawer({ services }: { services: ServiceGroup[] }) {
  const pathname = usePathname();
  const open = useBookingStore((state) => state.open);
  const closeBooking = useBookingStore((state) => state.closeBooking);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeBooking();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeBooking]);

  if (!open || pathname.startsWith("/rezerwacja")) return null;

  return (
    <div className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-ink/50 md:items-center md:p-6" role="presentation" onClick={closeBooking}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="animate-rise max-h-[92dvh] w-full overflow-auto rounded-t-[1.75rem] bg-blush p-6 shadow-2xl md:max-w-lg md:rounded-[1.75rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="booking-title" className="font-display text-2xl">
            Rezerwacja
          </h2>
          <button type="button" onClick={closeBooking} aria-label="Zamknij" className="rounded-full p-2">
            <X size={18} />
          </button>
        </div>
        <BookingFlow services={services} />
      </div>
    </div>
  );
}
