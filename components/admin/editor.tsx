"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export function AdminPageHeader({ title, text }: { title: string; text: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-ink/80">{text}</p>
    </header>
  );
}

export function SaveBar({ pending, message }: { pending: boolean; message: string }) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <button type="submit" disabled={pending} className="rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-deep disabled:opacity-60">
        {pending ? "Zapisuję…" : "Zapisz"}
      </button>
      {message ? <p className="text-sm text-ink">{message}</p> : null}
    </div>
  );
}

export function useSave(action: () => Promise<void | string>) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const note = await action();
      setMessage(note || "Zapisane. Strona pokazuje tę wersję.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zapisać.");
    } finally {
      setPending(false);
    }
  }

  return { pending, message, onSubmit };
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {children}
    </label>
  );
}

export const fieldClass = "mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-berry";
