import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel",
  applicationName: "Kalendarz salonu",
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Terminarz", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
