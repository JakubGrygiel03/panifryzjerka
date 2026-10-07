"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Menu, Phone, X } from "lucide-react";
import { SALON } from "@/lib/brand";
import { NoticeBar } from "@/components/home/notice-bar";
import { t } from "@/lib/i18n";
import { useBookingStore } from "@/store/use-booking-store";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function SiteHeader({
  noticeEnabled,
  noticeText,
  phoneDisplay,
  phoneHref,
  accountHref,
  accountLabel,
}: {
  noticeEnabled: boolean;
  noticeText: string;
  phoneDisplay: string;
  phoneHref: string;
  accountHref: string;
  accountLabel: string;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const router = useRouter();
  const openBooking = useBookingStore((state) => state.openBooking);

  function chooseLocale(code: Locale) {
    setLocale(code);
    document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }
  const copy = t(locale);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#cennik", label: copy.price },
    { href: "/#metamorfozy", label: copy.transformations },
    { href: "/#o-nas", label: copy.about },
    { href: "/#faq", label: "FAQ" },
    { href: "/kontakt", label: copy.contact },
    { href: accountHref, label: accountLabel },
  ];

  return (
    <header className="sticky top-0 z-40">
      <NoticeBar enabled={noticeEnabled} text={noticeText} />
      <div className="bg-ink text-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] tracking-wide sm:px-6">
          <a href={SALON.mapsUrl} className="inline-flex items-center gap-1.5 hover:text-pink-100" target="_blank" rel="noopener noreferrer">
            <MapPin size={13} aria-hidden />
            {SALON.addressLabel}
          </a>
          <div className="flex items-center gap-3">
            <a href={phoneHref} className="inline-flex items-center gap-1.5 font-medium hover:text-pink-100">
              <Phone size={13} aria-hidden />
              {phoneDisplay}
            </a>
            <div className="flex overflow-hidden rounded-full bg-white/10">
              {(["PL", "RU"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => chooseLocale(code)}
                  className={`px-2.5 py-1 ${locale === code ? "bg-berry text-white" : "text-white/80"}`}
                  aria-pressed={locale === code}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-ink/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-tight sm:text-2xl">
            <img src="/logo-pani.png" alt="" width={40} height={40} className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10" />
            Pani<span className="text-berry">Fryzjerka</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-ink/70 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openBooking()}
              className="hidden whitespace-nowrap rounded-full bg-berry px-3.5 py-2 text-sm font-semibold text-white hover:bg-berry-deep md:inline-flex"
            >
              {copy.book}
            </button>
            <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="flex flex-col gap-3 border-t border-pink-100 px-4 py-4 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={() => { setOpen(false); openBooking(); }} className="rounded-full bg-berry px-4 py-3 text-sm font-semibold text-white">
              {copy.book}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
