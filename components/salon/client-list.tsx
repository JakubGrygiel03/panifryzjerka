"use client";

import { useMemo, useState } from "react";

type ClientRow = { name: string; phone: string; visits: number; lastLabel: string; lastService: string };

export function ClientList({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(needle));
  }, [clients, query]);

  return (
    <div>
      <label className="mb-4 block text-sm">
        Szukaj klientki
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 w-full max-w-sm rounded-2xl border border-pink-100 bg-white px-3 py-2"
          placeholder="Imię albo numer"
        />
      </label>
      {visible.length === 0 ? <p className="text-mauve">Brak osób pasujących do wyszukiwania.</p> : null}
      <ul className="space-y-3">
        {visible.map((client) => (
          <li key={client.phone} className="rounded-3xl bg-white p-4">
            <p className="font-medium">{client.name}</p>
            <a href={`tel:${client.phone.replace(/[^\d+]/g, "")}`} className="text-sm text-berry">
              {client.phone}
            </a>
            <p className="text-sm text-mauve">
              {client.visits} wizyt · ostatnia {client.lastLabel} · {client.lastService}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
