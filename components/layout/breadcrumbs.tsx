"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const copy = t(useLocaleStore((state) => state.locale));
  return (
    <nav aria-label={copy.home} className="mb-4 text-sm text-mauve">
      <ol className="flex flex-wrap gap-2">
        <li>
          <Link href="/" className="hover:text-berry">
            {copy.home}
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href}>
            /{" "}
            <Link href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
