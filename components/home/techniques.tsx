"use client";

import { useBookingStore } from "@/store/use-booking-store";
import type { ServiceGroup } from "@/lib/booking/types";

const TECHNIQUES = [
  {
    id: "szycie-siwizny",
    kicker: "Grey Blending",
    title: "#szycieSiwizny",
    text: "Siwizna zostaje wpleciona w kolor, bez ostrej linii odrostu. Efekt ma wyglądać jak Twoje włosy, nie jak farba z pudełka.",
  },
  {
    id: "airtouch",
    kicker: "Miękkie przejście",
    title: "Airtouch",
    text: "Jasne pasma bez plam i bez twardej granicy. Kolor pracuje ze światłem i z tym, jak nosisz włosy na co dzień.",
  },
  {
    id: "balayage",
    kicker: "Światło we włosach",
    title: "Balayage i refleksy",
    text: "Rozjaśnienie malowane ręcznie: jaśniej przy twarzy i na końcach, ciemniej przy skórze. Odrost schodzi łagodnie.",
  },
  {
    id: "afroloki",
    kicker: "Forma i objętość",
    title: "Afroloki i dready",
    text: "Afroloki, dready i cornrowy robione cierpliwie, z planem korekty. Nie rozplataj ich sama między wizytami.",
  },
] as const;

export function Techniques({ services }: { services: ServiceGroup[] }) {
  const openBooking = useBookingStore((state) => state.openBooking);

  function book(id: string) {
    const group = services.find((service) => service.id === id);
    const variant = group?.variants.find((item) => item.hairLength === "medium") ?? group?.variants[0];
    if (group && variant) openBooking(group.id, variant.id);
    else openBooking();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TECHNIQUES.map((item) => (
        <article key={item.id} className="flex flex-col justify-between rounded-[1.75rem] bg-white p-7 ring-1 ring-pink-100">
          <div>
            <p className="text-sm font-semibold text-berry">{item.kicker}</p>
            <h3 className="mt-2 font-display text-3xl text-ink">{item.title}</h3>
            <p className="mt-3 text-base leading-7 text-ink">{item.text}</p>
          </div>
          <button type="button" onClick={() => book(item.id)} className="mt-6 self-start rounded-full bg-berry px-4 py-2.5 text-sm font-semibold text-white hover:bg-berry-deep">
            Zarezerwuj tę technikę
          </button>
        </article>
      ))}
    </div>
  );
}
