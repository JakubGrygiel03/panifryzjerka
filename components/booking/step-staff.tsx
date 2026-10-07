"use client";

import { STAFF } from "@/lib/brand";
import type { ServiceGroup } from "@/lib/booking/types";
import { ruPhrase } from "@/lib/i18n/phrases";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function StepStaff({ services }: { services: ServiceGroup[] }) {
  const locale = useLocaleStore((state) => state.locale);
  const groupId = useBookingStore((state) => state.groupId);
  const staffId = useBookingStore((state) => state.staffId);
  const setStaff = useBookingStore((state) => state.setStaff);
  const group = services.find((item) => item.id === groupId);
  const options = group?.staffIds.includes(STAFF.iryna.id)
    ? [{ id: STAFF.iryna.id, name: STAFF.iryna.name, hint: STAFF.iryna.role }]
    : [];

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setStaff(option.id)}
          className={`block w-full rounded-2xl px-4 py-3 text-left ${
            staffId === option.id ? "bg-berry text-white" : "bg-blush"
          }`}
        >
          <span className="block font-medium">{option.name}</span>
          <span className={`block text-sm ${staffId === option.id ? "text-white/80" : "text-mauve"}`}>{locale === "RU" ? ruPhrase(option.hint) : option.hint}</span>
        </button>
      ))}
    </div>
  );
}
