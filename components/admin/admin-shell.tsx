"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLogin = pathname === "/admin/logowanie";

  if (isLogin) return <div className="min-h-screen bg-blush">{children}</div>;

  return (
    <div className="flex min-h-screen bg-blush text-ink">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
