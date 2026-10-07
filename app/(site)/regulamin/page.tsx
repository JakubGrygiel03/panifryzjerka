import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RULES } from "@/lib/content/guides";
import { ruPhrase } from "@/lib/i18n/phrases";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = { title: "Regulamin wizyt" };

export default async function RulesPage() {
  const locale = await getRequestLocale();
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/regulamin", label: say("Regulamin") }]} />
      <h1 className="font-display text-4xl">{say("Regulamin wizyt")}</h1>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-6">
        {RULES.map((item) => (
          <li key={item}>{say(item)}</li>
        ))}
      </ol>
    </section>
  );
}
