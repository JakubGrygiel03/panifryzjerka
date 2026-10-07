"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";
import { useCmsLocaleStore } from "@/store/use-cms-locale-store";

export function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const setLocale = useCmsLocaleStore((state) => state.setLocale);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-pink-100 bg-blush/85 px-4 backdrop-blur md:px-6">
      <button type="button" onClick={onMenuOpen} className="rounded-full p-2 text-ink hover:bg-white md:hidden" aria-label={copy.openMenu}>
        <Menu size={20} />
      </button>
      <p className="min-w-0 truncate text-sm text-ink">
        {locale === "RU" ? copy.writingRu : copy.writingPl}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex overflow-hidden rounded-full bg-white ring-1 ring-ink/10">
          {(["PL", "RU"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`px-3 py-1.5 text-sm font-semibold ${locale === code ? "bg-berry text-white" : "text-ink"}`}
              aria-pressed={locale === code}
            >
              {code}
            </button>
          ))}
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:text-berry"
        >
          {copy.seeSite}
          <ExternalLink size={12} />
        </Link>
      </div>
    </header>
  );
}
