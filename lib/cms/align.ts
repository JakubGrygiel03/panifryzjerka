import type { Locale } from "@/lib/i18n";
import { translateText } from "@/lib/cms/translate";

export async function alignPair(source: Locale, prevPl: string, nextPl: string, prevRu: string, nextRu: string) {
  const plIn = nextPl.trim();
  const ruIn = nextRu.trim();
  const prevPlText = prevPl.trim();
  const prevRuText = prevRu.trim();

  if (source === "RU" && ruIn) {
    if (ruIn === prevRuText && prevPlText) return { pl: prevPlText, ru: ruIn, failed: false };
    try {
      return { pl: await translateText(ruIn, "ru", "pl"), ru: ruIn, failed: false };
    } catch {
      return { pl: prevPlText || plIn, ru: ruIn, failed: true };
    }
  }

  if (source === "RU" && !ruIn && prevRuText && plIn) {
    try {
      return { pl: plIn, ru: await translateText(plIn, "pl", "ru"), failed: false };
    } catch {
      return { pl: plIn, ru: "", failed: true };
    }
  }

  if (!plIn) return { pl: "", ru: "", failed: false };
  if (plIn === prevPlText && prevRuText) return { pl: plIn, ru: prevRuText, failed: false };
  try {
    return { pl: plIn, ru: await translateText(plIn, "pl", "ru"), failed: false };
  } catch {
    return { pl: plIn, ru: prevRuText, failed: true };
  }
}

export function savedMessage(failed: number) {
  if (failed > 0) return "Zapisane. Część zdań nie przetłumaczyła się i została w poprzedniej wersji.";
  return "Zapisane. Druga wersja językowa jest uzupełniona.";
}
