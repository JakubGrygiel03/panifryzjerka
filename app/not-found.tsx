import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center px-4">
      <p className="text-sm text-berry">404</p>
      <h1 className="font-display text-4xl">Tej strony nie ma w salonie</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white">
          Wróć na stronę główną
        </Link>
        <Link href="/cennik" className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-pink-100">
          Cennik
        </Link>
        <Link href="/kontakt" className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-pink-100">
          Kontakt
        </Link>
      </div>
    </main>
  );
}
