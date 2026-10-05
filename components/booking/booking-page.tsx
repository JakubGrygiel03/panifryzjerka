"use client";

import { useEffect } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { ServiceGroup } from "@/lib/booking/types";
import { useBookingStore } from "@/store/use-booking-store";

export function BookingPage({ services }: { services: ServiceGroup[] }) {
  const openBooking = useBookingStore((state) => state.openBooking);

  useEffect(() => {
    openBooking();
  }, [openBooking]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <BookingFlow services={services} />
    </div>
  );
}
