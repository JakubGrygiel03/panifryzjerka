import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Prywatność" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/prywatnosc", label: "Prywatność" }]} />
      <h1 className="font-display text-4xl">Prywatność</h1>
      <div className="mt-6 space-y-3 text-sm leading-6">
        <p>Imię, telefon i opcjonalny e-mail podajesz tylko po to, żeby salon potwierdził wizytę i mógł się z Tobą skontaktować.</p>
        <p>Publiczna strona nie pokazuje listy wizyt ani numerów telefonów. Panel salonu jest osobną częścią strony.</p>
        <p>Na tym urządzeniu imię i telefon zostają w przeglądarce, żeby kolejny zapis był szybszy. Możesz je skasować, czyszcząc dane strony.</p>
        <p>Strona nie wstawia reklamowych skryptów śledzących.</p>
      </div>
    </section>
  );
}
