"use client";

import { useEffect } from "react";

const EVERY = 10_000;

export function VisitWatch() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let timer = 0;
    let cancelled = false;

    void (async () => {
      const registration = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
      await navigator.serviceWorker.ready;
      if (cancelled) return;
      const ping = () => {
        const worker = registration.active ?? navigator.serviceWorker.controller;
        worker?.postMessage({ type: "watch" });
      };
      ping();
      timer = window.setInterval(ping, EVERY);
    })().catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
