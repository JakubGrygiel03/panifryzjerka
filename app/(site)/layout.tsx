import { BookingDrawer } from "@/components/booking/booking-drawer";
import { CookieNote } from "@/components/layout/cookie-note";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSalonContent();

  return (
    <>
      <SkipLink />
      <SiteHeader noticeEnabled={content.settings.noticeEnabled} noticeText={content.settings.noticeText} />
      <main id="tresc" className="pb-24 md:pb-0">{children}</main>
      <Footer hours={content.settings.openingHours} />
      <MobileBar />
      <CookieNote />
      <BookingDrawer services={content.services} />
    </>
  );
}
