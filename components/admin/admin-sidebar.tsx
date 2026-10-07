"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, GalleryHorizontal, HelpCircle, ImageIcon, LayoutDashboard, MessageSquareQuote, Rows3, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Salon",
    items: [
      { href: "/admin", label: "Pulpit", icon: LayoutDashboard },
      { href: "/admin/kalendarz", label: "Terminarz", icon: CalendarDays },
      { href: "/admin/ustawienia", label: "Ustawienia", icon: Settings },
      { href: "/admin/uklad", label: "Układ strony", icon: Rows3 },
      { href: "/admin/zdjecia", label: "Zdjęcia", icon: ImageIcon },
      { href: "/admin/pokaz", label: "Pokaz", icon: GalleryHorizontal },
    ],
  },
  {
    label: "Treść strony",
    items: [
      { href: "/admin/cennik", label: "Cennik", icon: Clock },
      { href: "/admin/opinie", label: "Opinie", icon: MessageSquareQuote },
      { href: "/admin/pytania", label: "Pytania", icon: HelpCircle },
    ],
  },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-ink/40 md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-pink-100 bg-white text-ink transition-transform duration-200 md:sticky md:top-0 md:h-dvh md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-pink-100 px-4">
          <Link href="/admin" onClick={onClose}>
            <p className="text-[11px] font-semibold text-berry">CMS</p>
            <p className="font-display text-lg leading-none">
              Pani<span className="text-berry">Fryzjerka</span>
            </p>
          </Link>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-ink/60 hover:bg-blush md:hidden" aria-label="Zamknij menu">
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-semibold text-mauve">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-full px-3 py-2 text-sm transition-colors",
                          active ? "bg-berry text-white" : "text-ink hover:bg-blush",
                        )}
                      >
                        <Icon size={16} strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <form action="/api/admin/logout" method="post" className="border-t border-pink-100 p-3">
          <button type="submit" className="w-full rounded-full px-3 py-2 text-left text-sm text-mauve hover:bg-blush hover:text-berry">
            Wyloguj się
          </button>
        </form>
      </aside>
    </>
  );
}
