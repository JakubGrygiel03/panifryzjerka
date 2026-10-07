"use client";

import type { ServiceGroup } from "@/lib/booking/types";
import { DEFAULT_LENGTH_GUIDE, type LengthGuide } from "@/lib/content/length-guide";
import { StepClientForm } from "@/components/booking/step-client-form";
import { StepDateTime } from "@/components/booking/step-date-time";
import { StepService } from "@/components/booking/step-service";
import { formatPln } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function BookingFlow({ services, lengthGuide = DEFAULT_LENGTH_GUIDE }: { services: ServiceGroup[]; lengthGuide?: LengthGuide }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const step = useBookingStore((state) => state.step);
  const setStep = useBookingStore((state) => state.setStep);
  const variantId = useBookingStore((state) => state.variantId);
  const slotStart = useBookingStore((state) => state.slotStart);
  const confirmation = useBookingStore((state) => state.confirmation);

  function next() {
    if (step === 1 && variantId) setStep(3);
    else if (step === 3 && slotStart) setStep(4);
  }

  function back() {
    if (step === 4) setStep(3);
    else setStep(1);
  }

  const progress = [
    { id: 1, label: copy.steps[0], current: step === 1 },
    { id: 3, label: copy.steps[2], current: step === 3 },
    { id: 4, label: copy.steps[3], current: step === 4 },
  ];
  const chosen = services.find((service) => service.variants.some((variant) => variant.id === variantId));
  const chosenVariant = chosen?.variants.find((variant) => variant.id === variantId);
  const canNext = (step === 1 && Boolean(variantId)) || (step === 3 && Boolean(slotStart));

  return (
    <div className="flex min-h-[32rem] flex-1 flex-col">
      {confirmation ? null : (
        <div className="shrink-0 px-5 pt-4 sm:px-6">
          <ol className="grid grid-cols-3 gap-2">
            {progress.map((item, index) => (
              <li
                key={item.id}
                className={`rounded-2xl px-3 py-3 ${item.current ? "bg-berry text-white shadow-sm" : "bg-blush text-ink ring-1 ring-pink-200"}`}
              >
                <span className={`block text-xs font-semibold ${item.current ? "text-white/80" : "text-berry"}`}>Krok {index + 1}</span>
                <span className="mt-1 block font-display text-xl leading-none sm:text-2xl">{item.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-ink">Termin u Pani Iryny.</p>
          {chosen && chosenVariant && step > 1 ? (
            <p className="mt-3 rounded-2xl bg-blush px-4 py-3 text-sm text-ink">
              {chosen.name} · {formatPln(chosenVariant.priceCents)} · {chosenVariant.durationMinutes} min
            </p>
          ) : null}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden px-5 py-4 sm:px-6">
        {step === 1 && !confirmation ? <StepService services={services} lengthGuide={lengthGuide} /> : null}
        {step === 3 && !confirmation ? <StepDateTime /> : null}
        {step === 4 || confirmation ? (
          <div className="h-full overflow-y-auto">
            <StepClientForm />
          </div>
        ) : null}
      </div>
      {confirmation ? null : (
        <div className="flex shrink-0 items-center justify-between border-t border-pink-100 px-5 py-4 sm:px-6">
          <button type="button" disabled={step === 1} onClick={back} className="text-sm text-mauve disabled:opacity-40">
            {copy.back}
          </button>
          {step < 4 ? (
            <button type="button" disabled={!canNext} onClick={next} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {copy.next}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
