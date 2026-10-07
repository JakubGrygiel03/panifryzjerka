import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { labelForPath } from "@/lib/analytics/labels";

const FILE = path.join(process.cwd(), "data", "analytics.json");

export type AnalyticsEvent = {
  at: string;
  type: "view" | "click" | "book";
  path: string;
  label?: string;
  visitor?: string;
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

function people(events: AnalyticsEvent[]) {
  const ids = new Set(events.map((event) => event.visitor).filter((id): id is string => Boolean(id)));
  return ids.size;
}

function rank(map: Map<string, number>, limit = 6) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function summarizeAnalytics() {
  const events = readEvents();
  const now = Date.now();
  const within = (days: number) => events.filter((event) => now - new Date(event.at).getTime() < days * 86_400_000);
  const recent = within(30);
  const views30 = recent.filter((event) => event.type === "view");
  const clicks30 = recent.filter((event) => event.type === "click");
  const books30 = recent.filter((event) => event.type === "book");
  const pages = new Map<string, number>();
  const topics = new Map<string, number>();
  for (const event of views30) {
    const label = labelForPath(event.path);
    if (!label) continue;
    pages.set(label, (pages.get(label) ?? 0) + 1);
    if (label !== "Strona główna") topics.set(label, (topics.get(label) ?? 0) + 1);
  }
  const clicks = new Map<string, number>();
  for (const event of clicks30) {
    const label = event.label?.trim();
    if (!label) continue;
    clicks.set(label, (clicks.get(label) ?? 0) + 1);
  }
  const interest = new Map<string, number>();
  const add = (label: string, weight: number) => interest.set(label, (interest.get(label) ?? 0) + weight);
  for (const [label, count] of topics) add(label, count);
  for (const event of clicks30) {
    const label = event.label?.trim();
    if (!label) continue;
    const service = label.startsWith("Usługa · ") ? label.slice("Usługa · ".length) : "";
    add(service || label, 2);
  }
  for (const event of books30) add(event.label?.trim() || "Rezerwacja", 3);
  return {
    people30: people(views30),
    views7: within(7).filter((event) => event.type === "view").length,
    views30: views30.length,
    clicks30: clicks30.length,
    books30: books30.length,
    pages: rank(pages),
    clicks: rank(clicks),
    interest: rank(interest),
  };
}
