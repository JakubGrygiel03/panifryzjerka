import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaniFryzjerka",
    short_name: "PaniFryzjerka",
    description: "Rezerwacja wizyty w salonie PaniFryzjerka, Gdańsk, ul. Skarpowa 24.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF2F7",
    theme_color: "#C02674",
    lang: "pl",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
