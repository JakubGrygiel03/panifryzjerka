"use client";

import { useEffect } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { ServiceGroup } from "@/lib/booking/types";
import { DEFAULT_LENGTH_GUIDE, type LengthGuide } from "@/lib/content/length-guide";
import { useBookingStore } from "@/store/use-booking-store";

export function BookingPage({ services, lengthGuide = DEFAULT_LENGTH_GUIDE }: { services: ServiceGroup[]; lengthGuide?: LengthGuide }) {
  const openBooking = useBookingStore((state) => state.openBooking);

  useEffect(() => {
    openBooking();
  }, [openBooking]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <BookingFlow services={services} lengthGuide={lengthGuide} />
    </div>
  );
}
