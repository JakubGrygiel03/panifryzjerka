import Image from "next/image";
import type { SalonPhoto } from "@/lib/content/gallery";

export function WorkGallery({ photos }: { photos: SalonPhoto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <li key={photo.src}>
          <figure>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 18vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                priority={index < 2}
              />
            </div>
            <figcaption className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
              <span className="text-base font-semibold text-ink">{photo.title}</span>
              <span className="shrink-0 text-sm font-medium text-ink">{photo.tag}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
