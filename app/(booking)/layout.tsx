import { getCustomer } from "@/lib/account/session";
import { AccountPrefill } from "@/components/booking/account-prefill";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { LocaleBoot } from "@/components/locale-boot";
import { presentSettings } from "@/lib/cms/present";
import { phoneHref } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";
import { getRequestLocale } from "@/lib/request-locale";

export const dynamic = "force-dynamic";

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const loaded = await getSalonContent();
  const content = { ...loaded, settings: presentSettings(loaded.settings, locale) };
  const customer = await getCustomer();
  const tel = phoneHref(content.settings.phone);
  return (
    <>
      <LocaleBoot locale={locale} />
      <SiteHeader
        noticeEnabled={content.settings.noticeEnabled}
        noticeText={content.settings.noticeText}
        phoneDisplay={content.settings.phone}
        phoneHref={tel}
        accountHref={customer ? "/konto" : "/konto/logowanie"}
        accountLabel={customer ? customer.name : "Konto"}
      />
      <AccountPrefill profile={customer} />
      <main className="pb-24 md:pb-0">{children}</main>
      <Footer hours={content.settings.openingHours} phoneDisplay={content.settings.phone} phoneHref={tel} rating={content.settings.googleRating} reviewCount={content.settings.googleReviewCount} />
      <MobileBar phoneHref={tel} />
    </>
  );
}
