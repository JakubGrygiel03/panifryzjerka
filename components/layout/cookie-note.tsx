"use client";

import { useEffect, useState } from "react";

export function CookieNote() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("pf-cookie") !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-3 bottom-24 left-3 z-30 rounded-3xl bg-ink p-4 text-sm text-white shadow-lg md:bottom-4 md:left-auto md:max-w-sm">
      <p>Strona nie śledzi Cię reklamami. Zapis wizyty trzyma tylko dane potrzebne do kontaktu.</p>
      <button
        type="button"
        className="mt-3 rounded-full bg-berry px-3 py-1.5 text-xs font-semibold"
        onClick={() => {
          localStorage.setItem("pf-cookie", "1");
          setVisible(false);
        }}
      >
        Rozumiem
      </button>
    </div>
  );
}
