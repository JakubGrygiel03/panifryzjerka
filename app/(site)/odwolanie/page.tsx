import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON } from "@/lib/brand";

export const metadata: Metadata = { title: "Odwołanie wizyty" };

export default function CancelPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/odwolanie", label: "Odwołanie" }]} />
      <h1 className="font-display text-4xl">Odwołanie i spóźnienie</h1>
      <div className="mt-6 space-y-3 text-sm leading-6">
        <p>
          Zadzwoń pod <a className="font-semibold text-berry" href={SALON.phoneHref}>{SALON.phoneDisplay}</a> najpóźniej dzień przed wizytą.
          Zwolniona godzina wraca do kalendarza.
        </p>
        <p>Jeśli spóźnisz się więcej niż 15 minut, zabieg może zostać skrócony, bo kolejny termin jest już policzony z buforem.</p>
        <p>Dzieci do 12. roku życia mają osobną usługę strzyżenia dziecięcego.</p>
      </div>
    </section>
  );
}
