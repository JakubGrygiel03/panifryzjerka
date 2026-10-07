import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON } from "@/lib/brand";
import { phoneHref } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const metadata: Metadata = { title: "Kontakt" };

const notes = [
  "Bezpłatny parking przy budynku",
  "Wejście dostępne dla wózka",
  "Spokojne psy mile widziane — Bella jest psem salonu",
  "Płatność w salonie po zabiegu",
];

export default async function ContactPage() {
  const content = await getSalonContent();
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=18.613%2C54.347%2C18.634%2C54.357&layer=mapnik&marker=${SALON.latitude}%2C${SALON.longitude}`;
  const tel = phoneHref(content.settings.phone);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/kontakt", label: "Kontakt" }]} />
      <p className="eyebrow">Salon</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-ink">Kontakt</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-ink/80">
        Zadzwoń, napisz albo umów wizytę online. Salon jest na ul. Skarpowej, z parkingiem przy budynku.
      </p>

      <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="rounded-[1.75rem] bg-white p-7 ring-1 ring-pink-100 sm:p-8">
          <p className="flex items-start gap-3 text-base leading-7 text-ink">
            <MapPin size={18} className="mt-1 shrink-0 text-berry" aria-hidden />
            <span>
              {content.settings.address}
              <br />
              {content.settings.postalCode} {content.settings.city}
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a href={tel} className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white hover:bg-berry-deep">
              <Phone size={16} aria-hidden />
              Zadzwoń: {content.settings.phone}
            </a>
            <a href={`mailto:${SALON.email}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-blush px-5 py-3 text-sm font-semibold text-ink">
              <Mail size={16} className="text-berry" aria-hidden />
              {SALON.email}
            </a>
          </div>

          <h2 className="mt-8 flex items-center gap-2 font-display text-2xl text-ink">
            <Clock size={18} className="text-berry" aria-hidden />
            Godziny
          </h2>
          <dl className="mt-4">
            {content.settings.openingHours.map((row) => (
              <div key={row.day} className="flex items-baseline justify-between gap-6 border-b border-pink-100 py-2.5 text-sm last:border-0">
                <dt className="text-ink">{row.day}</dt>
                <dd className="font-medium text-ink">{row.hours}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 space-y-2 text-sm leading-6 text-ink/80">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          <a href={content.settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white">
            <MapPin size={18} aria-hidden />
            Otwórz Google Maps
          </a>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_50px_-36px_rgba(31,26,36,0.45)] ring-1 ring-pink-100">
          <iframe title="Mapa dojazdu na ul. Skarpową 24" src={map} className="h-full min-h-[28rem] w-full border-0" />
        </div>
      </div>
    </section>
  );
}
