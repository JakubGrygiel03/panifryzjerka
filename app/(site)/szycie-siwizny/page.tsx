import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SZYCIE } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "#szycieSiwizny",
  description: "Szycie siwizny u Pani Iryny w Gdańsku. Kolor ma wyglądać jak własny, a czas zależy od długości włosów.",
};

export default function GreyBlendingPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/szycie-siwizny", label: "#szycieSiwizny" }]} />
      <h1 className="font-display text-4xl">#szycieSiwizny</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6">
        {SZYCIE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
