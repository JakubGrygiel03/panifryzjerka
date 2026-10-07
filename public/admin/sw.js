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
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: payload.url || "/admin/kalendarz" },
    }),
  );
});

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
