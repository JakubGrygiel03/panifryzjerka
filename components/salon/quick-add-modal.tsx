"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWalkIn } from "@/actions/calendar-admin";
import { STAFF } from "@/lib/brand";
import { SERVICE_CATALOG } from "@/lib/booking/catalog";
import type { PublicSlot } from "@/lib/booking/types";
import { formatWarsawTime } from "@/lib/utils";

export function QuickAddModal({ date, onClose }: { date: string; onClose: () => void }) {
  const router = useRouter();
  const [staffId] = useState<string>(STAFF.iryna.id);
  const [variantId, setVariantId] = useState(SERVICE_CATALOG[0].variants[0].id);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [source, setSource] = useState<"phone" | "walk_in">("phone");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ date, variantId, staffId });
    fetch(`/api/booking/slots?${params.toString()}`)
      .then(async (response) => {
        const text = (await response.text()).replace(/^\uFEFF/, "").trim();
        if (!text) return [] as PublicSlot[];
        const body = JSON.parse(text) as { slots?: PublicSlot[] };
        return (body.slots ?? []).filter((slot) => slot.available);
      })
      .then((open) => {
        setSlots(open);
        setStartsAt(open[0]?.start ?? "");
      })
      .catch(() => setSlots([]));
  }, [date, variantId, staffId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await createWalkIn({ variantId, staffId, startsAt, customerName, customerPhone, source });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40 sm:items-center sm:justify-center" onClick={onClose}>
      <form onClick={(event) => event.stopPropagation()} onSubmit={submit} className="max-h-[90dvh] w-full space-y-3 overflow-auto rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-3xl">
        <h2 className="font-display text-2xl">Nowa wizyta</h2>
        <p className="text-sm">Stylistka: {STAFF.iryna.name}</p>
        <label className="block text-sm">
          Usługa
          <select value={variantId} onChange={(event) => setVariantId(event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 px-3 py-2">
            {SERVICE_CATALOG.flatMap((group) =>
              group.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {group.name} · {variant.label}
                </option>
              )),
            )}
          </select>
        </label>
        <label className="block text-sm">
          Godzina
          <select value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 px-3 py-2">
            {slots.map((slot) => (
              <option key={slot.start} value={slot.start}>
                {formatWarsawTime(slot.start)}
              </option>
            ))}
          </select>
        </label>
        <input required placeholder="Imię" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-2xl border border-pink-100 px-3 py-2" />
        <input required placeholder="Telefon" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-2xl border border-pink-100 px-3 py-2" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button type="button" onClick={() => setSource("phone")} className={`rounded-full py-2 ${source === "phone" ? "bg-ink text-white" : "bg-blush"}`}>
            Telefon
          </button>
          <button type="button" onClick={() => setSource("walk_in")} className={`rounded-full py-2 ${source === "walk_in" ? "bg-ink text-white" : "bg-blush"}`}>
            Z ulicy
          </button>
        </div>
        {error ? <p className="text-sm text-berry">{error}</p> : null}
        <button type="submit" disabled={pending || !startsAt} className="w-full rounded-full bg-berry py-3 font-semibold text-white disabled:opacity-60">
          {pending ? "…" : "Zablokuj termin"}
        </button>
      </form>
    </div>
  );
}
