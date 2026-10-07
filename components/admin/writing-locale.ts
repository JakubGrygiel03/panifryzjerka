"use client";

import { useCmsLocaleStore } from "@/store/use-cms-locale-store";

export function useWritingLocale() {
  return useCmsLocaleStore((state) => state.locale);
}
