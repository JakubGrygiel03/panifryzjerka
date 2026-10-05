import Link from "next/link";
import { FaqList } from "@/components/home/faq-list";
import { SALON } from "@/lib/brand";
import { AFTERCARE, FAQ, PREP, SZYCIE } from "@/lib/content/guides";

export function SalonStory() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 sm:px-6">
      <section>
        <p className="eyebrow">Rezerwacja</p>
        <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Jak wygląda zapis</h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-[1.75rem] bg-ink/8 md:grid-cols-3">
          {[
            ["01", "Usługa", "Wybierasz zabieg i długość włosów. Od tego zależy cena i czas."],
            ["02", "Godzina", "Widzisz wolne terminy Pani Iryny, już z 15-minutowym buforem."],
            ["03", "Telefon", "Podajesz imię i numer. Bez konta i bez prowizji."],
          ].map(([n, title, text]) => (
            <li key={n} className="bg-white p-7">
              <p className="text-base font-semibold text-ink">{n}</p>
              <h3 className="mt-3 font-display text-2xl text-ink">{title}</h3>
              <p className="mt-2 text-base leading-7 text-ink">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[1.75rem] bg-white p-8 ring-1 ring-ink/10 sm:p-10">
        <p className="eyebrow">Technika</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-ink">#szycieSiwizny</h2>
        <ul className="mt-6 max-w-3xl space-y-4">
          {SZYCIE.map((item) => (
            <li key={item} className="border-b border-ink/10 pb-4 text-base leading-7 font-medium text-ink last:border-0 last:pb-0">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-[1.75rem] bg-white p-8 ring-1 ring-ink/10">
          <h2 className="font-display text-3xl text-ink">Przed wizytą</h2>
          <ul className="mt-5 space-y-3 text-base leading-7 font-medium text-ink">
            {PREP.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href="/przygotowanie" className="mt-5 inline-block text-base font-semibold text-berry">
            Więcej o przygotowaniu
          </Link>
        </article>
        <article className="rounded-[1.75rem] bg-white p-8 ring-1 ring-ink/10">
          <h2 className="font-display text-3xl text-ink">Po zabiegu</h2>
          <ul className="mt-5 space-y-3 text-base leading-7 font-medium text-ink">
            {AFTERCARE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href="/pielegnacja" className="mt-5 inline-block text-base font-semibold text-berry">
            Pielęgnacja w domu
          </Link>
        </article>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl tracking-tight">Pytania</h2>
          <Link href="/faq" className="text-base font-semibold text-berry">
            Wszystkie odpowiedzi
          </Link>
        </div>
        <FaqList items={FAQ.slice(0, 4)} />
      </section>

      <section className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-ink px-8 py-10 text-white sm:flex-row sm:items-end">
        <div>
          <p className="text-base font-semibold text-white">Dojazd</p>
          <h2 className="mt-3 font-display text-4xl">
            {SALON.street}
            <br />
            {SALON.postalCode} {SALON.city}
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-white">Bezpłatny parking jest przy budynku. Wjazd dla wózka jest na miejscu.</p>
        </div>
        <a href={SALON.mapsUrl} className="text-sm font-semibold text-pink-100 underline decoration-white/30 underline-offset-4">
          Otwórz Google Maps
        </a>
      </section>
    </div>
  );
}
