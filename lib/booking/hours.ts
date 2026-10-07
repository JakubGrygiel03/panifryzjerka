import { DEFAULT_WORKING_HOURS } from "@/lib/booking/catalog";
import type { WorkingWindow } from "@/lib/booking/types";
import type { OpeningHour } from "@/lib/content/types";

export const HALF_HOURS = Array.from({ length: 33 }, (_, index) => {
  const hour = 7 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export function splitRange(hours: string) {
  const match = hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (!match) return null;
  const start = match[1].padStart(5, "0");
  const end = match[2].padStart(5, "0");
  return { start, end };
}

export function joinRange(start: string, end: string) {
  return `${start}–${end}`;
}

function daysFor(label: string) {
  const day = label.toLowerCase();
  if (day.includes("sobot") || day.includes("суббот")) return [6];
  if (day.includes("niedz") || day.includes("воскрес")) return [0];
  if (day.includes("ponied") || day.includes("piąt") || day.includes("пятниц") || day.includes("понедельник")) return [1, 2, 3, 4, 5];
  return [1, 2, 3, 4, 5];
}

export function windowsFromHours(rows: OpeningHour[]): WorkingWindow[] {
  const windows: WorkingWindow[] = [];
  for (const row of rows) {
    const range = splitRange(row.hours);
    if (!range) continue;
    for (const dayOfWeek of daysFor(row.day)) {
      if (dayOfWeek === 0) continue;
      windows.push({ dayOfWeek, startTime: range.start, endTime: range.end });
    }
  }
  return windows.length ? windows : DEFAULT_WORKING_HOURS;
}
