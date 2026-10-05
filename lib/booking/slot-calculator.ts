import type {
  AvailableSlot,
  BusyInterval,
  SlotCalculatorInput,
  StaffDayInput,
} from "@/lib/booking/types";

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function timeZoneOffset(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  let hour = pick("hour");
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(pick("year"), pick("month") - 1, pick("day"), hour, pick("minute"), pick("second"));
  return asUtc - date.getTime();
}

export function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const firstOffset = timeZoneOffset(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = timeZoneOffset(firstPass, timeZone);
  return secondOffset === firstOffset ? firstPass : new Date(utcGuess.getTime() - secondOffset);
}

export function dayOfWeekInTimeZone(date: string, timeZone: string): number {
  const noon = zonedLocalToUtc(date, "12:00", timeZone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(noon);
  return WEEKDAY[weekday] ?? 0;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlaps(start: Date, end: Date, busy: BusyInterval): boolean {
  return start < busy.end && busy.start < end;
}

export function staffBookedMinutes(staff: StaffDayInput, dayStart: Date, dayEnd: Date): number {
  return staff.appointments.reduce((total, appointment) => {
    const start = appointment.start > dayStart ? appointment.start : dayStart;
    const end = appointment.end < dayEnd ? appointment.end : dayEnd;
    if (end <= start) return total;
    return total + (end.getTime() - start.getTime()) / 60_000;
  }, 0);
}

export function calculateStaffSlots(input: SlotCalculatorInput, staff: StaffDayInput): AvailableSlot[] {
  const dayOfWeek = dayOfWeekInTimeZone(input.date, input.timeZone);
  const windows = staff.workingHours.filter((window) => window.dayOfWeek === dayOfWeek);
  const earliest = addMinutes(input.now ?? new Date(), input.leadMinutes ?? 30);
  const occupiedMinutes = input.durationMinutes + input.bufferMinutes;
  const slots: AvailableSlot[] = [];

  for (const window of windows) {
    const startTime = window.startTime.slice(0, 5);
    const endTime = window.endTime.slice(0, 5);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const windowStartMinute = startHour * 60 + startMinute;
    const windowEndMinute = endHour * 60 + endMinute;
    const windowStart = zonedLocalToUtc(input.date, startTime, input.timeZone);
    const windowEnd = zonedLocalToUtc(input.date, endTime, input.timeZone);

    for (
      let minute = windowStartMinute;
      minute + occupiedMinutes <= windowEndMinute;
      minute += input.slotIntervalMinutes
    ) {
      const label = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const start = zonedLocalToUtc(input.date, label, input.timeZone);
      const end = addMinutes(start, occupiedMinutes);
      if (start < windowStart || end > windowEnd || start < earliest) continue;

      const blocked = [...staff.timeOffs, ...staff.appointments].some((busy) => overlaps(start, end, busy));
      if (!blocked) slots.push({ start, end, staffId: staff.staffId });
    }
  }

  return slots;
}

export function calculateSlots(input: SlotCalculatorInput): AvailableSlot[] {
  return input.staff
    .flatMap((staff) => calculateStaffSlots(input, staff))
    .sort((left, right) => left.start.getTime() - right.start.getTime() || left.staffId.localeCompare(right.staffId));
}

export function calculateAnyStaffSlots(input: SlotCalculatorInput): AvailableSlot[] {
  const dayStart = zonedLocalToUtc(input.date, "00:00", input.timeZone);
  const dayEnd = addMinutes(dayStart, 24 * 60);
  const load = new Map(
    input.staff.map((staff) => [staff.staffId, staffBookedMinutes(staff, dayStart, dayEnd)]),
  );
  const grouped = new Map<number, AvailableSlot[]>();

  for (const slot of calculateSlots(input)) {
    const key = slot.start.getTime();
    const list = grouped.get(key) ?? [];
    list.push(slot);
    grouped.set(key, list);
  }

  const merged: AvailableSlot[] = [];
  for (const options of grouped.values()) {
    options.sort((left, right) => {
      const difference = (load.get(left.staffId) ?? 0) - (load.get(right.staffId) ?? 0);
      return difference === 0 ? left.staffId.localeCompare(right.staffId) : difference;
    });
    merged.push(options[0]);
  }

  return merged.sort((left, right) => left.start.getTime() - right.start.getTime());
}
