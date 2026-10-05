"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAppointmentStatus } from "@/actions/calendar-admin";
import { STAFF } from "@/lib/brand";
import type { AppointmentStatus } from "@/lib/booking/types";
import { formatWarsawTime } from "@/lib/utils";
import { QuickAddModal } from "@/components/salon/quick-add-modal";

export type DayItem = {
  id: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  source: string;
  serviceName: string;
};

const labels: Record<AppointmentStatus, string> = {
  confirmed: "Potwierdzona",
  completed: "Zrealizowana",
  cancelled: "Odwołana",
  no_show: "Nieobecność",
};

export function DayBoard({ date, items }: { date: string; items: DayItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const columns = [STAFF.iryna];

  async function changeStatus(id: string, status: AppointmentStatus) {
    const result = await setAppointmentStatus({ id, status });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form className="flex items-center gap-2">
          <label htmlFor="day" className="text-sm text-mauve">
            Dzień
          </label>
          <input
            id="day"
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-full border border-pink-100 bg-white px-3 py-2"
            onChange={(event) => router.push(`/salon/kalendarz?date=${event.target.value}`)}
          />
        </form>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-berry px-4 py-3 text-sm font-semibold text-white">
          Dodaj wizytę
        </button>
      </div>
      {message ? <p className="mb-3 text-sm text-berry">{message}</p> : null}
      <div className="grid gap-3">
        {columns.map((person) => (
          <section key={person.id} className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="font-display text-2xl">{person.name}</h2>
            <ul className="mt-3 space-y-3">
              {items.filter((item) => item.staffId === person.id).length === 0 ? (
                <li className="text-sm text-mauve">Brak wizyt.</li>
              ) : null}
              {items
                .filter((item) => item.staffId === person.id)
                .map((item) => (
                  <li key={item.id} className="rounded-2xl bg-blush p-3">
                    <p className="font-semibold">
                      {formatWarsawTime(item.startsAt)}–{formatWarsawTime(item.endsAt)}
                    </p>
                    <p>{item.customerName}</p>
                    <a href={`tel:${item.customerPhone.replace(/[^\d+]/g, "")}`} className="text-sm text-berry">
                      {item.customerPhone}
                    </a>
                    <p className="text-sm text-mauve">
                      {item.serviceName} · {labels[item.status]} · {item.source}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["completed", "cancelled", "no_show"] as const).map((status) => (
                        <button key={status} type="button" onClick={() => changeStatus(item.id, status)} className="rounded-full bg-white px-2 py-1 text-xs">
                          {labels[status]}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      {open ? <QuickAddModal date={date} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
