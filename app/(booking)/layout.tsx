import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  const content = await getSalonContent();
  return (
    <>
      <SiteHeader noticeEnabled={content.settings.noticeEnabled} noticeText={content.settings.noticeText} />
      <main className="pb-24 md:pb-0">{children}</main>
      <Footer hours={content.settings.openingHours} />
      <MobileBar />
    </>
  );
}
