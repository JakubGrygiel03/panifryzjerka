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
    const email = customerEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(copy.emailInvalid);
      return;
    }
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
      <div className="mx-auto flex min-h-[24rem] max-w-md items-center">
        <div className="w-full rounded-[1.75rem] bg-white px-6 py-7 text-center ring-1 ring-pink-100">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-berry">{copy.bookedEyebrow}</p>
          <h3 className="mt-2 font-display text-4xl text-ink">{copy.success}</h3>
          <p className="mt-5 font-display text-4xl text-berry">{formatWarsawTime(confirmation.startsAt)}–{formatWarsawTime(confirmation.endsAt)}</p>
          <p className="mt-1 text-sm text-mauve">{formatWarsawDate(confirmation.startsAt)}</p>
          <p className="mt-4 text-lg text-ink">{confirmation.serviceName}</p>
          <p className="text-sm text-mauve">{confirmation.staffName}</p>
          <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm leading-6 text-ink">{copy.savedAddress}</p>
          <div className="mt-5 grid gap-2">
            <a href={confirmation.googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-berry px-4 py-3 text-center text-sm font-semibold text-white hover:bg-berry-deep">
              {copy.addGoogle}
            </a>
            <button
              type="button"
              className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-pink-200 hover:bg-blush"
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
        <input type="email" inputMode="email" autoComplete="email" maxLength={120} value={customerEmail} onChange={(event) => setField("customerEmail", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" />
      </label>
      <label className="block text-sm">
        {copy.note}
        <textarea value={notes} onChange={(event) => setField("notes", event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-3 py-2" rows={3} placeholder={copy.notePlaceholder} />
      </label>
      <label className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
        Strona
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </label>
      <p className="text-xs text-mauve">{copy.emailNote} {copy.payNote}</p>
      {error ? <p className="text-sm text-berry">{error}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-berry py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "…" : copy.confirm}
      </button>
    </form>
  );
}
