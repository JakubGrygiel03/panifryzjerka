"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/editor";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import { UPLOAD_MAX_BYTES, type MediaRef } from "@/lib/media/paths";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadSalonImage(file: File) {
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error("Zdjęcie może mieć najwyżej 8 MB.");
  }
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/admin/media", { method: "POST", body });
  const payload = (await response.json()) as { src?: string; bytes?: number; kind?: MediaRef["kind"]; reused?: boolean; error?: string };
  if (!response.ok || !payload.src || payload.bytes == null || !payload.kind) {
    throw new Error(payload.error || "Nie udało się wgrać zdjęcia.");
  }
  return { src: payload.src, bytes: payload.bytes, kind: payload.kind, reused: Boolean(payload.reused) };
}

export function PhotoGrid({
  options,
  selected,
  onSelect,
  allowEmpty = false,
  disabled = [],
}: {
  options: MediaRef[];
  selected?: string;
  onSelect: (src: string) => void;
  allowEmpty?: boolean;
  disabled?: string[];
}) {
  return (
    <div className="mt-3 max-h-72 overflow-auto rounded-2xl bg-blush p-2">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {allowEmpty ? (
          <li>
            <button
              type="button"
              onClick={() => onSelect("")}
              aria-pressed={selected === ""}
              className={`flex aspect-square w-full items-center justify-center rounded-xl bg-white px-2 text-center text-xs font-semibold text-ink ring-2 ${selected === "" ? "ring-berry" : "ring-transparent"}`}
            >
              Bez zdjęcia
            </button>
          </li>
        ) : null}
        {options.map((item) => {
          const name = item.src.split("/").pop() ?? "Zdjęcie";
          const active = item.src === selected;
          const taken = disabled.includes(item.src);
          return (
            <li key={item.src}>
              <button
                type="button"
                aria-label={name}
                aria-pressed={active}
                disabled={taken}
                onClick={() => onSelect(item.src)}
                className={`relative aspect-square w-full overflow-hidden rounded-xl bg-white ring-2 ${active ? "ring-berry" : "ring-transparent"} disabled:opacity-40`}
              >
                <Image src={item.src} alt="" fill sizes="120px" quality={50} className="object-cover" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ImageField({
  value,
  options,
  onChange,
  onUploaded,
  allowEmpty = true,
  label = "Zdjęcie",
}: {
  value: string;
  options: MediaRef[];
  onChange: (src: string) => void;
  onUploaded: (item: MediaRef) => void;
  allowEmpty?: boolean;
  label?: string;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const known = !value || options.some((item) => item.src === value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setMessage("");
    try {
      const saved = await uploadSalonImage(file);
      onUploaded({ src: saved.src, bytes: saved.bytes, kind: saved.kind });
      onChange(saved.src);
      setMessage(saved.reused ? "To zdjęcie już jest w bibliotece. Sekcja użyje istniejącego pliku." : "Zapisane raz, w mniejszym rozmiarze.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      {value ? (
        <div className="relative mt-2 aspect-[4/3] max-w-sm overflow-hidden rounded-2xl bg-blush ring-1 ring-pink-100">
          <Image src={value} alt={label} fill sizes="320px" quality={60} className="object-cover" />
        </div>
      ) : (
        <p className="mt-2 rounded-2xl bg-blush px-4 py-3 text-sm text-ink">Bez osobnego zdjęcia.</p>
      )}
      <PhotoGrid
        options={value && !known ? [{ src: value, bytes: 0, kind: "catalog" }, ...options] : options}
        selected={value}
        allowEmpty={allowEmpty}
        onSelect={onChange}
      />
      <p className="mt-2 text-sm leading-6 text-ink/70">Sekcja zapisuje tylko adres. Ten sam plik można wskazać w wielu miejscach i nadal zajmuje miejsce raz.</p>
      <div
        className="mt-3 rounded-2xl border border-dashed border-pink-200 bg-blush/60 px-4 py-5 text-center text-sm text-ink"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void onFile(event.dataTransfer.files?.[0]);
        }}
      >
        Upuść zdjęcie tutaj albo wgraj plik. Zostanie zmniejszone i zapisane raz.
      </div>
      <label className="mt-3 inline-flex cursor-pointer rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white">
        {pending ? "Zmniejszam…" : "Wgraj nowe"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onFile(file);
          }}
        />
      </label>
      {message ? <p className="mt-2 text-sm text-ink">{message}</p> : null}
    </div>
  );
}

export function MediaLibrary({ initial }: { initial: MediaRef[] }) {
  const copy = adminCopy(useWritingLocale());
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const uploads = items.filter((item) => item.kind === "upload");
  const uploadBytes = uploads.reduce((sum, item) => sum + item.bytes, 0);
  const total = items.reduce((sum, item) => sum + item.bytes, 0);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setMessage("");
    try {
      const saved = await uploadSalonImage(file);
      setItems((current) => (current.some((item) => item.src === saved.src) ? current : [...current, { src: saved.src, bytes: saved.bytes, kind: saved.kind }]));
      setMessage(saved.reused ? "To zdjęcie już było w bibliotece. Nie zapisałam drugiej kopii." : `Zapisane jako ${formatBytes(saved.bytes)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
    } finally {
      setPending(false);
    }
  }

  async function remove(src: string) {
    if (!window.confirm("Usunąć to wgrane zdjęcie z biblioteki?")) return;
    setMessage("");
    const response = await fetch(`/api/admin/media?src=${encodeURIComponent(src)}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error || "Nie udało się usunąć zdjęcia.");
      return;
    }
    setItems((current) => current.filter((item) => item.src !== src));
    setMessage("Plik usunięty.");
  }

  return (
    <div>
      <AdminPageHeader
        title={copy.photosTitle}
        text={copy.photosText}
      />
      <p className="text-sm text-ink/75">
        {items.length} plików · {formatBytes(total)} na dysku · wgrane {uploads.length} ({formatBytes(uploadBytes)} z 25 MB)
      </p>
      <div
        className="mt-4 rounded-2xl border border-dashed border-pink-200 bg-white px-4 py-8 text-center text-sm text-ink"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void onFile(event.dataTransfer.files?.[0]);
        }}
      >
        Upuść zdjęcie tutaj. Plik zostanie zmniejszony do 1600 px i zapisany jako WebP, bez drugiej kopii.
      </div>
      <label className="mt-4 inline-flex cursor-pointer rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white">
        {pending ? "Zmniejszam…" : "Wgraj zdjęcie"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onFile(file);
          }}
        />
      </label>
      {message ? <p className="mt-3 text-sm text-ink">{message}</p> : null}
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.src} className="rounded-2xl bg-white p-2 ring-1 ring-pink-100">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-blush">
              <Image src={item.src} alt={item.src.split("/").pop() ?? "Zdjęcie salonu"} fill sizes="160px" quality={60} className="object-cover" />
            </div>
            <p className="mt-2 truncate text-sm font-medium text-ink">{item.src.split("/").pop()}</p>
            <p className="text-sm text-mauve">
              {formatBytes(item.bytes)} · {item.kind === "upload" ? "wgrane" : "katalog"}
            </p>
            {item.kind === "upload" ? (
              <button type="button" className="mt-2 text-sm font-semibold text-berry" onClick={() => void remove(item.src)}>
                Usuń
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
