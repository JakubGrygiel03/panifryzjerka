"use client";

import { useState, type FormEvent } from "react";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function WaitlistForm({ date, serviceName }: { date: string; serviceName: string }) {
  const copy = t(useLocaleStore((state) => state.locale));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, serviceName, date }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || copy.waitError);
      }
      setDone(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.waitError);
    } finally {
      setPending(false);
    }
  }

  if (done) return <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-pink-100">{copy.waitDone}</p>;

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-pink-100">
      <p className="font-display text-lg text-ink">{copy.waitTitle}</p>
      <p className="mt-1 text-sm leading-5 text-mauve">{copy.waitText}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={copy.name}
          className="rounded-full border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-berry"
        />
        <input
          required
          minLength={9}
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={copy.phone}
          className="rounded-full border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-berry"
        />
      </div>
      <button type="submit" disabled={pending} className="mt-3 rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white hover:bg-berry-deep disabled:opacity-60">
        {pending ? copy.waitSending : copy.waitSend}
      </button>
      {error ? <p className="mt-2 text-sm text-berry">{error}</p> : null}
    </form>
  );
}
