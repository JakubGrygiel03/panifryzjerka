import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findPublishedVariant } from "@/lib/cms/store";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/cms/session";
import { listAppointments } from "@/lib/booking/repository";
import { formatWarsawDate, formatWarsawTime, warsawToday } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!isAdminCookieValue(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const since = Date.now() - 12 * 60 * 60_000;
  let rows: Awaited<ReturnType<typeof listAppointments>> = [];
  try {
    rows = await listAppointments();
  } catch {
    return NextResponse.json({ visits: [] });
  }
  const visits = rows
    .filter((row) => row.status !== "cancelled" && new Date(row.createdAt).getTime() >= since)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 30)
    .map((row) => {
      const match = findPublishedVariant(row.serviceId);
      const when = `${formatWarsawDate(row.startsAt)} ${formatWarsawTime(row.startsAt)}`;
      return {
        id: row.id,
        title: "Nowa wizyta",
        body: `${row.customerName}, ${match?.group.name ?? "Wizyta"}, ${when}`,
        url: `/admin/kalendarz?date=${warsawToday(new Date(row.startsAt))}`,
      };
    });

  return NextResponse.json({ visits }, { headers: { "cache-control": "no-store" } });
}
