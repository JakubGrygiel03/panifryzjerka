import Link from "next/link";
import { SALON } from "@/lib/brand";
import type { OpeningHour } from "@/lib/content/types";

const links = [
  ["/#faq", "Pytania"],
  ["/#poradnik", "Przed wizytą"],
  ["/#techniki", "Techniki"],
  ["/odwolanie", "Odwołanie"],
  ["/regulamin", "Regulamin"],
  ["/prywatnosc", "Prywatność"],
] as const;

export function Footer({
  hours,
  phoneDisplay,
  phoneHref,
  rating,
  reviewCount,
}: {
  hours: OpeningHour[];
  phoneDisplay: string;
  phoneHref: string;
  rating: number;
  reviewCount: number;
}) {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl">
            Pani<span className="text-pink-200">Fryzjerka</span>
          </p>
          <p className="mt-4 text-sm leading-6 text-white/65">
            {SALON.street}
            <br />
            {SALON.postalCode} {SALON.city}
          </p>
          <a href={phoneHref} className="mt-3 inline-block text-sm text-pink-100">
            {phoneDisplay}
          </a>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
          {hours.map((row) => (
            <li key={row.day} className="flex justify-between gap-8 border-b border-white/10 pb-2">
              <span>{row.day}</span>
              <span className="text-white">{row.hours}</span>
            </li>
          ))}
        </ul>
        <div className="text-sm text-white/65">
          <p>Parking przy budynku · psy mile widziane · wejście dla wózka</p>
          <p className="mt-3 text-white">Google {rating.toFixed(1)} · {reviewCount}+ opinii</p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-white">
                {label}
              </Link>
            ))}
          </p>
          <p className="mt-6 text-xs text-white/40">© {new Date().getFullYear()} PaniFryzjerka</p>
        </div>
      </div>
    </footer>
  );
}
