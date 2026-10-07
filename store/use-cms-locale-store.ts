"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/i18n";

type CmsLocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useCmsLocaleStore = create<CmsLocaleState>((set) => ({
  locale: "PL",
  setLocale: (locale) => {
    if (typeof window !== "undefined") window.localStorage.setItem("pf-cms-locale", locale);
    set({ locale });
  },
}));
