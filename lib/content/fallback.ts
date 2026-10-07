import { SALON, SALON_DOG, STAFF } from "@/lib/brand";
import { SERVICE_CATALOG } from "@/lib/booking/catalog";
import { irynaPhoto } from "@/lib/content/gallery";
import type { SalonContent } from "@/lib/content/types";

export const fallbackContent: SalonContent = {
  settings: {
    phone: SALON.phoneDisplay,
    address: SALON.street,
    city: SALON.city,
    postalCode: SALON.postalCode,
    mapsUrl: SALON.mapsUrl,
    noticeEnabled: false,
    noticeText: "",
    openingHours: [
      { day: "Poniedziałek–piątek", hours: "9:00–20:00" },
      { day: "Sobota", hours: "9:00–18:00" },
      { day: "Niedziela", hours: "nieczynne" },
    ],
    googleRating: SALON.rating,
    googleReviewCount: SALON.reviewCount,
    googleReviewsUrl: SALON.reviewsUrl,
  },
  services: SERVICE_CATALOG,
  transformations: [],
  team: [
    {
      id: STAFF.iryna.id,
      name: STAFF.iryna.name,
      role: STAFF.iryna.role,
      bio: "Koloryzacja, szycie siwizny, strzyżenie i afroloki. Pracuje spokojnie i tłumaczy zabieg — także po rosyjsku i ukraińsku.",
      specialties: [...STAFF.iryna.specialties],
      photo: irynaPhoto.src,
    },
    {
      id: "bella-pies",
      name: SALON_DOG.name,
      role: SALON_DOG.role,
      bio: SALON_DOG.bio,
      specialties: [],
      photo: null,
    },
  ],
  reviews: [
    {
      name: "Karolina W.",
      service: "Szycie siwizny",
      text: "Pani Iryna zrobiła szycie siwizny tak, że przyjaciółki biorą ten kolor za naturalny. Bella, pies salonu, spała obok fotela.",
    },
    {
      name: "Marta K.",
      service: "Afroloki",
      text: "Afroloki zrobione cierpliwie i dokładnie. Atmosfera jak u przyjaciółki — i Bella śpiąca pod fotelem.",
    },
    {
      name: "Anastasia P.",
      service: "Airtouch",
      text: "Airtouch wyszedł lekko i równo. Iryna tłumaczy zabieg spokojnie, także po rosyjsku i ukraińsku.",
    },
    {
      name: "Agnieszka T.",
      service: "Strzyżenie dziecięce",
      text: "Byłam z córką. Fryzura wyszła bez jednej łzy, a w salonie da się usiąść z dzieckiem.",
    },
  ],
};
