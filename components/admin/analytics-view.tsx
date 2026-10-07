"use client";

import { useState, type FormEvent } from "react";
import { saveTaking } from "@/actions/desk";
import { AdminPageHeader } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import type { PeopleRow } from "@/lib/salon/report";

export function AnalyticsView({
  monthCount,
  monthMoney,
  cancelled,
  cash,
  cashToday,
  today,
  upcoming,
  recent,
  services,
  monthRows,
  views30,
}: {
  monthCount: number;
  monthMoney: string;
  cancelled: number;
  cash: string;
  cashToday: number;
  today: string;
  upcoming: PeopleRow[];
  recent: PeopleRow[];
  services: { name: string; count: number; money: string }[];
  monthRows: PeopleRow[];
  views30: number;
}) {
  const copy = adminCopy(useWritingLocale());
  const [amount, setAmount] = useState(cashToday ? String(cashToday) : "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function saveCash(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      setMessage(await saveTaking(today, Number(amount || 0)));
    } finally {
      setPending(false);
    }
  }

  function downloadCsv() {
    const status: Record<PeopleRow["status"], string> = {
      confirmed: copy.statusConfirmed,
      completed: copy.statusCompleted,
      cancelled: copy.statusCancelled,
      no_show: copy.statusNoShow,
    };
    const lines = [
      [copy.monthBooks, String(monthCount)],
      [copy.monthList, monthMoney],
      [copy.monthCash, cash],
      [copy.monthCancelled, String(cancelled)],
      [],
      ["Imię", "Telefon", "Usługa", "Termin", "Cena", "Status"],
      ...monthRows.map((row) => [row.name, row.phone, row.service, row.when, row.price, status[row.status]]),
    ];
    const csv = lines.map((cols) => cols.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analityka-${today.slice(0, 7)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <AdminPageHeader title={copy.analyticsTitle} text={copy.analyticsText} />
      <button type="button" onClick={downloadCsv} className="-mt-2 mb-6 inline-flex rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white">
        {copy.downloadCsv}
      </button>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={copy.monthBooks} value={String(monthCount)} hint={cancelled ? `${cancelled} ${copy.monthCancelled}` : ""} />
        <Stat label={copy.monthList} value={monthMoney} hint={copy.monthListHint} />
        <Stat label={copy.monthCash} value={cash} hint={copy.monthCashHint} />
      </div>
      <form onSubmit={saveCash} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 ring-1 ring-pink-100">
        <label className="text-sm font-medium text-ink">
          {copy.cashToday}
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 block w-36 rounded-full border border-pink-200 px-4 py-2 text-sm outline-none focus:border-berry"
          />
        </label>
        <button type="submit" disabled={pending} className="rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? copy.saving : copy.save}
        </button>
        {message ? <p className="text-sm text-ink">{message}</p> : null}
      </form>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <People title={copy.upcoming} rows={upcoming} empty={copy.noUpcoming} cancelledLabel={copy.statusCancelled} />
        <People title={copy.whoBookedList} rows={recent} empty={copy.noBookings} cancelledLabel={copy.statusCancelled} />
      </div>
      <section className="mt-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-pink-100">
        <h2 className="font-display text-2xl text-ink">{copy.serviceMoney}</h2>
        {services.length === 0 ? <p className="mt-3 text-sm text-mauve">{copy.noBookings}</p> : null}
        <ul className="mt-3 space-y-2">
          {services.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{row.name}</span>
              <span className="shrink-0 text-ink/70">
                {row.count} · {row.money}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-mauve">{views30} {copy.viewsFoot}</p>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-pink-100">
      <p className="text-sm text-mauve">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-4 text-mauve">{hint}</p> : null}
    </article>
  );
}

function People({ title, rows, empty, cancelledLabel }: { title: string; rows: PeopleRow[]; empty: string; cancelledLabel: string }) {
  return (
    <section className="rounded-[1.5rem] bg-white p-5 ring-1 ring-pink-100">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-mauve">{empty}</p> : null}
      <ul className="mt-3 divide-y divide-pink-100">
        {rows.map((row) => (
          <li key={row.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <span>
              <span className="font-semibold">{row.name}</span>
              <span className="text-mauve"> · {row.service}{row.status === "cancelled" ? ` · ${cancelledLabel}` : ""}</span>
              <span className="block text-xs text-mauve">{row.when}</span>
            </span>
            <span className="shrink-0">{row.price}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
