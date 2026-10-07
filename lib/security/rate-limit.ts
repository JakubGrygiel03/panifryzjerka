const hits = new Map<string, number[]>();

export function clientKey(headerStore: Headers) {
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const real = headerStore.get("x-real-ip")?.trim() ?? "";
  return (forwarded || real || "local").slice(0, 80);
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 4000) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return true;
}
