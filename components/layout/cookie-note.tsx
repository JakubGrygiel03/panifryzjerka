"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function CookieNote() {
  const copy = t(useLocaleStore((state) => state.locale));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("pf-cookie") !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-3 bottom-24 left-3 z-30 rounded-3xl bg-ink p-4 text-sm text-white shadow-lg md:bottom-4 md:left-auto md:max-w-sm">
      <p>{copy.cookie}</p>
      <button
        type="button"
        className="mt-3 rounded-full bg-berry px-3 py-1.5 text-xs font-semibold"
        onClick={() => {
          localStorage.setItem("pf-cookie", "1");
          setVisible(false);
        }}
      >
        {copy.cookieOk}
      </button>
    </div>
  );
}
