"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { SALON } from "@/lib/brand";
import { adminCopy } from "@/lib/i18n/admin";
import { useCmsLocaleStore } from "@/store/use-cms-locale-store";

export function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const locale = useWritingLocale();
  const copy = adminCopy(locale);
  const setLocale = useCmsLocaleStore((state) => state.setLocale);

  return (
    <header className="sticky top-0 z-30 border-b border-pink-100 bg-blush/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-3 md:px-6">
        <button type="button" onClick={onMenuOpen} className="shrink-0 rounded-full p-2 text-ink hover:bg-white md:hidden" aria-label={copy.openMenu}>
          <Menu size={20} />
        </button>
        <p className="hidden min-w-0 flex-1 truncate text-sm text-ink md:block">
          {locale === "RU" ? copy.writingRu : copy.writingPl}
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-2">
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
            href={SALON.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:text-berry"
          >
            {copy.seeSite}
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </header>
  );
}
