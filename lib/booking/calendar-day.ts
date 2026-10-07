import { SALON, STAFF } from "@/lib/brand";
import { findPublishedVariant } from "@/lib/cms/store";
import { buildHourCells, type HourCell } from "@/lib/booking/day-hours";
import { listAppointmentsBetween, listStaffWorkingHours } from "@/lib/booking/repository";
import { dayOfWeekInTimeZone, zonedLocalToUtc } from "@/lib/booking/slot-calculator";
import { listTimeOffRows, type TimeOffRow } from "@/lib/booking/time-offs";
import { formatWarsawTime } from "@/lib/utils";

export type CalendarVisit = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  timeLabel: string;
};

export type CalendarMonthDay = {
  date: string;
  bookings: number;
  blocked: boolean;
};

export type CalendarDay = {
  date: string;
  closed: boolean;
  visits: CalendarVisit[];
  blocks: TimeOffRow[];
  cells: HourCell[];
  monthDays: CalendarMonthDay[];
};

function dateKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = zonedLocalToUtc(`${month}-01`, "00:00", SALON.timezone);
  const nextMonth = monthNumber === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNumber + 1).padStart(2, "0")}-01`;
  const end = zonedLocalToUtc(nextMonth, "00:00", SALON.timezone);
  return { start, end };
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function loadCalendarDay(date: string, month: string): Promise<CalendarDay> {
  const dayStart = zonedLocalToUtc(date, "00:00", SALON.timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const { start: monthStart, end: monthEnd } = monthBounds(month);
  const [hours, dayVisits, dayBlocks, monthVisits, monthBlocks] = await Promise.all([
    listStaffWorkingHours(STAFF.iryna.id),
    listAppointmentsBetween(dayStart, dayEnd),
    listTimeOffRows([STAFF.iryna.id], dayStart, dayEnd),
    listAppointmentsBetween(monthStart, monthEnd),
    listTimeOffRows([STAFF.iryna.id], monthStart, monthEnd),
  ]);
  const weekday = dayOfWeekInTimeZone(date, SALON.timezone);
  const windows = hours.filter((window) => window.dayOfWeek === weekday);
  const active = dayVisits.filter((row) => row.status !== "cancelled" && row.staffId === STAFF.iryna.id);
  const visits: CalendarVisit[] = active
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .map((row) => {
      const match = findPublishedVariant(row.serviceId);
      const visitEnd = match
        ? new Date(new Date(row.startsAt).getTime() + match.variant.durationMinutes * 60_000).toISOString()
        : row.endsAt;
      return {
        id: row.id,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        serviceName: match?.group.name ?? "Wizyta",
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        timeLabel: `${formatWarsawTime(row.startsAt)}–${formatWarsawTime(visitEnd)}`,
      };
    });

  const counts = new Map<string, number>();
  for (const row of monthVisits) {
    if (row.status === "cancelled" || row.staffId !== STAFF.iryna.id) continue;
    const key = dateKey(row.startsAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const blockedDays = new Set<string>();
  for (const row of monthBlocks) {
    const cursor = new Date(row.startsAt);
    const end = new Date(row.endsAt);
    while (cursor < end) {
      blockedDays.add(dateKey(cursor.toISOString()));
      cursor.setTime(cursor.getTime() + 60 * 60_000);
    }
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const monthDays: CalendarMonthDay[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${month}-${String(day).padStart(2, "0")}`;
    monthDays.push({
      date: key,
      bookings: counts.get(key) ?? 0,
      blocked: blockedDays.has(key),
    });
  }

  return {
    date,
    closed: windows.length === 0,
    visits,
    blocks: dayBlocks.sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    cells: buildHourCells(
      date,
      windows,
      active.map((row) => ({ start: row.startsAt, end: row.endsAt })),
      dayBlocks,
      [
        ...active.flatMap((row) => [row.startsAt, row.endsAt]),
        ...dayBlocks.flatMap((row) => [row.startsAt, row.endsAt]),
      ],
    ),
    monthDays,
  };
}
