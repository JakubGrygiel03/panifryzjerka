import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { SALON, STAFF } from "@/lib/brand";
import { bookingBackend } from "@/lib/booking/backend";
import { createAdminClient } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "time-offs.json");

export type TimeOffRow = {
  id: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

type StoredTimeOff = TimeOffRow & { tenantId: string };

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readLocal(): Promise<StoredTimeOff[]> {
  try {
    const raw = (await readFile(FILE, "utf8")).replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredTimeOff[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(rows: StoredTimeOff[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
  await rename(temp, FILE);
}

function overlaps(start: string, end: string, row: TimeOffRow) {
  return new Date(start).getTime() < new Date(row.endsAt).getTime() && new Date(row.startsAt).getTime() < new Date(end).getTime();
}

export async function listTimeOffRows(staffIds: string[], dayStart: Date, dayEnd: Date): Promise<TimeOffRow[]> {
  if (staffIds.length === 0) return [];
  const startIso = dayStart.toISOString();
  const endIso = dayEnd.toISOString();

  if (bookingBackend() === "supabase") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("time_offs")
      .select("id, staff_id, starts_at, ends_at, reason")
      .eq("tenant_id", SALON.tenantId)
      .in("staff_id", staffIds)
      .lt("starts_at", endIso)
      .gt("ends_at", startIso);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      staffId: row.staff_id as string,
      startsAt: row.starts_at as string,
      endsAt: row.ends_at as string,
      reason: (row.reason as string | null) ?? null,
    }));
  }

  if (bookingBackend() === "unconfigured") return [];
  const rows = await readLocal();
  return rows.filter((row) => {
    if (!staffIds.includes(row.staffId)) return false;
    return new Date(row.startsAt).getTime() < dayEnd.getTime() && new Date(row.endsAt).getTime() > dayStart.getTime();
  });
}

export async function createTimeOffRanges(ranges: { startsAt: string; endsAt: string }[]) {
  if (ranges.length === 0) return;
  const backend = bookingBackend();
  if (backend === "unconfigured") throw new Error("Kalendarz wymaga konfiguracji Supabase.");

  if (backend === "supabase") {
    const admin = createAdminClient();
    const { error } = await admin.from("time_offs").insert(
      ranges.map((range) => ({
        tenant_id: SALON.tenantId,
        staff_id: STAFF.iryna.id,
        starts_at: range.startsAt,
        ends_at: range.endsAt,
        reason: "Niedostępna",
      })),
    );
    if (error) {
      if (error.code === "23P01") throw new Error("Te godziny nachodzą na inną blokadę.");
      throw new Error("Nie udało się zapisać blokady.");
    }
    return;
  }

  await enqueue(async () => {
    const rows = await readLocal();
    for (const range of ranges) {
      if (rows.some((row) => row.staffId === STAFF.iryna.id && overlaps(range.startsAt, range.endsAt, row))) {
        throw new Error("Te godziny nachodzą na inną blokadę.");
      }
    }
    for (const range of ranges) {
      rows.push({
        id: crypto.randomUUID(),
        tenantId: SALON.tenantId,
        staffId: STAFF.iryna.id,
        startsAt: range.startsAt,
        endsAt: range.endsAt,
        reason: "Niedostępna",
      });
    }
    await writeLocal(rows);
  });
}

export async function deleteTimeOff(id: string) {
  const backend = bookingBackend();
  if (backend === "unconfigured") throw new Error("Kalendarz wymaga konfiguracji Supabase.");

  if (backend === "supabase") {
    const admin = createAdminClient();
    const { error } = await admin.from("time_offs").delete().eq("id", id).eq("tenant_id", SALON.tenantId);
    if (error) throw new Error("Nie udało się zdjąć blokady.");
    return;
  }

  await enqueue(async () => {
    const rows = await readLocal();
    await writeLocal(rows.filter((row) => row.id !== id));
  });
}
