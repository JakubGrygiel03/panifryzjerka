const PAIR = { pl: "pl", ru: "ru" } as const;

function pieces(text: string, limit = 420) {
  if (text.length <= limit) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > limit) {
    const slice = rest.slice(0, limit);
    const cut = Math.max(slice.lastIndexOf("\n"), slice.lastIndexOf(". "), slice.lastIndexOf(" "));
    const at = cut > 80 ? cut + 1 : limit;
    parts.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  if (rest) parts.push(rest);
  return parts;
}

const memory = new Map<string, string>();

export async function translateText(text: string, from: "pl" | "ru", to: "pl" | "ru") {
  const source = text.trim();
  if (!source || !/[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻżА-Яа-яЁёІіЇїЄєҐґ]/.test(source)) return source;
  const key = `${from}|${to}|${source}`;
  const cached = memory.get(key);
  if (cached) return cached;
  const translated: string[] = [];
  for (const piece of pieces(source)) {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", piece);
    url.searchParams.set("langpair", `${PAIR[from]}|${PAIR[to]}`);
    url.searchParams.set("de", "admin@panifryzjerka.pl");
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Tłumaczenie jest chwilowo niedostępne.");
    const data = (await response.json()) as { responseData?: { translatedText?: string } };
    const line = data.responseData?.translatedText?.trim() ?? "";
    if (!line || line.includes("MYMEMORY WARNING") || line.includes("QUERY LENGTH")) {
      throw new Error("Tłumaczenie jest chwilowo niedostępne.");
    }
    translated.push(line);
  }
  const result = translated.join("");
  memory.set(key, result);
  return result;
}
