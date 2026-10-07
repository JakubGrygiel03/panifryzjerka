import { SALON } from "@/lib/brand";
import { loadCalendarDay } from "@/lib/booking/calendar-day";
import { dayOfWeekInTimeZone, zonedLocalToUtc } from "@/lib/booking/slot-calculator";
import { warsawToday } from "@/lib/utils";
import { SalonCalendar } from "@/components/admin/salon-calendar";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}$/;

function polishDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pl-PL", { timeZone: SALON.timezone, ...options }).format(
    zonedLocalToUtc(date, "12:00", SALON.timezone),
  );
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; month?: string }>;
}) {
  const query = await searchParams;
  const today = warsawToday();
  const date = query.date && DATE.test(query.date) ? query.date : today;
  const month = query.month && MONTH.test(query.month) ? query.month : date.slice(0, 7);
  const lead = (dayOfWeekInTimeZone(`${month}-01`, SALON.timezone) + 6) % 7;

  try {
    const day = await loadCalendarDay(date, month);
    return (
      <SalonCalendar
        day={day}
        month={month}
        monthLabel={polishDate(`${month}-01`, { month: "long", year: "numeric" })}
        heading={polishDate(date, { weekday: "long", day: "numeric", month: "long" })}
        lead={lead}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? ""}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nie udało się wczytać kalendarza.";
    return (
      <div>
        <h1 className="font-display text-4xl">Terminarz</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink">{message}</p>
      </div>
    );
  }
}
