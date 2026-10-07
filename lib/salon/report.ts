import { findPublishedVariant } from "@/lib/cms/store";
import { listAppointments } from "@/lib/booking/repository";
import type { AppointmentStatus, StoredAppointment } from "@/lib/booking/types";
import { listWait, readNotes, takingOn, takingsInMonth, phoneKey } from "@/lib/salon/desk";
import { addDays, formatPln, formatWarsawDate, formatWarsawTime, warsawToday } from "@/lib/utils";

export function warsawDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function serviceOf(serviceId: string) {
  const match = findPublishedVariant(serviceId);
  return {
    name: match?.group.name ?? "Wizyta",
    priceCents: match?.variant.priceCents ?? 0,
  };
}

export type ClientVisit = {
  id: string;
  when: string;
  service: string;
  price: string;
  status: AppointmentStatus;
};

export type ClientCard = {
  key: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  visits: ClientVisit[];
};

export async function clientCards(): Promise<ClientCard[]> {
  const [rows, notes] = await Promise.all([listAppointments(), readNotes()]);
  const grouped = new Map<string, StoredAppointment[]>();
  for (const row of rows) {
    const key = phoneKey(row.customerPhone);
    if (!key) continue;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }
  return [...grouped.entries()]
    .map(([key, visits]) => {
      const latest = [...visits].sort((left, right) => right.startsAt.localeCompare(left.startsAt));
      const head = latest[0];
      return {
        key,
        name: head.customerName,
        phone: head.customerPhone,
        email: latest.find((row) => row.customerEmail)?.customerEmail ?? "",
        note: notes[key] ?? "",
        visits: latest.map((row) => {
          const service = serviceOf(row.serviceId);
          return {
            id: row.id,
            when: `${formatWarsawDate(row.startsAt)}, ${formatWarsawTime(row.startsAt)}`,
            service: service.name,
            price: formatPln(service.priceCents),
            status: row.status,
          };
        }),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "pl"));
}

export async function homePulse() {
  const [rows, waiting] = await Promise.all([listAppointments(), listWait()]);
  const today = warsawToday();
  const active = rows.filter((row) => row.status !== "cancelled");
  return {
    today: active.filter((row) => warsawDay(row.startsAt) === today).length,
    waiting: waiting.filter((row) => !row.done).length,
  };
}

export type PeopleRow = {
  id: string;
  name: string;
  phone: string;
  service: string;
  when: string;
  price: string;
  priceCents: number;
  status: AppointmentStatus;
  day: string;
};

export async function bookingReport() {
  const rows = await listAppointments();
  const today = warsawToday();
  const month = today.slice(0, 7);
  const people: PeopleRow[] = rows.map((row) => {
    const service = serviceOf(row.serviceId);
    return {
      id: row.id,
      name: row.customerName,
      phone: row.customerPhone,
      service: service.name,
      when: `${formatWarsawDate(row.startsAt)}, ${formatWarsawTime(row.startsAt)}`,
      price: formatPln(service.priceCents),
      priceCents: service.priceCents,
      status: row.status,
      day: warsawDay(row.startsAt),
    };
  });
  const inMonth = people.filter((row) => row.day.startsWith(month) && row.status !== "cancelled");
  const upcoming = people
    .filter((row) => row.day >= today && row.status !== "cancelled")
    .sort((left, right) => left.day.localeCompare(right.day))
    .slice(0, 8);
  const recent = [...people].sort((left, right) => right.day.localeCompare(left.day)).slice(0, 12);
  const byService = new Map<string, { count: number; cents: number }>();
  for (const row of inMonth) {
    const current = byService.get(row.service) ?? { count: 0, cents: 0 };
    current.count += 1;
    current.cents += row.priceCents;
    byService.set(row.service, current);
  }
  const services = [...byService.entries()]
    .map(([name, value]) => ({ name, count: value.count, money: formatPln(value.cents) }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);
  return {
    monthCount: inMonth.length,
    monthMoney: formatPln(inMonth.reduce((sum, row) => sum + row.priceCents, 0)),
    cancelled: people.filter((row) => row.day.startsWith(month) && row.status === "cancelled").length,
    cash: formatPln((await takingsInMonth(month)) * 100),
    cashToday: await takingOn(today),
    today,
    tomorrow: addDays(today, 1),
    yesterday: addDays(today, -1),
    upcoming,
    recent,
    services,
    monthRows: people.filter((row) => row.day.startsWith(month)).sort((left, right) => left.day.localeCompare(right.day)),
  };
}
