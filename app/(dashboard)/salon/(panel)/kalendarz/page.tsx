import { DayBoard, type DayItem } from "@/components/salon/day-board";
import { findVariant } from "@/lib/booking/catalog";
import { listDayAppointments } from "@/lib/booking/repository";
import { warsawToday } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : warsawToday();
  const rows = await listDayAppointments(date);
  const items: DayItem[] = rows.map((row) => ({
    id: row.id,
    staffId: row.staffId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status,
    source: row.source,
    serviceName: findVariant(row.serviceId)?.group.name ?? "Usługa",
  }));

  return (
    <section>
      <h1 className="mb-4 font-display text-3xl">Dzień salonu</h1>
      <DayBoard date={date} items={items} />
    </section>
  );
}
