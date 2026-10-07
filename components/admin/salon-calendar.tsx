"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { blockHours, cancelVisit, releaseHour, removeBlock } from "@/actions/cms-calendar";
import type { CalendarDay } from "@/lib/booking/calendar-day";
import { formatWarsawTime } from "@/lib/utils";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output;
}

export function SalonCalendar({
  day,
  month,
  monthLabel,
  heading,
  lead,
  vapidPublicKey,
}: {
  day: CalendarDay;
  month: string;
  monthLabel: string;
  heading: string;
  lead: number;
  vapidPublicKey: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("");

  useEffect(() => {
    setSelected((current) =>
      current.filter((start) => day.cells.some((cell) => cell.startsAt === start && cell.state === "free")),
    );
    setRefreshedAt(
      new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()),
    );
  }, [day]);

  useEffect(() => {
    const refresh = () => router.refresh();
    const timer = window.setInterval(refresh, 15_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  function openDay(date: string, nextMonth = date.slice(0, 7)) {
    router.push(`/admin/kalendarz?date=${date}&month=${nextMonth}`);
  }

  function run(task: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error || "Nie udało się zapisać zmiany.");
      else router.refresh();
    });
  }

  async function enablePush() {
    setPushMessage("");
    try {
      if (!vapidPublicKey) {
        setPushMessage("Powiadomienia nie są jeszcze skonfigurowane na serwerze.");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setPushMessage("Na iPhonie dodaj najpierw Terminarz do ekranu początkowego i włącz powiadomienia z tej ikony.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushMessage("Powiadomienia są wyłączone. Włącz je w ustawieniach przeglądarki dla tej strony.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
      const worker = registration.installing || registration.waiting;
      if (worker && !registration.active) {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(new Error("timeout")), 10000);
          worker.addEventListener("statechange", () => {
            if (worker.state === "activated") {
              window.clearTimeout(timer);
              resolve();
            }
            if (worker.state === "redundant") {
              window.clearTimeout(timer);
              reject(new Error("redundant"));
            }
          });
        });
      }
      const ready = await navigator.serviceWorker.ready;
      const subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const response = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setPushMessage(response.ok ? "Powiadomienia są włączone na tym telefonie." : payload?.error || "Nie udało się włączyć powiadomień.");
    } catch {
      setPushMessage("Nie udało się włączyć powiadomień. Odśwież terminarz i spróbuj jeszcze raz.");
    }
  }

  const selectedLabels = day.cells.filter((cell) => selected.includes(cell.startsAt)).map((cell) => cell.label);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-ink">Terminarz</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-mauve">
            <span className="inline-block size-2 animate-pulse rounded-full bg-berry" aria-hidden />
            Odświeża się sam{refreshedAt ? ` · ${refreshedAt}` : ""}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-[1.75rem] bg-white p-4 ring-1 ring-pink-100 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-ink hover:bg-blush"
            aria-label="Poprzedni miesiąc"
            onClick={() => openDay(`${shiftMonth(month, -1)}-01`, shiftMonth(month, -1))}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display text-2xl capitalize">{monthLabel}</h2>
          <button
            type="button"
            className="rounded-full p-2 text-ink hover:bg-blush"
            aria-label="Następny miesiąc"
            onClick={() => openDay(`${shiftMonth(month, 1)}-01`, shiftMonth(month, 1))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-mauve">
          {WEEKDAYS.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: lead }, (_, index) => (
            <div key={`pad-${index}`} />
          ))}
          {day.monthDays.map((item) => {
            const active = item.date === day.date;
            const number = Number(item.date.slice(8));
            return (
              <button
                key={item.date}
                type="button"
                onClick={() => openDay(item.date, month)}
                className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-sm ${
                  active ? "bg-berry font-semibold text-white" : "hover:bg-blush"
                }`}
              >
                {number}
                <span className="mt-0.5 flex h-1.5 gap-0.5" aria-hidden>
                  {item.bookings > 0 ? <span className={`size-1.5 rounded-full ${active ? "bg-white" : "bg-berry"}`} /> : null}
                  {item.blocked ? <span className={`size-1.5 rounded-full ${active ? "bg-white/70" : "bg-mauve"}`} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-pink-100 sm:p-6">
        <h2 className="font-display text-2xl capitalize">{heading}</h2>
        <p className="mt-1 text-sm text-mauve">Kto jest umówiony i na jaką usługę.</p>
        {day.visits.length === 0 ? (
          <p className="mt-3 text-sm text-mauve">Tego dnia nikt nie jest umówiony.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {day.visits.map((visit) => (
              <li key={visit.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blush px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-berry">{visit.timeLabel}</p>
                  <p className="mt-1 font-display text-2xl text-ink">{visit.customerName}</p>
                  <p className="text-sm text-ink">
                    {visit.serviceName}
                    {" · "}
                    <a className="font-semibold text-berry" href={`tel:${visit.customerPhone.replace(/\s/g, "")}`}>
                      {visit.customerPhone}
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-berry ring-1 ring-berry/20 disabled:opacity-50"
                  onClick={() => {
                    if (window.confirm(`Odwołać wizytę ${visit.customerName} o ${visit.timeLabel}? Termin wróci do rezerwacji.`)) {
                      run(() => cancelVisit(visit.id));
                    }
                  }}
                >
                  Odwołaj
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-pink-100 sm:p-6">
        <h2 className="font-display text-2xl">Niedostępne godziny</h2>
        <p className="mt-2 text-sm leading-6 text-mauve">
          Zaznacz kilka godzin i oznacz je jednym przyciskiem. Klientki nie zobaczą tych terminów. Jedno stuknięcie w zajętą godzinę zwalnia tylko ją.
        </p>
        {day.closed ? <p className="mt-4 text-sm text-ink">W niedzielę salon jest nieczynny.</p> : null}
        {day.blocks.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {day.blocks.map((block) => (
              <li key={block.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8D5E6] px-4 py-3 text-sm">
                <span>
                  {formatWarsawTime(block.startsAt)}–{formatWarsawTime(block.endsAt)} · niedostępna
                </span>
                <button
                  type="button"
                  disabled={pending}
                  className="font-semibold text-berry disabled:opacity-50"
                  onClick={() => run(() => removeBlock(block.id))}
                >
                  Usuń całość
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {day.cells.map((cell) => {
            const picked = selected.includes(cell.startsAt);
            const visit = day.visits.find((item) => {
              const start = new Date(item.startsAt).getTime();
              return start >= new Date(cell.startsAt).getTime() && start < new Date(cell.endsAt).getTime();
            });
            return (
              <button
                key={cell.startsAt}
                type="button"
                disabled={pending || cell.state === "booked"}
                aria-pressed={cell.state === "blocked" || picked}
                onClick={() => {
                  if (cell.state === "blocked") {
                    run(() => releaseHour(day.date, cell.label));
                    return;
                  }
                  setSelected((current) =>
                    current.includes(cell.startsAt) ? current.filter((start) => start !== cell.startsAt) : [...current, cell.startsAt],
                  );
                }}
                className={`min-h-16 rounded-2xl px-2 py-2 text-sm ${
                  cell.state === "booked"
                    ? "bg-blush text-mauve"
                    : cell.state === "blocked"
                      ? "bg-[#F8D5E6] font-semibold text-ink"
                      : picked
                        ? "bg-berry font-semibold text-white"
                        : "bg-white font-semibold text-ink ring-1 ring-pink-200"
                }`}
              >
                <span className={`block ${cell.state === "booked" ? "line-through" : ""}`}>{cell.label}</span>
                <span className="mt-0.5 block text-[11px] font-medium normal-case no-underline">
                  {cell.state === "booked" ? visit?.customerName || "zajęte" : cell.state === "blocked" ? "zwolnij" : picked ? "wybrane" : "wolne"}
                </span>
              </button>
            );
          })}
        </div>
        {selectedLabels.length > 0 ? (
          <button
            type="button"
            disabled={pending}
            className="mt-4 w-full rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => {
              run(async () => {
                const result = await blockHours(day.date, selectedLabels);
                if (result.ok) setSelected([]);
                return result;
              });
            }}
          >
            Oznacz {selectedLabels.length === 1 ? "tę godzinę" : `${selectedLabels.length} godz.`} jako niedostępne
          </button>
        ) : null}
        {error ? <p className="mt-3 text-sm text-berry">{error}</p> : null}
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-pink-100 sm:p-6">
        <h2 className="font-display text-2xl">Telefon</h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-ink/80">
          <p>Strona dla klientek i ten kalendarz to dwie osobne ikony. Każdą dodaje się z własnego adresu.</p>
          <p>
            <span className="font-semibold">Klientki, iPhone i Android:</span> otwórz stronę salonu i wybierz „Dodaj do ekranu początkowego” albo „Zainstaluj aplikację”.
          </p>
          <p>
            <span className="font-semibold">Terminarz na iPhonie:</span> w Safari stuknij Udostępnij, potem „Do ekranu początkowego”. Otwórz ikonę Terminarz i włącz powiadomienia. iPhone pokazuje je dopiero z tej ikony.
          </p>
          <p>
            <span className="font-semibold">Terminarz na Androidzie:</span> w Chrome otwórz menu i wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”, potem włącz powiadomienia.
          </p>
          <p>Ikona otwiera dzisiejsze zapisy. Mały kafelek systemu, który sam pokazuje dzień bez otwierania aplikacji, wymaga osobnej aplikacji ze sklepu.</p>
        </div>
        <button
          type="button"
          onClick={() => void enablePush()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white"
        >
          <Bell size={16} aria-hidden />
          Włącz powiadomienia
        </button>
        {pushMessage ? <p className="mt-3 text-sm text-ink">{pushMessage}</p> : null}
      </section>
    </div>
  );
}
