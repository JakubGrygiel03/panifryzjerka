import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AFTERCARE } from "@/lib/content/guides";

export const metadata: Metadata = { title: "Po zabiegu" };

export default function AftercarePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/pielegnacja", label: "Po zabiegu" }]} />
      <h1 className="font-display text-4xl">Po zabiegu</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6">
        {AFTERCARE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
