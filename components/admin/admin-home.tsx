"use client";

import Link from "next/link";
import { useWritingLocale } from "@/components/admin/writing-locale";
import { adminCopy } from "@/lib/i18n/admin";

export function AdminHome({
  services,
  reviews,
  questions,
  today,
  waiting,
}: {
  services: number;
  reviews: number;
  questions: number;
  today: number;
  waiting: number;
}) {
  const copy = adminCopy(useWritingLocale());
  const counts = [
    { href: "/admin/cennik", value: services, label: copy.dashServices },
    { href: "/admin/opinie", value: reviews, label: copy.dashReviews },
    { href: "/admin/pytania", value: questions, label: copy.dashQuestions },
  ];
  const links = [
    { href: "/admin/kalendarz", label: copy.calendar, note: `${today} ${copy.dashToday}` },
    { href: "/admin/klientki", label: copy.clients, note: "" },
    { href: "/admin/rezerwa", label: copy.waitlist, note: `${waiting} ${copy.dashWaiting}` },
    { href: "/admin/analityka", label: copy.analytics, note: "" },
    { href: "/admin/ustawienia", label: copy.settings, note: "" },
    { href: "/admin/uklad", label: copy.layout, note: "" },
    { href: "/admin/zdjecia", label: copy.photos, note: "" },
    { href: "/admin/pokaz", label: copy.showcase, note: "" },
    { href: "/admin/maile", label: copy.mail, note: "" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">{copy.dashboard}</h1>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {counts.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-pink-200">
            <span className="block font-display text-4xl text-ink">{item.value}</span>
            <span className="text-sm text-mauve">{item.label}</span>
          </Link>
        ))}
      </div>
      <nav className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-pink-200 hover:ring-berry">
            <span>{item.label}</span>
            {item.note ? <span className="text-xs font-medium text-mauve">{item.note}</span> : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
