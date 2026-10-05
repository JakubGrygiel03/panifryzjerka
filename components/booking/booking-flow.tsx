"use client";

import type { ServiceGroup } from "@/lib/booking/types";
import { StepClientForm } from "@/components/booking/step-client-form";
import { StepDateTime } from "@/components/booking/step-date-time";
import { StepService } from "@/components/booking/step-service";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { useLocaleStore } from "@/store/use-locale-store";

export function BookingFlow({ services }: { services: ServiceGroup[] }) {
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

  return (
    <div>
      {confirmation ? null : (
        <ol className="mb-5 grid grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-wide">
          {progress.map((item, index) => (
            <li key={item.id} className={item.current ? "font-semibold text-berry" : "text-mauve"}>
              {index + 1}. {item.label}
            </li>
          ))}
        </ol>
      )}
      <p className="mb-4 text-sm text-mauve">Termin u Pani Iryny. Bella jest psem salonu.</p>
      {step === 1 && !confirmation ? <StepService services={services} /> : null}
      {step === 3 && !confirmation ? <StepDateTime /> : null}
      {step === 4 || confirmation ? <StepClientForm /> : null}
      {confirmation ? null : (
        <div className="mt-5 flex justify-between">
          <button type="button" disabled={step === 1} onClick={back} className="text-sm text-mauve disabled:opacity-40">
            {copy.back}
          </button>
          {step < 4 ? (
            <button type="button" onClick={next} className="rounded-full bg-ink px-4 py-2 text-sm text-white">
              {copy.next}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
