import { DEFAULT_WORKING_HOURS } from "@/lib/booking/catalog";
import { windowsFromHours } from "@/lib/booking/hours";
import { readCms } from "@/lib/cms/store";

export function bookingLeadMinutes() {
  const value = Number(readCms().settings?.bookingLeadMinutes);
  if (!Number.isFinite(value)) return 15;
  return Math.min(240, Math.max(0, Math.round(value)));
}

export function cmsWorkingHours() {
  const saved = readCms().settings?.openingHours;
  if (!saved?.length) return DEFAULT_WORKING_HOURS;
  return windowsFromHours(saved.map((row) => ({ day: String(row.day ?? ""), hours: String(row.hours ?? "") })));
}
