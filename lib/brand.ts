export const SALON = {
  name: "PaniFryzjerka",
  slug: "panifryzjerka",
  tenantId: "11111111-1111-4111-8111-111111111111",
  phoneDisplay: "880-606-454",
  phoneHref: "tel:+48880606454",
  phoneE164: "+48880606454",
  street: "ul. Skarpowa 24",
  postalCode: "80-145",
  city: "Gdańsk",
  addressLabel: "Gdańsk, ul. Skarpowa 24",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=ul.+Skarpowa+24%2C+Gda%C5%84sk",
  reviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=PaniFryzjerka+ul.+Skarpowa+24+Gda%C5%84sk",
  latitude: 54.352083,
  longitude: 18.6237291,
  email: "kontakt@panifryzjerka.pl",
  timezone: "Europe/Warsaw",
  slotIntervalMinutes: 15,
  bufferMinutes: 15,
  rating: 4.9,
  reviewCount: 194,
  reviewCountLabel: "194+",
  siteUrl: "https://panifryzjerka.pl",
  instagram: "https://www.instagram.com/panifryzjerka/",
  facebook: "https://www.facebook.com/panifryzjerka",
} as const;

export const STAFF = {
  iryna: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Pani Iryna",
    role: "Stylistka — koloryzacja, strzyżenie i afroloki",
    specialties: ["#szycieSiwizny", "Airtouch", "Balayage", "Strzyżenie", "Afroloki"],
  },
} as const;

export const SALON_DOG = {
  name: "Bella",
  role: "Pies salonu",
  bio: "Bella mieszka w rytmie salonu i wita gości przy fotelu. Spokojne psy są tu mile widziane.",
} as const;

export const ANY_STAFF_ID = "any";
