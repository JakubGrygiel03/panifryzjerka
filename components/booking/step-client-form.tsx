"use client";

import { useEffect, useState } from "react";
import { createAppointment } from "@/actions/create-appointment";
import { formatWarsawDate, formatWarsawTime } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function StepClientForm() {
  const copy = t(useLocaleStore((state) => state.locale));
  const variantId = useBookingStore((state) => state.variantId);
  const slotStaffId = useBookingStore((state) => state.slotStaffId);
  const slotStart = useBookingStore((state) => state.slotStart);
  const customerName = useBookingStore((state) => state.customerName);
  const customerPhone = useBookingStore((state) => state.customerPhone);
  const customerEmail = useBookingStore((state) => state.customerEmail);
  const notes = useBookingStore((state) => state.notes);
  const setField = useBookingStore((state) => state.setField);
  const confirmation = useBookingStore((state) => state.confirmation);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pf-customer");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { name?: string; phone?: string; email?: string };
      if (parsed.name && !useBookingStore.getState().customerName) setField("customerName", parsed.name);
      if (parsed.phone && !useBookingStore.getState().customerPhone) setField("customerPhone", parsed.phone);
      if (parsed.email && !useBookingStore.getState().customerEmail) setField("customerEmail", parsed.email);
    } catch {
      localStorage.removeItem("pf-customer");
    }
  }, [setField]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!variantId || !slotStaffId || !slotStart) return;
    setPending(true);
    setError("");
    const result = await createAppointment({
      variantId,
      staffId: slotStaffId,
      startsAt: slotStart,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      website,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    localStorage.setItem(
      "pf-customer",
      JSON.stringify({ name: customerName, phone: customerPhone, email: customerEmail }),
    );
    sessionStorage.setItem("pf-confirmation", JSON.stringify(result.data));
    setConfirmation(result.data);
  }

  if (confirmation) {
    return (
      <div className="space-y-3">
        <h3 className="font-display text-3xl">{copy.success}</h3>
        <p>
          {confirmation.serviceName}, {confirmation.staffName}
        </p>
        <p className="text-sm text-mauve">
          {formatWarsawDate(confirmation.startsAt)} · {formatWarsawTime(confirmation.startsAt)}–{formatWarsawTime(confirmation.endsAt)}
        </p>
        <p className="text-sm">Gdańsk, ul. Skarpowa 24. Płatność w salonie po zabiegu.</p>
        <div className="flex flex-wrap gap-2">
          <a href={confirmation.googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white">
            {copy.addGoogle}
          </a>
          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-pink-100"
            onClick={() => {
              const blob = new Blob([confirmation.ics], { type: "text/calendar" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "wizyta-panifryzjerka.ics";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            {copy.addApple}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        {copy.name}
        <input required autoComplete="name" value={customerName} onChange={(event) => setField("customerName", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        {copy.phone}
        <input required autoComplete="tel" inputMode="tel" value={customerPhone} onChange={(event) => setField("customerPhone", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" placeholder="880 606 454" />
      </label>
      <label className="block text-sm">
        {copy.email}
        <input type="email" autoComplete="email" value={customerEmail} onChange={(event) => setField("customerEmail", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        {copy.note}
        <textarea value={notes} onChange={(event) => setField("notes", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" rows={3} placeholder="Np. rodzinna środa, męski czwartek, wcześniejsza farba" />
      </label>
      <label className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
        Strona
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </label>
      <p className="text-xs text-mauve">Płatność w salonie po zabiegu. Odwołanie: zadzwoń dzień wcześniej pod 880-606-454.</p>
      {error ? <p className="text-sm text-berry">{error}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-berry py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "…" : copy.confirm}
      </button>
    </form>
  );
}
