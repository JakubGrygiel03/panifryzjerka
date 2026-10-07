"use client";

import { useEffect, useState } from "react";
import { WaitlistForm } from "@/components/booking/waitlist-form";
import { findVariant } from "@/lib/booking/catalog";
import type { PublicSlot } from "@/lib/booking/types";
import { addDays, formatWarsawTime, warsawToday } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

function weekdayOf(day: string) {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

function warsawHour(iso: string) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date(iso))
    .find((part) => part.type === "hour")?.value;
  return Number(hour ?? "0");
}

function isClosed(day: string) {
  return weekdayOf(day) === 0;
}

function firstOpenDay(from: string) {
  for (let index = 0; index < 21; index += 1) {
    const day = addDays(from, index);
    if (!isClosed(day)) return day;
  }
  return from;
}

async function readSlots(response: Response): Promise<PublicSlot[]> {
  const text = (await response.text()).replace(/^\uFEFF/, "").trim();
  if (!text) return [];
  let body: { slots?: PublicSlot[]; error?: string };
  try {
    body = JSON.parse(text) as { slots?: PublicSlot[]; error?: string };
  } catch {
    throw new Error("Nie udało się odczytać terminów. Odśwież okno i spróbuj jeszcze raz.");
  }
  if (!response.ok) throw new Error(body.error ?? "Nie udało się odczytać terminów.");
  return Array.isArray(body.slots) ? body.slots : [];
}

export function StepDateTime() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = t(locale);
  const localeTag = locale === "RU" ? "ru-RU" : "pl-PL";
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
  const activeDate = date && !isClosed(date) ? date : firstOpenDay(today);
  const closed = isClosed(activeDate);

  useEffect(() => {
    if (!date || isClosed(date)) setDate(firstOpenDay(today));
  }, [date, setDate, today]);

  useEffect(() => {
    if (!variantId || closed) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ date: activeDate, variantId, staffId });
    fetch(`/api/booking/slots?${params.toString()}`, { signal: controller.signal })
      .then(readSlots)
      .then(setSlots)
      .catch((fetchError: Error) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [activeDate, variantId, staffId, closed]);

  const chosen = slots.find((slot) => slot.available && slot.start === slotStart);
  const durationMinutes = (variantId ? findVariant(variantId)?.variant.durationMinutes : null) ?? null;
  const visitEnd = chosen && durationMinutes ? new Date(new Date(chosen.start).getTime() + durationMinutes * 60_000).toISOString() : chosen?.end;
  const dayTitle = new Intl.DateTimeFormat(localeTag, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${activeDate}T12:00:00Z`));
  const periods = [
    { id: "morning", label: locale === "RU" ? "Утро" : "Rano", slots: slots.filter((slot) => warsawHour(slot.start) < 12) },
    { id: "afternoon", label: locale === "RU" ? "День" : "Popołudnie", slots: slots.filter((slot) => { const hour = warsawHour(slot.start); return hour >= 12 && hour < 17; }) },
    { id: "evening", label: locale === "RU" ? "Вечер" : "Wieczór", slots: slots.filter((slot) => warsawHour(slot.start) >= 17) },
  ].filter((period) => period.slots.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((day) => {
          const shut = isClosed(day);
          const name =
            day === today
              ? locale === "RU" ? "сегодня" : "dziś"
              : day === addDays(today, 1)
                ? locale === "RU" ? "завтра" : "jutro"
                : new Intl.DateTimeFormat(localeTag, { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
          return (
            <button
              key={day}
              type="button"
              disabled={shut}
              onClick={() => setDate(day)}
              className={`flex w-[4.6rem] shrink-0 flex-col items-center rounded-2xl px-2 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-45 ${
                day === activeDate ? "bg-ink text-white" : "bg-blush text-ink"
              }`}
            >
              <span className="text-[11px] capitalize">{name}</span>
              <span className="mt-0.5 font-display text-2xl leading-none">{Number(day.slice(8))}</span>
              {shut ? <span className="mt-1 text-[10px]">{locale === "RU" ? "выходной" : "nieczynne"}</span> : null}
            </button>
          );
        })}
      </div>
      <p className="shrink-0 font-display text-xl capitalize">{dayTitle}</p>
      {chosen ? (
        <p className="mt-1 shrink-0 text-sm text-ink">
          {formatWarsawTime(chosen.start)}–{formatWarsawTime(visitEnd ?? chosen.end)}
        </p>
      ) : (
        <p className="mt-1 shrink-0 text-sm text-mauve">{locale === "RU" ? "Выберите время начала." : "Wybierz godzinę rozpoczęcia."}</p>
      )}
      {closed ? <p className="mt-3 text-sm text-ink">{locale === "RU" ? "В воскресенье салон закрыт. Выберите другой день." : "W niedzielę salon jest nieczynny. Wybierz inny dzień."}</p> : null}
      {loading ? <p className="mt-3 text-sm text-mauve">{locale === "RU" ? "Ищу время…" : "Szukam godzin…"}</p> : null}
      {error ? <p className="mt-3 text-sm text-berry">{error}</p> : null}
      {!loading && !closed && slots.length === 0 ? <p className="mt-3 text-sm text-mauve">{copy.noSlots}</p> : null}
      {!loading && !closed && !slots.some((slot) => slot.available) ? (
        <WaitlistForm date={activeDate} serviceName={findVariant(variantId ?? "")?.group.name ?? copy.book} />
      ) : null}
      <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {periods.map((period) => (
          <section key={period.id}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-mauve uppercase">{period.label}</h3>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {period.slots.map((slot) => {
                const selected = slot.available && slotStart === slot.start;
                return (
                  <button
                    key={`${slot.start}-${slot.staffId}`}
                    type="button"
                    disabled={!slot.available}
                    aria-label={slot.available ? formatWarsawTime(slot.start) : `${formatWarsawTime(slot.start)}, ${locale === "RU" ? "занято" : "zajęte"}`}
                    onClick={() => setSlot(slot)}
                    className={`rounded-full px-2 py-2.5 text-sm font-semibold ${
                      !slot.available
                        ? "cursor-not-allowed bg-ink/5 text-mauve line-through"
                        : selected
                          ? "bg-berry text-white"
                          : "bg-white text-ink ring-1 ring-pink-200"
                    }`}
                  >
                    {formatWarsawTime(slot.start)}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
