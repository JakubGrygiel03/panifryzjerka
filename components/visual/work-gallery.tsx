"use client";

import { useState } from "react";
import Image from "next/image";
import type { SalonPhoto } from "@/lib/content/gallery";
import { ruPhrase } from "@/lib/i18n/phrases";
import { useLocaleStore } from "@/store/use-locale-store";

const PREVIEW = 6;

export function WorkGallery({ photos }: { photos: SalonPhoto[] }) {
  const locale = useLocaleStore((state) => state.locale);
  const [open, setOpen] = useState(false);
  const shown = open ? photos : photos.slice(0, PREVIEW);
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  const hidden = photos.length - PREVIEW;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((photo, index) => (
          <li key={photo.src}>
            <figure className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/10">
              <div className="relative aspect-square overflow-hidden bg-white">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 50vw"
                  quality={68}
                  className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                  priority={index < 2}
                />
              </div>
            </figure>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-berry ring-1 ring-pink-200 hover:bg-blush"
          >
            {open ? say("Zwiń galerię") : say("Pokaż więcej")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
