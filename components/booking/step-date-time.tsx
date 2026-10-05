"use client";

import { useEffect, useState } from "react";
import type { PublicSlot } from "@/lib/booking/types";
import { addDays, formatWarsawTime, warsawToday } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function StepDateTime() {
  const copy = t(useLocaleStore((state) => state.locale));
  const variantId = useBookingStore((state) => state.variantId);
  const staffId = useBookingStore((state) => state.staffId);
  const date = useBookingStore((state) => state.date);
  const slotStart = useBookingStore((state) => state.slotStart);
  const setDate = useBookingStore((state) => state.setDate);
  const setSlot = useBookingStore((state) => state.setSlot);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = warsawToday();
  const days = Array.from({ length: 14 }, (_, index) => addDays(today, index));
  const activeDate = date ?? today;

  useEffect(() => {
    if (!date) setDate(today);
  }, [date, setDate, today]);

  useEffect(() => {
    if (!variantId || !activeDate) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ date: activeDate, variantId, staffId });
    fetch(`/api/booking/slots?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as { slots?: PublicSlot[]; error?: string };
        if (!response.ok) throw new Error(body.error ?? copy.noSlots);
        setSlots(body.slots ?? []);
      })
      .catch((fetchError: Error) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [activeDate, variantId, staffId, copy.noSlots]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {days.map((day) => {
          const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
          const name =
            day === today ? "dziś" : day === addDays(today, 1) ? "jutro" : new Intl.DateTimeFormat("pl-PL", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
          return (
            <button
              key={day}
              type="button"
              onClick={() => setDate(day)}
              className={`shrink-0 rounded-2xl px-3 py-2 text-left text-xs ${
                day === activeDate ? "bg-ink text-white" : "bg-blush text-ink"
              }`}
            >
              <span className="block capitalize">{name}</span>
              <span className="block">{day.slice(8)}.{day.slice(5, 7)}</span>
              {weekday === 0 ? <span className="text-[10px] opacity-70">{copy.closedNote}</span> : null}
            </button>
          );
        })}
      </div>
      {loading ? <p className="text-sm text-mauve">…</p> : null}
      {error ? <p className="text-sm text-berry">{error}</p> : null}
      {!loading && slots.length === 0 ? <p className="text-sm text-mauve">{copy.noSlots}</p> : null}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={`${slot.start}-${slot.staffId}`}
            type="button"
            onClick={() => setSlot(slot)}
            className={`rounded-2xl px-2 py-3 text-sm ${
              slotStart === slot.start ? "bg-berry text-white" : "bg-white ring-1 ring-pink-100"
            }`}
          >
            <span className="block font-semibold">{formatWarsawTime(slot.start)}</span>
            <span className={`block text-[11px] ${slotStart === slot.start ? "text-white/80" : "text-mauve"}`}>
              do {formatWarsawTime(slot.end)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
