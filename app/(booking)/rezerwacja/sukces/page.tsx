"use client";

import { useEffect, useState } from "react";
import type { BookingConfirmation } from "@/lib/booking/types";
import { formatWarsawDate, formatWarsawTime } from "@/lib/utils";

export default function SuccessPage() {
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pf-confirmation");
    if (!raw) return;
    setConfirmation(JSON.parse(raw) as BookingConfirmation);
  }, []);

  if (!confirmation) {
    return <p className="mx-auto max-w-xl px-4 py-16 text-mauve">Brak świeżo zapisanej wizyty w tej przeglądarce.</p>;
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">Wizyta zapisana</h1>
      <p className="mt-4">
        {confirmation.serviceName} · {confirmation.staffName}
      </p>
      <p className="text-mauve">
        {formatWarsawDate(confirmation.startsAt)} · {formatWarsawTime(confirmation.startsAt)}
      </p>
      <p className="mt-2">Gdańsk, ul. Skarpowa 24</p>
      <a href={confirmation.googleCalendarUrl} className="mt-6 inline-block rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white">
        Dodaj do Kalendarza Google
      </a>
    </section>
  );
}
