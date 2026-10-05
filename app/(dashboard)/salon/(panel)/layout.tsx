import Link from "next/link";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-blush">
      <header className="border-b border-pink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <p className="font-display text-xl">
            Pani<span className="text-berry">Fryzjerka</span>
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="/salon/kalendarz">Dzień</Link>
            <Link href="/salon/klienci">Klientki</Link>
            <Link href="/">Strona</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
