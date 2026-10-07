import { SALON, STAFF } from "@/lib/brand";
import { CATEGORIES } from "@/lib/booking/catalog";
import type { FaqItem } from "@/lib/cms/store";

export function hairSalonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: SALON.name,
    url: SALON.siteUrl,
    image: `${SALON.siteUrl}/opengraph.jpg`,
    telephone: SALON.phoneE164,
    email: SALON.email,
    priceRange: "$$",
    currenciesAccepted: "PLN",
    address: {
      "@type": "PostalAddress",
      streetAddress: SALON.street,
      addressLocality: SALON.city,
      postalCode: SALON.postalCode,
      addressCountry: "PL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SALON.latitude,
      longitude: SALON.longitude,
    },
    hasMap: SALON.mapsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SALON.rating,
      reviewCount: SALON.reviewCount,
      bestRating: 5,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Bezpłatny parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Zaprzyjaźniony z psami", value: true },
      { "@type": "LocationFeatureSpecification", name: "Dostęp dla niepełnosprawnych", value: true },
    ],
    makesOffer: CATEGORIES.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name, areaServed: "Gdańsk" },
    })),
    employee: {
      "@type": "Person",
      name: STAFF.iryna.name,
      jobTitle: STAFF.iryna.role,
    },
  };
}

export function faqJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
