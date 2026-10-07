import Image from "next/image";
import type { SalonPhoto } from "@/lib/content/gallery";

export function WorkGallery({ photos }: { photos: SalonPhoto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <li key={photo.src}>
          <figure className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/10">
            <div className="relative aspect-square overflow-hidden bg-white">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 18vw, 50vw"
                quality={68}
                className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                priority={index < 2}
              />
            </div>
          </figure>
        </li>
      ))}
    </ul>
  );
}
