"use client";

import { closeWait, reopenWait } from "@/actions/desk";
import { AdminPageHeader } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import type { WaitEntry } from "@/lib/salon/desk";
import { useState } from "react";

export function WaitlistView({ rows }: { rows: WaitEntry[] }) {
  const copy = adminCopy(useWritingLocale());
  const open = rows.filter((row) => !row.done);
  const done = rows.filter((row) => row.done);

  return (
    <div>
      <AdminPageHeader title={copy.waitTitle} text={copy.waitText} />
      {open.length === 0 ? <p className="text-sm text-mauve">{copy.waitEmpty}</p> : null}
      <ul className="grid gap-3">
        {open.map((row) => (
          <WaitRow key={row.id} row={row} />
        ))}
      </ul>
      {done.length > 0 ? (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-semibold text-mauve">{copy.waitDoneList}</summary>
          <ul className="mt-3 grid gap-3">
            {done.map((row) => (
              <WaitRow key={row.id} row={row} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function WaitRow({ row }: { row: WaitEntry }) {
  const copy = adminCopy(useWritingLocale());
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      if (row.done) await reopenWait(row.id);
      else await closeWait(row.id);
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-pink-100">
      <div>
        <p className="font-semibold text-ink">
          {row.name} <span className="font-normal text-mauve">{row.phone}</span>
        </p>
        <p className="text-sm text-ink/75">
          {row.date} · {row.serviceName}
        </p>
      </div>
      <button type="button" disabled={pending} onClick={toggle} className="rounded-full bg-blush px-4 py-1.5 text-sm font-semibold text-berry disabled:opacity-60">
        {row.done ? copy.waitBack : copy.waitCalled}
      </button>
    </li>
  );
}
