"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const payload = new Blob([JSON.stringify({ path: pathname })], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", payload);
  }, [pathname]);

  return null;
}
