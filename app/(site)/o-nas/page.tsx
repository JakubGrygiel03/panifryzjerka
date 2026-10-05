import type { Metadata } from "next";
import { Team } from "@/components/home/team";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON_DOG } from "@/lib/brand";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const metadata: Metadata = { title: "O nas" };

export default async function AboutPage() {
  const content = await getSalonContent();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/o-nas", label: "O nas" }]} />
      <h1 className="font-display text-4xl">Rodzinny salon na Skarpowej</h1>
      <p className="mt-4 max-w-2xl text-mauve">
        PaniFryzjerka to kameralny salon w Gdańsku. Wszystkie zabiegi wykonuje Pani Iryna: koloryzacja, szycie siwizny,
        strzyżenie, afroloki, paznokcie i rzęsy. Przy budynku jest bezpłatny parking i wejście dostępne dla osób niepełnosprawnych.
      </p>
      <p className="mt-4 max-w-2xl text-mauve">{SALON_DOG.bio}</p>
      <div className="mt-8">
        <Team members={content.team} />
      </div>
    </section>
  );
}
