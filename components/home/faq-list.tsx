"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqList({ items, searchable = false }: { items: readonly { q: string; a: string }[]; searchable?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.map((item, index) => ({ item, index }));
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => `${item.q} ${item.a}`.toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div>
      {searchable ? (
        <label className="mb-4 block text-sm font-medium text-ink">
          Szukaj pytania
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 w-full rounded-full bg-white px-4 py-3 text-sm ring-1 ring-ink/10 outline-none"
            placeholder="np. pies, parking, odwołanie"
          />
        </label>
      ) : null}
      <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/10">
        {visible.length === 0 ? <p className="px-6 py-5 text-sm text-ink">Nie ma takiego pytania.</p> : null}
        {visible.map(({ item, index }) => {
          const isOpen = open === index || query.trim().length > 0;
          return (
            <div key={item.q} className="border-b border-ink/10 last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen && !query.trim() ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-ink transition-colors duration-200 hover:bg-blush"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={`shrink-0 text-ink transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-base leading-7 text-ink">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
