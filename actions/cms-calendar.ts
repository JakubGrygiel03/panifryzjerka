"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SALON, STAFF } from "@/lib/brand";
import { mergeHourStarts } from "@/lib/booking/day-hours";
import { listAppointmentsBetween, updateAppointmentStatus } from "@/lib/booking/repository";
import { dayOfWeekInTimeZone, zonedLocalToUtc } from "@/lib/booking/slot-calculator";
import { createTimeOffRanges, deleteTimeOff, listTimeOffRows } from "@/lib/booking/time-offs";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";

type Result = { ok: true } | { ok: false; error: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLOT = /^([01]\d|2[0-3]):(00|30)$/;

async function requireAdmin(): Promise<string | null> {
  const jar = await cookies();
  if (!isAdminCookieValue(jar.get(ADMIN_COOKIE)?.value)) return "Zaloguj się w panelu.";
  return null;
}

function refresh() {
  revalidatePath("/admin/kalendarz");
  revalidatePath("/rezerwacja");
}

function hourAllowed(date: string, label: string) {
  if (!DATE.test(date) || !SLOT.test(label)) return false;
  const weekday = dayOfWeekInTimeZone(date, SALON.timezone);
  if (weekday === 0) return false;
  const [hourText, minuteText] = label.split(":");
  const minutes = Number(hourText) * 60 + Number(minuteText);
  const end = weekday === 6 ? 18 * 60 : 20 * 60;
  return minutes >= 9 * 60 && minutes < end;
}

function overlaps(start: string, end: string, row: { startsAt: string; endsAt: string }) {
  return new Date(start).getTime() < new Date(row.endsAt).getTime() && new Date(row.startsAt).getTime() < new Date(end).getTime();
}

export async function blockHours(date: string, labels: string[]): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const unique = [...new Set(labels)];
  if (unique.length === 0) return { ok: false, error: "Zaznacz godziny, które mają zniknąć z rezerwacji." };
  if (unique.some((label) => !hourAllowed(date, label))) {
    return { ok: false, error: "Te godziny są poza dniem pracy salonu." };
  }

  const starts = unique.map((label) => zonedLocalToUtc(date, label, SALON.timezone).toISOString());
  const ranges = mergeHourStarts(starts);
  const dayStart = zonedLocalToUtc(date, "00:00", SALON.timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const visits = await listAppointmentsBetween(dayStart, dayEnd);
  const active = visits.filter((row) => row.status !== "cancelled" && row.staffId === STAFF.iryna.id);
  if (ranges.some((range) => active.some((visit) => overlaps(range.startsAt, range.endsAt, visit)))) {
    return { ok: false, error: "W tych godzinach jest już wizyta. Odwołaj ją albo wybierz inne godziny." };
  }

  try {
    await createTimeOffRanges(ranges);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zapisać blokady." };
  }
  refresh();
  return { ok: true };
}

export async function releaseHour(date: string, label: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  if (!hourAllowed(date, label)) return { ok: false, error: "Nie ma takiej godziny w grafiku." };

  const start = zonedLocalToUtc(date, label, SALON.timezone);
  const end = new Date(start.getTime() + 30 * 60_000);
  const dayStart = zonedLocalToUtc(date, "00:00", SALON.timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const blocks = await listTimeOffRows([STAFF.iryna.id], dayStart, dayEnd);
  const block = blocks.find((row) => overlaps(start.toISOString(), end.toISOString(), row));
  if (!block) return { ok: true };

  const startMs = start.getTime();
  const endMs = end.getTime();
  const blockStart = new Date(block.startsAt).getTime();
  const blockEnd = new Date(block.endsAt).getTime();
  const pieces: { startsAt: string; endsAt: string }[] = [];
  if (blockStart < startMs) pieces.push({ startsAt: new Date(blockStart).toISOString(), endsAt: new Date(startMs).toISOString() });
  if (endMs < blockEnd) pieces.push({ startsAt: new Date(endMs).toISOString(), endsAt: new Date(blockEnd).toISOString() });

  try {
    await deleteTimeOff(block.id);
    if (pieces.length > 0) await createTimeOffRanges(pieces);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zwolnić godziny." };
  }
  refresh();
  return { ok: true };
}

export async function removeBlock(id: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Nie znaleziono blokady." };
  try {
    await deleteTimeOff(id);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się zdjąć blokady." };
  }
  refresh();
  return { ok: true };
}

export async function cancelVisit(id: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Nie znaleziono wizyty." };
  try {
    await updateAppointmentStatus(id, "cancelled");
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Nie udało się odwołać wizyty." };
  }
  refresh();
  return { ok: true };
}
