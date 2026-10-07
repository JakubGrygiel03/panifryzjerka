import Link from "next/link";
import { peekReset } from "@/lib/account/resets";
import { ruPhrase } from "@/lib/i18n/phrases";
import { getRequestLocale } from "@/lib/request-locale";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  dane: "Wpisz adres e-mail.",
  krotkie: "Hasło musi mieć co najmniej 8 znaków.",
  wygasl: "Link wygasł. Poproś o nowy.",
  limit: "Za dużo prób. Spróbuj później.",
  odswiez: "Odśwież stronę i spróbuj jeszcze raz.",
};

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; blad?: string; wyslane?: string }> }) {
  const query = await searchParams;
  const locale = await getRequestLocale();
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);
  const reset = query.token ? await peekReset(query.token) : null;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <form action="/api/account/haslo" method="post" className="w-full rounded-[1.75rem] bg-white p-8 ring-1 ring-pink-100">
        <p className="font-display text-3xl text-ink">
          Pani<span className="text-berry">Fryzjerka</span>
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">{say(reset ? "Nowe hasło" : "Nie pamiętam hasła")}</h1>
        {query.wyslane ? (
          <p className="mt-4 text-base leading-7 text-ink">{say("Jeśli konto istnieje, link do nowego hasła jest w skrzynce. Sprawdź też spam.")}</p>
        ) : reset ? (
          <>
            <p className="mt-3 text-base leading-7 text-ink/80">{say("Wpisz nowe hasło. Link działa tylko raz.")}</p>
            <input type="hidden" name="token" value={query.token} />
            <label className="mt-6 block text-sm font-medium">
              {say("Nowe hasło")}
              <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
            </label>
            {query.blad && ERRORS[query.blad] ? <p className="mt-3 text-sm font-medium text-berry">{say(ERRORS[query.blad])}</p> : null}
            <button type="submit" className="mt-6 w-full rounded-full bg-berry py-3 text-sm font-semibold text-white hover:bg-berry-deep">
              {say("Zapisz hasło")}
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-base leading-7 text-ink/80">{say("Podaj e-mail konta albo salonu. Wyślemy link do nowego hasła.")}</p>
            <label className="mt-6 block text-sm font-medium">
              {say("E-mail")}
              <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
            </label>
            {query.blad && ERRORS[query.blad] ? <p className="mt-3 text-sm font-medium text-berry">{say(ERRORS[query.blad])}</p> : null}
            <button type="submit" className="mt-6 w-full rounded-full bg-berry py-3 text-sm font-semibold text-white hover:bg-berry-deep">
              {say("Wyślij link")}
            </button>
          </>
        )}
        <p className="mt-4 text-center text-sm text-ink">
          <Link href="/konto/logowanie" className="font-semibold text-berry">
            {say("Wróć do logowania")}
          </Link>
        </p>
      </form>
    </main>
  );
}
