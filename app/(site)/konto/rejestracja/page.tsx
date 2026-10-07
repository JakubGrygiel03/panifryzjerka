import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/account/session";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  dane: "Uzupełnij imię, telefon, e-mail i hasło z co najmniej 8 znakami.",
  admin: "Ten e-mail jest zarezerwowany dla salonu.",
  limit: "Za dużo rejestracji z tego połączenia. Spróbuj później.",
  pelne: "Lista kont jest pełna. Zadzwoń do salonu, a dopiszemy wizytę.",
  odswiez: "Odśwież stronę i załóż konto jeszcze raz.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ blad?: string }> }) {
  if (await getCustomer()) redirect("/konto");
  const query = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <form action="/api/account/register" method="post" className="w-full rounded-[1.75rem] bg-white p-8 ring-1 ring-pink-100">
        <h1 className="font-display text-4xl text-ink">Załóż konto</h1>
        <p className="mt-3 text-base leading-7 text-ink/80">Na koncie zobaczysz swoje wizyty. Zapis na zabieg nie wymaga konta.</p>
        <label className="mt-6 block text-sm font-medium">
          Imię
          <input name="name" required autoComplete="name" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Telefon
          <input name="phone" required autoComplete="tel" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          E-mail
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Hasło
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 outline-none focus:border-berry" />
        </label>
        {query.blad && ERRORS[query.blad] ? <p className="mt-3 text-sm font-medium text-berry">{ERRORS[query.blad]}</p> : null}
        <button type="submit" className="mt-6 w-full rounded-full bg-berry py-3 text-sm font-semibold text-white hover:bg-berry-deep">
          Utwórz konto
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/konto/logowanie" className="font-semibold text-berry">
            Mam już konto
          </Link>
        </p>
      </form>
    </main>
  );
}
