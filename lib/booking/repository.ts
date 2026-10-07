import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { SALON } from "@/lib/brand";
import { DEFAULT_WORKING_HOURS, staffName } from "@/lib/booking/catalog";
import { findPublishedVariant } from "@/lib/cms/store";
import { calculateGrid, zonedLocalToUtc } from "@/lib/booking/slot-calculator";
import { listTimeOffRows } from "@/lib/booking/time-offs";
import type {
  AppointmentSource,
  AppointmentStatus,
  PublicSlot,
  SlotCalculatorInput,
  StaffDayInput,
  StoredAppointment,
} from "@/lib/booking/types";
import { bookingBackend } from "@/lib/booking/backend";
import { createAdminClient } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "local-booking.json");

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export { bookingBackend };

async function readLocal(): Promise<StoredAppointment[]> {
  try {
    const raw = (await readFile(FILE, "utf8")).replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAppointment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(rows: StoredAppointment[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
  await rename(temp, FILE);
}

function overlaps(start: string, end: string, row: StoredAppointment): boolean {
  return row.status !== "cancelled" && start < row.endsAt && row.startsAt < end;
}

type AppointmentRow = {
  id: string;
  tenant_id: string;
  service_id: string;
  staff_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  created_at: string;
};

function fromRow(row: AppointmentRow): StoredAppointment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    serviceId: row.service_id,
    staffId: row.staff_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    notes: row.notes,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

async function loadAppointments(dayStart: Date, dayEnd: Date): Promise<StoredAppointment[]> {
  if (bookingBackend() === "supabase") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("appointments")
      .select("id, tenant_id, service_id, staff_id, customer_name, customer_phone, customer_email, notes, starts_at, ends_at, status, source, created_at")
      .eq("tenant_id", SALON.tenantId)
      .lt("starts_at", dayEnd.toISOString())
      .gt("ends_at", dayStart.toISOString());
    if (error) throw new Error(error.message);
    return ((data ?? []) as AppointmentRow[]).map(fromRow);
  }

  const rows = await readLocal();
  return rows.filter((row) => row.startsAt < dayEnd.toISOString() && row.endsAt > dayStart.toISOString());
}

async function loadTimeOffs(staffIds: string[], dayStart: Date, dayEnd: Date) {
  const rows = await listTimeOffRows(staffIds, dayStart, dayEnd);
  const grouped = new Map<string, { start: Date; end: Date }[]>();
  for (const row of rows) {
    const list = grouped.get(row.staffId) ?? [];
    list.push({ start: new Date(row.startsAt), end: new Date(row.endsAt) });
    grouped.set(row.staffId, list);
  }
  return grouped;
}

async function loadWorkingHours(staffIds: string[]) {
  if (bookingBackend() !== "supabase") {
    return new Map(staffIds.map((staffId) => [staffId, DEFAULT_WORKING_HOURS]));
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("working_hours")
    .select("staff_id, day_of_week, start_time, end_time")
    .eq("tenant_id", SALON.tenantId)
    .in("staff_id", staffIds);
  if (error) throw new Error(error.message);
  const grouped = new Map<string, StaffDayInput["workingHours"]>();
  for (const row of data ?? []) {
    const list = grouped.get(row.staff_id) ?? [];
    list.push({
      dayOfWeek: row.day_of_week,
      startTime: String(row.start_time).slice(0, 5),
      endTime: String(row.end_time).slice(0, 5),
    });
    grouped.set(row.staff_id, list);
  }
  for (const staffId of staffIds) {
    if (!grouped.has(staffId)) grouped.set(staffId, DEFAULT_WORKING_HOURS);
  }
  return grouped;
}

export async function buildSlotInput(date: string, variantId: string, staffId: string): Promise<SlotCalculatorInput> {
  const match = findPublishedVariant(variantId);
  if (!match) throw new Error("Nie znaleziono usługi.");

  const staffIds = staffId === "any" ? match.group.staffIds : match.group.staffIds.filter((id) => id === staffId);
  if (staffIds.length === 0) throw new Error("Ta stylistka nie wykonuje wybranej usługi.");

  const dayStart = zonedLocalToUtc(date, "00:00", SALON.timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const [appointments, timeOffs, hours] = await Promise.all([
    loadAppointments(dayStart, dayEnd),
    loadTimeOffs(staffIds, dayStart, dayEnd),
    loadWorkingHours(staffIds),
  ]);

  const staff: StaffDayInput[] = staffIds.map((id) => ({
    staffId: id,
    workingHours: hours.get(id) ?? DEFAULT_WORKING_HOURS,
    timeOffs: timeOffs.get(id) ?? [],
    appointments: appointments
      .filter((row) => row.staffId === id && row.status !== "cancelled")
      .map((row) => ({ start: new Date(row.startsAt), end: new Date(row.endsAt) })),
  }));

  return {
    date,
    timeZone: SALON.timezone,
    durationMinutes: match.variant.durationMinutes,
    bufferMinutes: match.variant.bufferMinutes,
    slotIntervalMinutes: SALON.slotIntervalMinutes,
    staff,
  };
}

export async function listPublicSlots(date: string, variantId: string, staffId: string): Promise<PublicSlot[]> {
  const input = await buildSlotInput(date, variantId, staffId);
  input.slotIntervalMinutes = 30;
  const slots = calculateGrid(input);
  return slots.map((slot) => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
    staffId: slot.staffId,
    staffName: staffName(slot.staffId),
    available: slot.available,
  }));
}

export async function listDayAppointments(date: string): Promise<StoredAppointment[]> {
  const dayStart = zonedLocalToUtc(date, "00:00", SALON.timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const rows = await loadAppointments(dayStart, dayEnd);
  return rows
    .filter((row) => row.status !== "cancelled")
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

export async function listAppointments(): Promise<StoredAppointment[]> {
  if (bookingBackend() === "supabase") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("appointments")
      .select("id, tenant_id, service_id, staff_id, customer_name, customer_phone, customer_email, notes, starts_at, ends_at, status, source, created_at")
      .eq("tenant_id", SALON.tenantId)
      .order("starts_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return ((data ?? []) as AppointmentRow[]).map(fromRow);
  }
  if (bookingBackend() === "unconfigured") return [];
  const rows = await readLocal();
  return rows.sort((left, right) => right.startsAt.localeCompare(left.startsAt));
}

export async function saveAppointment(input: {
  serviceId: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerId?: string | null;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  source: AppointmentSource;
}): Promise<StoredAppointment> {
  const backend = bookingBackend();
  if (backend === "unconfigured") {
    throw new Error("Rezerwacje online wymagają konfiguracji Supabase.");
  }

  if (backend === "supabase") {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("create_appointment", {
      p_tenant_id: SALON.tenantId,
      p_service_id: input.serviceId,
      p_staff_id: input.staffId,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_customer_email: input.customerEmail,
      p_notes: input.notes,
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt,
      p_source: input.source,
    });
    if (error) {
      if (error.code === "23P01" || error.message.includes("zajęty")) {
        throw new Error("Ten termin został właśnie zajęty. Wybierz inną godzinę.");
      }
      throw new Error(error.message);
    }
    const row = (Array.isArray(data) ? data[0] : data) as AppointmentRow | null;
    if (!row) throw new Error("Baza nie zwróciła wizyty.");
    return fromRow(row);
  }

  return enqueue(async () => {
    const rows = await readLocal();
    const clash = rows.some(
      (row) => row.staffId === input.staffId && overlaps(input.startsAt, input.endsAt, row),
    );
    if (clash) throw new Error("Ten termin został właśnie zajęty. Wybierz inną godzinę.");
    if (rows.length >= 3000) {
      throw new Error("Lista wizyt na tym komputerze jest pełna. Podłącz bazę Supabase albo usuń stare wizyty.");
    }
    const created: StoredAppointment = {
      id: crypto.randomUUID(),
      tenantId: SALON.tenantId,
      serviceId: input.serviceId,
      staffId: input.staffId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      customerId: input.customerId ?? null,
      notes: input.notes,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: "confirmed",
      source: input.source,
      createdAt: new Date().toISOString(),
    };
    rows.push(created);
    await writeLocal(rows);
    return created;
  });
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const backend = bookingBackend();
  if (backend === "unconfigured") throw new Error("Panel wymaga konfiguracji Supabase.");

  if (backend === "supabase") {
    const admin = createAdminClient();
    const { error } = await admin
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .eq("tenant_id", SALON.tenantId);
    if (error) throw new Error(error.message);
    return;
  }

  await enqueue(async () => {
    const rows = await readLocal();
    const row = rows.find((item) => item.id === id);
    if (!row) throw new Error("Nie znaleziono wizyty.");
    row.status = status;
    await writeLocal(rows);
  });
}

export async function listStaffWorkingHours(staffId: string) {
  const hours = await loadWorkingHours([staffId]);
  return hours.get(staffId) ?? DEFAULT_WORKING_HOURS;
}

export async function listAppointmentsBetween(start: Date, end: Date) {
  return loadAppointments(start, end);
}

export function assertCatalogStaff(variantId: string, staffId: string) {
  const match = findPublishedVariant(variantId);
  if (!match) return null;
  if (!match.group.staffIds.includes(staffId)) return null;
  return match;
}
