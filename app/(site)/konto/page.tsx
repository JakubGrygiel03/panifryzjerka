import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/account/session";
import { findPublishedVariant } from "@/lib/cms/store";
import { listAppointments } from "@/lib/booking/repository";
import { formatWarsawDate, formatWarsawTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  confirmed: "Potwierdzona",
  completed: "Zrealizowana",
  cancelled: "Odwołana",
  no_show: "Nieobecność",
};

export default async function AccountPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/konto/logowanie");
  const rows = (await listAppointments()).filter((row) => {
    const sameId = row.customerId && row.customerId === customer.id;
    const sameEmail = row.customerEmail?.toLowerCase() === customer.email;
    return Boolean(sameId || sameEmail);
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-berry">Konto</p>
      <h1 className="mt-2 font-display text-4xl text-ink">{customer.name}</h1>
      <p className="mt-2 text-base text-ink/80">
        {customer.email}
        {customer.phone ? ` · ${customer.phone}` : ""}
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/rezerwacja" className="rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white">
          Umów wizytę
        </Link>
        <form action="/api/account/logout" method="post">
          <button type="submit" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-ink/10">
            Wyloguj się
          </button>
        </form>
      </div>
      <h2 className="mt-10 font-display text-3xl">Historia wizyt</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-base leading-7 text-ink/80">Jeszcze nie ma wizyt przypisanych do tego konta. Zapis z tym e-mailem pojawi się tutaj.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[1.75rem] bg-white p-5 ring-1 ring-pink-100">
              <p className="font-semibold text-ink">{findPublishedVariant(row.serviceId)?.group.name ?? "Wizyta"}</p>
              <p className="mt-1 text-sm text-ink/75">
                {formatWarsawDate(row.startsAt)} · {formatWarsawTime(row.startsAt)}
              </p>
              <p className="mt-1 text-sm text-mauve">{STATUS[row.status] ?? row.status}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
