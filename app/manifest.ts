import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PaniFryzjerka",
    short_name: "PaniFryzjerka",
    description: "Rezerwacja wizyty w salonie PaniFryzjerka, Gdańsk, ul. Skarpowa 24.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF2F7",
    theme_color: "#C02674",
    lang: "pl",
    icons: [
      { src: "/icon-pani-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-pani-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
