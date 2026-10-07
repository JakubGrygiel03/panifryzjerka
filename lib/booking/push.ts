import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import webpush from "web-push";
import { SALON } from "@/lib/brand";
import { bookingBackend } from "@/lib/booking/backend";
import { createAdminClient } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "push-subscriptions.json");

type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readLocal(): Promise<SubscriptionRow[]> {
  try {
    const raw = (await readFile(FILE, "utf8")).replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SubscriptionRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(rows: SubscriptionRow[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
  await rename(temp, FILE);
}

export async function savePushSubscription(row: SubscriptionRow) {
  const backend = bookingBackend();
  if (backend === "unconfigured") throw new Error("Powiadomienia wymagają konfiguracji Supabase.");

  if (backend === "supabase") {
    const admin = createAdminClient();
    const { error } = await admin.from("push_subscriptions").upsert(
      { endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth },
      { onConflict: "endpoint" },
    );
    if (error) throw new Error("Nie udało się zapisać powiadomień na tym telefonie.");
    return;
  }

  await enqueue(async () => {
    const rows = await readLocal();
    const next = rows.filter((item) => item.endpoint !== row.endpoint);
    next.push(row);
    await writeLocal(next);
  });
}

async function listSubscriptions(): Promise<SubscriptionRow[]> {
  if (bookingBackend() === "supabase") {
    const admin = createAdminClient();
    const { data, error } = await admin.from("push_subscriptions").select("endpoint, p256dh, auth");
    if (error) return [];
    return (data ?? []) as SubscriptionRow[];
  }
  if (bookingBackend() === "unconfigured") return [];
  return readLocal();
}

async function removeSubscription(endpoint: string) {
  if (bookingBackend() === "supabase") {
    const admin = createAdminClient();
    await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return;
  }
  await enqueue(async () => {
    const rows = await readLocal();
    await writeLocal(rows.filter((row) => row.endpoint !== endpoint));
  });
}

export async function notifyOwner(message: { title: string; body: string; url: string }) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return;

  try {
    webpush.setVapidDetails(`mailto:${SALON.email}`, publicKey, privateKey);
    const rows = await listSubscriptions();
    await Promise.all(
      rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            JSON.stringify(message),
          );
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await removeSubscription(row.endpoint);
        }
      }),
    );
  } catch {
    // Brak powiadomienia nie może cofnąć zapisanej wizyty.
  }
}
