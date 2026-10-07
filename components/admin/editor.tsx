"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";

export function AdminPageHeader({ title, text }: { title: string; text: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-ink/80">{text}</p>
    </header>
  );
}

export function SaveBar({ pending, message }: { pending: boolean; message: string }) {
  const copy = adminCopy(useWritingLocale());
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-4 border-t border-pink-100 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-24px_rgba(31,26,36,0.8)] backdrop-blur md:left-[260px] md:px-8">
        <button type="submit" disabled={pending} className="rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-deep disabled:opacity-60">
          {pending ? copy.saving : copy.save}
        </button>
        {message ? <p className="text-sm text-ink">{message}</p> : null}
      </div>
      <div className="h-16" aria-hidden />
    </>
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
