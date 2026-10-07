"use client";

import { useMemo, useState } from "react";
import { saveClientNote } from "@/actions/desk";
import { AdminPageHeader, useSave } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import type { ClientCard } from "@/lib/salon/report";

export function ClientsView({ clients }: { clients: ClientCard[] }) {
  const copy = adminCopy(useWritingLocale());
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) => `${client.name} ${client.phone} ${client.note}`.toLowerCase().includes(needle));
  }, [clients, query]);

  return (
    <div>
      <AdminPageHeader title={copy.clientsTitle} text={copy.clientsText} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.searchClient}
        className="mb-4 w-full rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-berry"
      />
      {shown.length === 0 ? <p className="text-sm text-mauve">{copy.noClients}</p> : null}
      <div className="grid gap-4">
        {shown.map((client) => (
          <ClientRow key={client.key} client={client} />
        ))}
      </div>
    </div>
  );
}

function ClientRow({ client }: { client: ClientCard }) {
  const copy = adminCopy(useWritingLocale());
  const [note, setNote] = useState(client.note);
  const save = useSave(() => saveClientNote(client.phone, note));
  const status: Record<ClientCard["visits"][number]["status"], string> = {
    confirmed: copy.statusConfirmed,
    completed: copy.statusCompleted,
    cancelled: copy.statusCancelled,
    no_show: copy.statusNoShow,
  };

  return (
    <article className="rounded-[1.5rem] bg-white p-5 ring-1 ring-pink-100">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-ink">{client.name}</h2>
        <p className="text-sm text-mauve">{client.phone}</p>
      </div>
      <form onSubmit={save.onSubmit} className="mt-3">
        <label className="block text-sm font-medium text-ink">
          {copy.clientNote}
          <textarea
            value={note}
            rows={2}
            maxLength={280}
            placeholder={copy.clientNoteHint}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-pink-200 px-3 py-2 text-sm outline-none focus:border-berry"
          />
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button type="submit" disabled={save.pending} className="rounded-full bg-berry px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
            {save.pending ? copy.saving : copy.save}
          </button>
          {save.message ? <p className="text-sm text-ink">{save.message}</p> : null}
        </div>
      </form>
      <ul className="mt-4 divide-y divide-pink-100">
        {client.visits.slice(0, 8).map((visit) => (
          <li key={visit.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
            <span>
              {visit.service}
              <span className="text-mauve"> · {visit.when}</span>
            </span>
            <span className="text-ink/70">
              {visit.price} · {status[visit.status]}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
