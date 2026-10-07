import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "analytics.json");

export type AnalyticsEvent = {
  at: string;
  type: "view" | "book";
  path: string;
  label?: string;
};

function readEvents(): AnalyticsEvent[] {
  if (!existsSync(FILE)) return [];
  try {
    const parsed: unknown = JSON.parse(readFileSync(FILE, "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AnalyticsEvent => Boolean(item && typeof item.at === "string" && typeof item.path === "string"));
  } catch {
    return [];
  }
}

export function recordEvent(event: Omit<AnalyticsEvent, "at">) {
  try {
    const events = readEvents();
    events.push({ ...event, at: new Date().toISOString() });
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(events.slice(-5000)));
  } catch {
    // Na hostingu bez zapisu na dysk wizyta zostaje niezliczona.
  }
}

export function summarizeAnalytics() {
  const events = readEvents();
  const now = Date.now();
  const within = (days: number) => events.filter((event) => now - new Date(event.at).getTime() < days * 86_400_000);
  const views30 = within(30).filter((event) => event.type === "view");
  const books30 = within(30).filter((event) => event.type === "book");
  const paths = new Map<string, number>();
  for (const event of views30) paths.set(event.path, (paths.get(event.path) ?? 0) + 1);
  const services = new Map<string, number>();
  for (const event of books30) {
    const label = event.label?.trim() || "wizyta";
    services.set(label, (services.get(label) ?? 0) + 1);
  }
  const rank = (map: Map<string, number>) => [...map.entries()].sort((left, right) => right[1] - left[1]).slice(0, 8);
  return {
    views7: within(7).filter((event) => event.type === "view").length,
    views30: views30.length,
    books30: books30.length,
    paths: rank(paths),
    services: rank(services),
  };
}
