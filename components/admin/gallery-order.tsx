"use client";

import { useState } from "react";
import { saveGalleryOrder } from "@/actions/cms-admin";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";

type Photo = { src: string; alt: string };

export function GalleryOrder({ photos }: { photos: Photo[] }) {
  const copy = adminCopy(useWritingLocale());
  const [order, setOrder] = useState(photos);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    setOrder(next);
  }

  async function save() {
    setPending(true);
    setMessage("");
    try {
      setMessage((await saveGalleryOrder(order.map((photo) => photo.src))) || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zapisać kolejności.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mb-8 max-w-3xl rounded-[1.5rem] bg-white p-5 ring-1 ring-pink-100">
      <h2 className="font-display text-3xl text-ink">{copy.galleryTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-mauve">{copy.galleryText}</p>
      <ol className="mt-4 space-y-2">
        {order.map((photo, index) => (
          <li key={photo.src} className="flex items-center gap-3 rounded-2xl bg-blush px-3 py-2">
            <img src={photo.src} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{index + 1}. {photo.alt}</span>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-full px-3 py-1 text-sm font-semibold text-berry disabled:opacity-30">
              ↑
            </button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} className="rounded-full px-3 py-1 text-sm font-semibold text-berry disabled:opacity-30">
              ↓
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={save} disabled={pending} className="mt-4 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? copy.saving : copy.save}
      </button>
      {message ? <p className="mt-3 text-sm text-ink">{message}</p> : null}
    </section>
  );
}
