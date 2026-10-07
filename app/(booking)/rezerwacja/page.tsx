import type { Metadata } from "next";
import { BookingPage } from "@/components/booking/booking-page";
import { presentLengthGuide } from "@/lib/cms/present";
import { getLengthGuide } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = { title: "Rezerwacja" };

export default async function ReservationPage() {
  const [content, locale] = await Promise.all([getSalonContent(), getRequestLocale()]);
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl">Rezerwacja online</h1>
      <BookingPage services={content.services} lengthGuide={presentLengthGuide(getLengthGuide(), locale)} />
    </section>
  );
}
