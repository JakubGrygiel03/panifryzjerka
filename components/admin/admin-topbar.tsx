"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";

export function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-pink-100 bg-blush/85 px-4 backdrop-blur md:px-6">
      <button type="button" onClick={onMenuOpen} className="rounded-full p-2 text-ink hover:bg-white md:hidden" aria-label="Otwórz menu">
        <Menu size={20} />
      </button>
      <p className="hidden text-sm font-medium text-ink sm:block">Panel strony salonu</p>
      <Link
        href="/"
        target="_blank"
        className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:text-berry"
      >
        Zobacz stronę
        <ExternalLink size={12} />
      </Link>
    </header>
  );
}
