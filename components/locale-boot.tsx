"use client";

import { useLayoutEffect } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function LocaleBoot({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    useLocaleStore.setState({ locale });
  }, [locale]);
  return null;
}
