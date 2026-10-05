import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RULES } from "@/lib/content/guides";

export const metadata: Metadata = { title: "Regulamin wizyt" };

export default function RulesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/regulamin", label: "Regulamin" }]} />
      <h1 className="font-display text-4xl">Regulamin wizyt</h1>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-6">
        {RULES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
