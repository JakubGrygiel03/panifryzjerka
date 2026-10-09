import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SALON } from "@/lib/brand";
import { hairSalonJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

const searchTitle = `PaniFryzjerka ★ ${SALON.rating} — fryzjer Gdańsk, Skarpowa`;
const searchDescription = `★ ${SALON.rating} · ponad ${SALON.reviewCount} opinii Google. Rodzinny salon przy ul. Skarpowej 24: koloryzacja, szycie siwizny i afroloki. Parking przy budynku, psy mile widziane.`;

export const metadata: Metadata = {
  metadataBase: new URL(SALON.siteUrl),
  title: {
    default: searchTitle,
    template: "%s · PaniFryzjerka",
  },
  description: searchDescription,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-pani-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-pani-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icon-pani-192.png", sizes: "192x192" }],
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: searchTitle,
    description: searchDescription,
    locale: "pl_PL",
    type: "website",
    url: SALON.siteUrl,
    images: [{ url: "/icon-pani-512.png", width: 512, height: 512, alt: "PaniFryzjerka" }],
  },
  robots: { index: true, follow: true },
  applicationName: "PaniFryzjerka",
  appleWebApp: { capable: true, title: "PaniFryzjerka", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#C02674",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hairSalonJsonLd()) }} />
        {children}
      </body>
    </html>
  );
}
