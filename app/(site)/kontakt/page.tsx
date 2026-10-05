import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON } from "@/lib/brand";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const metadata: Metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const content = await getSalonContent();
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=18.613%2C54.347%2C18.634%2C54.357&layer=mapnik&marker=${SALON.latitude}%2C${SALON.longitude}`;

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 sm:px-6">
      <div>
        <Breadcrumbs items={[{ href: "/kontakt", label: "Kontakt" }]} />
        <h1 className="font-display text-4xl">Kontakt</h1>
        <p className="mt-4">
          {content.settings.address}
          <br />
          {content.settings.postalCode} {content.settings.city}
        </p>
        <a href={SALON.phoneHref} className="mt-2 block text-berry">
          {content.settings.phone}
        </a>
        <ul className="mt-6 space-y-1 text-sm">
          {content.settings.openingHours.map((row) => (
            <li key={row.day} className="flex justify-between gap-6">
              <span className="text-mauve">{row.day}</span>
              <span>{row.hours}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-6 space-y-1 text-sm text-mauve">
          <li>Bezpłatny parking przy budynku</li>
          <li>Wejście dostępne dla wózka</li>
          <li>Spokojne psy mile widziane — Bella jest psem salonu</li>
          <li>Płatność w salonie po zabiegu</li>
        </ul>
        <a href={content.settings.mapsUrl} className="mt-6 inline-block text-sm font-semibold text-berry">
          Otwórz w Google Maps
        </a>
        <p className="mt-4 text-sm">
          <a href={`mailto:${SALON.email}`} className="text-berry">{SALON.email}</a>
        </p>
      </div>
      <iframe title="Mapa dojazdu na ul. Skarpową 24" src={map} className="min-h-80 w-full rounded-3xl border-0" />
    </section>
  );
}
