import { ClientList } from "@/components/salon/client-list";
import { findVariant } from "@/lib/booking/catalog";
import { listAppointments } from "@/lib/booking/repository";
import { formatWarsawDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const rows = await listAppointments();
  const grouped = new Map<string, { name: string; phone: string; visits: number; last: string; lastService: string }>();
  for (const row of rows) {
    const current = grouped.get(row.customerPhone) ?? {
      name: row.customerName,
      phone: row.customerPhone,
      visits: 0,
      last: row.startsAt,
      lastService: findVariant(row.serviceId)?.group.name ?? "Usługa",
    };
    current.visits += 1;
    if (row.startsAt > current.last) {
      current.last = row.startsAt;
      current.lastService = findVariant(row.serviceId)?.group.name ?? current.lastService;
      current.name = row.customerName;
    }
    grouped.set(row.customerPhone, current);
  }

  const clients = [...grouped.values()].sort((left, right) => right.last.localeCompare(left.last));

  return (
    <section>
      <h1 className="mb-4 font-display text-3xl">Klientki</h1>
      {clients.length === 0 ? (
        <p className="text-mauve">Jeszcze nie ma zapisanych wizyt.</p>
      ) : (
        <ClientList
          clients={clients.map((client) => ({
            name: client.name,
            phone: client.phone,
            visits: client.visits,
            lastLabel: formatWarsawDate(client.last),
            lastService: client.lastService,
          }))}
        />
      )}
    </section>
  );
}
