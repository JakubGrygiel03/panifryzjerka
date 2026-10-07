import Link from "next/link";
import { getSalonContent } from "@/lib/content/get-salon-content";
import { getFaqItems } from "@/lib/cms/store";

const cards = [
  { href: "/admin/kalendarz", title: "Terminarz", text: "Kto jest umówiony, o której godzinie i na jaką usługę." },
  { href: "/admin/pokaz", title: "Pokaz", text: "Zdjęcia w wejściu strony i pary przed/po z opisem." },
  { href: "/admin/uklad", title: "Układ strony", text: "Kolejność sekcji, ukrywanie i własne bloki tekstu." },
  { href: "/admin/ustawienia", title: "Ustawienia", text: "Urlop, telefon, godziny i ocena Google." },
  { href: "/admin/cennik", title: "Cennik", text: "Ceny i czas zabiegów, od których liczą się wolne terminy." },
  { href: "/admin/opinie", title: "Opinie", text: "Cytaty gości na stronie głównej." },
  { href: "/admin/pytania", title: "Pytania", text: "Odpowiedzi w FAQ i na dole strony." },
];

export default async function AdminHomePage() {
  const content = await getSalonContent();
  const faq = getFaqItems();

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Pulpit</h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-ink/80">
        Tu zmieniasz to, co widać na stronie. Zapis od razu wchodzi na stronę na tym komputerze.
      </p>
      <p className="mt-4 text-sm text-ink/70">
        {content.services.length} usług · {content.reviews.length} opinii · {faq.length} pytań
        {content.settings.noticeEnabled ? " · pasek ogłoszenia włączony" : ""}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-pink-100 transition-colors hover:ring-berry/40">
            <h2 className="font-display text-2xl">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/75">{card.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
