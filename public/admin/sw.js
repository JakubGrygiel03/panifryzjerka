self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Nowa wizyta",
    body: "Ktoś zapisał się do salonu.",
    url: "/admin/kalendarz",
  };
  try {
    const data = event.data ? event.data.json() : null;
    if (data && typeof data === "object") payload = { ...payload, ...data };
  } catch {
    payload.body = event.data ? event.data.text() : payload.body;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-terminarz-192.png",
      badge: "/icon-terminarz-192.png",
      tag: payload.id || payload.url || "wizyta",
      renotify: true,
      data: { url: payload.url || "/admin/kalendarz" },
    }),
  );
});

function openSeen() {
  return new Promise((resolve) => {
    const request = indexedDB.open("pf-terminarz", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("seen");
    };
    request.onerror = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
  });
}

function readSeen(db) {
  return new Promise((resolve) => {
    if (!db) {
      resolve({ ready: false, ids: [] });
      return;
    }
    const get = db.transaction("seen", "readonly").objectStore("seen").get("watch");
    get.onerror = () => resolve({ ready: false, ids: [] });
    get.onsuccess = () => resolve(get.result || { ready: false, ids: [] });
  });
}

function writeSeen(db, value) {
  return new Promise((resolve) => {
    if (!db) {
      resolve();
      return;
    }
    const put = db.transaction("seen", "readwrite").objectStore("seen").put(value, "watch");
    put.onsuccess = () => resolve();
    put.onerror = () => resolve();
  });
}

let lastCheck = 0;

async function checkVisits() {
  const now = Date.now();
  if (now - lastCheck < 8000) return;
  lastCheck = now;
  let payload;
  try {
    const response = await fetch("/api/admin/push/watch", { credentials: "include", cache: "no-store" });
    if (!response.ok) return;
    payload = await response.json();
  } catch {
    return;
  }
  const visits = Array.isArray(payload?.visits) ? payload.visits : [];
  const db = await openSeen();
  const seen = await readSeen(db);
  const ids = Array.isArray(seen.ids) ? seen.ids : [];
  if (!seen.ready) {
    await writeSeen(db, { ready: true, ids: visits.map((visit) => visit.id).slice(-80) });
    return;
  }
  const nextIds = ids.slice();
  for (const visit of visits) {
    if (!visit || !visit.id || nextIds.includes(visit.id)) continue;
    nextIds.push(visit.id);
    await self.registration.showNotification(visit.title || "Nowa wizyta", {
      body: visit.body || "Ktoś zapisał się do salonu.",
      icon: "/icon-terminarz-192.png",
      badge: "/icon-terminarz-192.png",
      tag: visit.id,
      data: { url: visit.url || "/admin/kalendarz" },
    });
  }
  await writeSeen(db, { ready: true, ids: nextIds.slice(-80) });
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "watch") event.waitUntil(checkVisits());
});

setInterval(() => {
  checkVisits();
}, 10_000);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/admin/kalendarz";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((window) => window.url.includes("/admin/kalendarz"));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    }),
  );
});
