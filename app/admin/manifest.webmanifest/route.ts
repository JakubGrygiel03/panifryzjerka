import { NextResponse } from "next/server";

const manifest = {
  id: "/admin",
  name: "Terminarz PaniFryzjerka",
  short_name: "Terminarz",
  description: "Kto jest umówiony i na jaką usługę.",
  start_url: "/admin/kalendarz",
  scope: "/admin",
  display: "standalone",
  background_color: "#FDF2F7",
  theme_color: "#C02674",
  lang: "pl",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
};

export function GET() {
  return NextResponse.json(manifest, {
    headers: { "content-type": "application/manifest+json" },
  });
}
