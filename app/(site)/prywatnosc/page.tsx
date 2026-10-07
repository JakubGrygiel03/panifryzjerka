import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ruPhrase } from "@/lib/i18n/phrases";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = { title: "Prywatność" };

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/prywatnosc", label: say("Prywatność") }]} />
      <h1 className="font-display text-4xl">{say("Prywatność")}</h1>
      <div className="mt-6 space-y-3 text-sm leading-6">
        <p>{say("Imię, telefon i e-mail podajesz po to, żeby salon potwierdził wizytę i mógł się z Tobą skontaktować. Adres nie trafia na listę mailingową.")}</p>
        <p>{say("Publiczna strona nie pokazuje listy wizyt ani numerów telefonów. Panel salonu jest osobną częścią strony.")}</p>
        <p>{say("Na tym urządzeniu imię i telefon zostają w przeglądarce, żeby kolejny zapis był szybszy. Możesz je skasować, czyszcząc dane strony.")}</p>
        <p>{say("Strona nie wstawia reklamowych skryptów śledzących.")}</p>
      </div>
    </section>
  );
}
