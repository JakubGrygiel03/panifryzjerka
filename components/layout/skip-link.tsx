"use client";

import { useLocaleStore } from "@/store/use-locale-store";

export function SkipLink() {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <a href="#tresc" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-3 focus:py-2">
      {locale === "RU" ? "К содержанию" : "Przejdź do treści"}
    </a>
  );
}
