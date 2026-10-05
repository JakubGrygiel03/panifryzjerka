import type { Metadata } from "next";
import { BookingPage } from "@/components/booking/booking-page";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const metadata: Metadata = { title: "Rezerwacja" };

export default async function ReservationPage() {
  const content = await getSalonContent();
  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl">Rezerwacja online</h1>
      <BookingPage services={content.services} />
    </section>
  );
}
