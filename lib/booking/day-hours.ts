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
): HourCell[] {
  const cells: HourCell[] = [];
  for (const window of windows) {
    let cursor = zonedLocalToUtc(date, window.startTime.slice(0, 5), SALON.timezone);
    const windowEnd = zonedLocalToUtc(date, window.endTime.slice(0, 5), SALON.timezone);
    while (cursor < windowEnd) {
      const next = new Date(Math.min(cursor.getTime() + 60 * 60_000, windowEnd.getTime()));
      if (next.getTime() - cursor.getTime() < 30 * 60_000) break;
      const block = blocks.find((row) => hits(cursor, next, { start: row.startsAt, end: row.endsAt }));
      const booked = appointments.some((row) => hits(cursor, next, row));
      cells.push({
        label: warsawLabel(cursor),
        startsAt: cursor.toISOString(),
        endsAt: next.toISOString(),
        state: booked ? "booked" : block ? "blocked" : "free",
        blockId: block?.id ?? null,
      });
      cursor = next;
    }
  }
  return cells;
}

export function mergeHourStarts(startsAt: string[]) {
  const sorted = [...new Set(startsAt)].sort();
  const ranges: { startsAt: string; endsAt: string }[] = [];
  let currentStart = "";
  let currentEnd = "";
  for (const start of sorted) {
    const end = new Date(new Date(start).getTime() + 60 * 60_000).toISOString();
    if (!currentEnd || start !== currentEnd) {
      if (currentStart) ranges.push({ startsAt: currentStart, endsAt: currentEnd });
      currentStart = start;
      currentEnd = end;
    } else {
      currentEnd = end;
    }
  }
  if (currentStart) ranges.push({ startsAt: currentStart, endsAt: currentEnd });
  return ranges;
}
