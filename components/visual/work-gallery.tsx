"use client";

import { useRef } from "react";
import Image from "next/image";
import type { SalonPhoto } from "@/lib/content/gallery";
import { ruPhrase } from "@/lib/i18n/phrases";
import { useLocaleStore } from "@/store/use-locale-store";

const PREVIEW = 6;

export function WorkGallery({ photos }: { photos: SalonPhoto[] }) {
  const locale = useLocaleStore((state) => state.locale);
  const moreRef = useRef<HTMLLIElement>(null);
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  const preview = photos.slice(0, PREVIEW);
  const rest = photos.slice(PREVIEW);

  return (
    <details
      className="group [overflow-anchor:none]"
      onToggle={(event) => {
        if (!event.currentTarget.open) return;
        moreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {preview.map((photo, index) => (
          <li key={photo.src}>
            <GalleryFigure photo={photo} priority={index < 2} />
          </li>
        ))}
        {rest.map((photo, index) => (
          <li key={photo.src} ref={index === 0 ? moreRef : undefined} className="hidden group-open:block">
            <GalleryFigure photo={photo} />
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <summary className="mx-auto mt-6 flex w-fit cursor-pointer list-none items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-berry ring-1 ring-pink-200 hover:bg-blush [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">{say("Pokaż więcej")}</span>
          <span className="hidden group-open:inline">{say("Zwiń galerię")}</span>
        </summary>
      ) : null}
    </details>
  );
}

function GalleryFigure({ photo, priority = false }: { photo: SalonPhoto; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/10">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 640px) 30vw, 50vw"
          quality={68}
          className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
          priority={priority}
        />
      </div>
    </figure>
  );
}
