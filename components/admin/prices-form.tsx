"use client";

import { useMemo, useState } from "react";
import { savePrices } from "@/actions/cms-admin";
import { AdminPageHeader, SaveBar, useSave } from "@/components/admin/editor";
import type { ServiceGroup } from "@/lib/booking/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-base font-semibold text-ink outline-none focus:border-berry";

export function PricesForm({ services }: { services: ServiceGroup[] }) {
  const [rows, setRows] = useState(services);
  const [query, setQuery] = useState("");
  const save = useSave(() => {
    const prices: Record<string, { priceCents: number; durationMinutes: number }> = {};
    for (const group of rows) {
      for (const variant of group.variants) {
        prices[variant.id] = { priceCents: variant.priceCents, durationMinutes: variant.durationMinutes };
      }
    }
    return savePrices(prices);
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .map((group, groupIndex) => ({ group, groupIndex }))
      .filter(({ group }) => !needle || `${group.name} ${group.category}`.toLowerCase().includes(needle));
  }, [rows, query]);

  function setPrice(groupIndex: number, variantIndex: number, zl: number) {
    setRows((current) =>
      current.map((item, index) =>
        index === groupIndex
          ? {
              ...item,
              variants: item.variants.map((row, rowIndex) =>
                rowIndex === variantIndex ? { ...row, priceCents: Math.round((Number.isFinite(zl) ? zl : 0) * 100) } : row,
              ),
            }
          : item,
      ),
    );
  }

  function setMinutes(groupIndex: number, variantIndex: number, minutes: number) {
    setRows((current) =>
      current.map((item, index) =>
        index === groupIndex
          ? {
              ...item,
              variants: item.variants.map((row, rowIndex) =>
                rowIndex === variantIndex ? { ...row, durationMinutes: Number.isFinite(minutes) ? minutes : row.durationMinutes } : row,
              ),
            }
          : item,
      ),
    );
  }

  return (
    <form onSubmit={save.onSubmit}>
      <AdminPageHeader title="Cennik" text="Cena i czas zabiegu. Rezerwacja liczy wolne godziny z tego czasu, a cennik na stronie pokazuje tę cenę." />
      <label className="mb-4 block text-sm font-medium text-ink">
        Szukaj usługi
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="np. odrost, grzywka, rzęsy"
          className="mt-1 w-full rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm font-normal outline-none focus:border-berry"
        />
      </label>
      <div className="grid gap-5">
        {visible.map(({ group, groupIndex }) => (
          <section key={group.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-pink-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 bg-blush px-5 py-4">
              <h2 className="font-display text-2xl text-ink">{group.name}</h2>
              <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-berry ring-1 ring-pink-100">{group.category}</p>
            </div>
            <div className="grid gap-3 p-3">
              {group.variants.map((variant, variantIndex) => (
                <div key={variant.id} className="rounded-2xl bg-blush p-3 ring-1 ring-pink-100">
                  <p className="text-sm font-semibold text-ink">{variant.label}</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-ink">
                      Cena zł
                      <input
                        aria-label={`${group.name}, ${variant.label}, cena w złotych`}
                        className={inputClass}
                        inputMode="numeric"
                        value={Math.round(variant.priceCents / 100)}
                        onChange={(event) => setPrice(groupIndex, variantIndex, Number(event.target.value))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink">
                      Minuty
                      <input
                        aria-label={`${group.name}, ${variant.label}, minuty`}
                        className={inputClass}
                        inputMode="numeric"
                        value={variant.durationMinutes}
                        onChange={(event) => setMinutes(groupIndex, variantIndex, Number(event.target.value))}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {visible.length === 0 ? <p className="rounded-2xl bg-white p-5 text-sm text-ink ring-1 ring-pink-100">Nie ma takiej usługi.</p> : null}
      </div>
      <SaveBar pending={save.pending} message={save.message} />
    </form>
  );
}
