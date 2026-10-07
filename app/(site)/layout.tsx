import { getCustomer } from "@/lib/account/session";
import { AccountPrefill } from "@/components/booking/account-prefill";
import { BookingDrawer } from "@/components/booking/booking-drawer";
import { CookieNote } from "@/components/layout/cookie-note";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { getLengthGuide, phoneHref } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSalonContent();
  const customer = await getCustomer();
  const tel = phoneHref(content.settings.phone);

  return (
    <>
      <SkipLink />
      <SiteHeader
        noticeEnabled={content.settings.noticeEnabled}
        noticeText={content.settings.noticeText}
        phoneDisplay={content.settings.phone}
        phoneHref={tel}
        accountHref={customer ? "/konto" : "/konto/logowanie"}
        accountLabel={customer ? customer.name : "Konto"}
      />
      <AccountPrefill profile={customer} />
      <main id="tresc" className="pb-24 md:pb-0">{children}</main>
      <Footer hours={content.settings.openingHours} phoneDisplay={content.settings.phone} phoneHref={tel} rating={content.settings.googleRating} reviewCount={content.settings.googleReviewCount} />
      <MobileBar phoneHref={tel} />
      <CookieNote />
      <BookingDrawer services={content.services} lengthGuide={getLengthGuide()} />
    </>
  );
}
