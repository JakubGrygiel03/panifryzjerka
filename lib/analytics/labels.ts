const PAGE_LABELS: Record<string, string> = {
  "/": "Strona główna",
  "/cennik": "Cennik",
  "/metamorfozy": "Metamorfozy",
  "/kontakt": "Kontakt",
  "/rezerwacja": "Rezerwacja",
  "/o-nas": "O nas",
  "/faq": "Pytania",
  "/szycie-siwizny": "Szycie siwizny",
  "/pielegnacja": "Pielęgnacja",
  "/przygotowanie": "Przygotowanie",
  "/odwolanie": "Odwołanie",
};

export function labelForPath(path: string) {
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  return PAGE_LABELS[clean] ?? "";
}
