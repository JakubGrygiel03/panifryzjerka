"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/i18n";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "PL",
  setLocale: (locale) => set({ locale }),
}));
