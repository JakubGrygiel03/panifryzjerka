import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/account/session";
import { ruPhrase } from "@/lib/i18n/phrases";
import { getRequestLocale } from "@/lib/request-locale";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  dane: "Wpisz e-mail i hasło.",
  haslo: "E-mail albo hasło się nie zgadza.",
  istnieje: "Konto z tym e-mailem już jest. Zaloguj się.",
  limit: "Za dużo prób logowania. Spróbuj za kilkanaście minut.",
  odswiez: "Odśwież stronę i zaloguj się jeszcze raz.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ blad?: string; email?: string; gotowe?: string }> }) {
  const store = await cookies();
  if (isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) redirect("/admin");
  if (await getCustomer()) redirect("/konto");
  const query = await searchParams;
  const locale = await getRequestLocale();
  const say = (text: string) => (locale === "RU" ? ruPhrase(text) : text);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <form action="/api/account/login" method="post" className="w-full rounded-[1.75rem] bg-white p-8 ring-1 ring-pink-100">
        <p className="font-display text-3xl text-ink">
          Pani<span className="text-berry">Fryzjerka</span>
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">{say("Zaloguj się")}</h1>
        <p className="mt-3 text-base leading-7 text-ink/80">{say("Zaloguj się, żeby zobaczyć swoje wizyty.")}</p>
        <label className="mt-6 block text-sm font-medium">
          {say("E-mail")}
          <input name="email" type="email" required defaultValue={query.email ?? ""} autoComplete="email" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          {say("Hasło")}
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        {query.gotowe ? <p className="mt-3 text-sm font-medium text-ink">{say("Hasło zmienione. Zaloguj się nowym.")}</p> : null}
        {query.blad && ERRORS[query.blad] ? <p className="mt-3 text-sm font-medium text-berry">{say(ERRORS[query.blad])}</p> : null}
        <button type="submit" className="mt-6 w-full rounded-full bg-berry py-3 text-sm font-semibold text-white hover:bg-berry-deep">
          {say("Zaloguj się")}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/konto/haslo" className="font-semibold text-berry">
            {say("Nie pamiętam hasła")}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink">
          {say("Nie masz konta?")}{" "}
          <Link href="/konto/rejestracja" className="font-semibold text-berry">
            {say("Zarejestruj się")}
          </Link>
        </p>
      </form>
    </main>
  );
}
