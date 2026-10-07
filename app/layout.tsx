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

export const metadata: Metadata = {
  metadataBase: new URL(SALON.siteUrl),
  title: {
    default: "PaniFryzjerka — salon beauty Gdańsk, ul. Skarpowa 24",
    template: "%s · PaniFryzjerka",
  },
  description:
    "Rodzinny salon fryzjerski w Gdańsku przy ul. Skarpowej 24. Koloryzacja, #szycieSiwizny i afroloki. Parking, psy i dostęp dla niepełnosprawnych. Ocena 4.9.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PaniFryzjerka — salon beauty w Gdańsku",
    description: "Koloryzacja, #szycieSiwizny i rezerwacja online bez prowizji. ul. Skarpowa 24, Gdańsk.",
    locale: "pl_PL",
    type: "website",
    url: SALON.siteUrl,
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
