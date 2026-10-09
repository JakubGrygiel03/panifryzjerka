"use client";

import { labelForPath } from "@/lib/analytics/labels";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function visitorId() {
  const key = "pf-visitor";
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

const sentAt = new Map<string, number>();

function once(key: string) {
  const now = Date.now();
  if (now - (sentAt.get(key) ?? 0) < 1200) return false;
  sentAt.set(key, now);
  return true;
}

function send(body: { path: string; type: "view" | "click"; label?: string }) {
  if (!once(`${body.type}:${body.path}:${body.label ?? ""}`)) return;
  const payload = JSON.stringify({ ...body, visitor: visitorId() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}

function clickLabel(target: Element) {
  const tracked = target.closest("[data-track]");
  const marked = tracked?.getAttribute("data-track")?.trim();
  if (marked) return marked.slice(0, 80);
  const link = target.closest("a");
  const href = link?.getAttribute("href") || "";
  if (href.startsWith("tel:")) return "Telefon";
  if (/maps\.google|google\.com\/maps|goo\.gl\/maps/i.test(href)) return "Mapa";
  if (/instagram\.com/i.test(href)) return "Instagram";
  if (/facebook\.com/i.test(href)) return "Facebook";
  if (href.startsWith("/")) {
    const page = labelForPath(href);
    if (page && page !== "Strona główna") return page;
  }
  const button = target.closest("button");
  const text = (button?.textContent || "").replace(/\s+/g, " ").trim();
  if (/zarezerwuj|записат/i.test(text)) return "Rezerwacja";
  return "";
}

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    send({ path: pathname, type: "view" });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const label = clickLabel(target);
      if (!label) return;
      send({ path: window.location.pathname, type: "click", label });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
