import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SALON } from "@/lib/brand";
import { ruPhrase } from "@/lib/i18n/phrases";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = { title: "Odwołanie wizyty" };

export default async function CancelPage() {
  const locale = await getRequestLocale();
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/odwolanie", label: say("Odwołanie") }]} />
      <h1 className="font-display text-4xl">{say("Odwołanie i spóźnienie")}</h1>
      <div className="mt-6 space-y-3 text-base leading-7 text-ink">
        <p>{say("Odwołanie zrób telefonicznie najpóźniej poprzedniego dnia.")}</p>
        <p>
          {locale === "RU" ? "Позвоните по номеру" : "Zadzwoń pod"} <a className="font-semibold text-berry" href={SALON.phoneHref}>{SALON.phoneDisplay}</a>.
        </p>
        <p>{say("Jeśli spóźnisz się więcej niż 15 minut, zabieg może zostać skrócony albo przełożony.")}</p>
      </div>
    </section>
  );
}
