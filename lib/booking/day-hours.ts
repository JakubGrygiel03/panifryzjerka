import { SALON } from "@/lib/brand";
import { zonedLocalToUtc } from "@/lib/booking/slot-calculator";
import type { TimeOffRow } from "@/lib/booking/time-offs";

export type HourState = "free" | "booked" | "blocked";

export type HourCell = {
  label: string;
  startsAt: string;
  endsAt: string;
  state: HourState;
  blockId: string | null;
};

type Window = { dayOfWeek: number; startTime: string; endTime: string };
type Span = { start: string; end: string };

function warsawLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SALON.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function hits(start: Date, end: Date, span: Span) {
  return start.getTime() < new Date(span.end).getTime() && new Date(span.start).getTime() < end.getTime();
}

export function buildHourCells(
  date: string,
  windows: Window[],
  appointments: Span[],
  blocks: TimeOffRow[],
  extras: string[] = [],
): HourCell[] {
  const cells: HourCell[] = [];
  for (const window of windows) {
    const windowStart = zonedLocalToUtc(date, window.startTime.slice(0, 5), SALON.timezone);
    const windowEnd = zonedLocalToUtc(date, window.endTime.slice(0, 5), SALON.timezone);
    const points = new Map<number, Date>();
    for (let cursor = windowStart; cursor < windowEnd; cursor = new Date(cursor.getTime() + 30 * 60_000)) {
      points.set(cursor.getTime(), cursor);
    }
    for (const iso of extras) {
      const point = new Date(iso);
      if (Number.isNaN(point.getTime())) continue;
      if (point.getTime() > windowStart.getTime() && point.getTime() < windowEnd.getTime()) {
        points.set(point.getTime(), point);
      }
    }
    const starts = [...points.values()].sort((left, right) => left.getTime() - right.getTime());
    for (let index = 0; index < starts.length; index += 1) {
      const start = starts[index];
      const following = starts[index + 1] ?? windowEnd;
      const end = new Date(Math.min(start.getTime() + 30 * 60_000, following.getTime(), windowEnd.getTime()));
      if (end.getTime() <= start.getTime()) continue;
      const block = blocks.find((row) => hits(start, end, { start: row.startsAt, end: row.endsAt }));
      const booked = appointments.some((row) => hits(start, end, row));
      cells.push({
        label: warsawLabel(start),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        state: booked ? "booked" : block ? "blocked" : "free",
        blockId: block?.id ?? null,
      });
    }
  }
  return cells;
}

export function mergeHourRanges(ranges: { startsAt: string; endsAt: string }[]) {
  const sorted = [...ranges].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const merged: { startsAt: string; endsAt: string }[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.endsAt === range.startsAt) last.endsAt = range.endsAt;
    else merged.push({ startsAt: range.startsAt, endsAt: range.endsAt });
  }
  return merged;
}
