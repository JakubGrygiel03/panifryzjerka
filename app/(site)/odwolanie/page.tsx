import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON } from "@/lib/brand";

export const metadata: Metadata = { title: "Odwołanie wizyty" };

export default function CancelPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/odwolanie", label: "Odwołanie" }]} />
      <h1 className="font-display text-4xl">Odwołanie i spóźnienie</h1>
      <div className="mt-6 space-y-3 text-base leading-7 text-ink">
        <p>Odwołanie zrób telefonicznie najpóźniej poprzedniego dnia.</p>
        <p>
          Zadzwoń pod <a className="font-semibold text-berry" href={SALON.phoneHref}>{SALON.phoneDisplay}</a>.
        </p>
        <p>Jeśli spóźnisz się więcej niż 15 minut, zabieg może zostać skrócony albo przełożony.</p>
      </div>
    </section>
  );
}
