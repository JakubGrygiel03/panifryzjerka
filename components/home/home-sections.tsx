import Image from "next/image";
import type { ReactNode } from "react";
import { Clock, Droplets, MapPin, Phone, Scissors, Sparkles } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { FaqList } from "@/components/home/faq-list";
import { PromoCards } from "@/components/home/promo-cards";
import { Team } from "@/components/home/team";
import { Techniques } from "@/components/home/techniques";
import { PriceList } from "@/components/pricing/price-list";
import { ComparisonGrid } from "@/components/visual/comparison-grid";
import { WorkGallery } from "@/components/visual/work-gallery";
import { SALON } from "@/lib/brand";
import { deviceToken } from "@/lib/cms/devices";
import type { HomeSection } from "@/lib/cms/section-types";
import { presentComparison, presentFaq, presentLengthGuide, presentReview, presentSection } from "@/lib/cms/present";
import { getFaqItems, getLengthGuide, phoneHref } from "@/lib/cms/store";
import type { Locale } from "@/lib/i18n";
import { ruPhrase } from "@/lib/i18n/phrases";
import { galleryPhotos } from "@/lib/cms/gallery";
import { AFTERCARE, PREP } from "@/lib/content/guides";
import type { SalonContent } from "@/lib/content/types";
import { getHeroSlides, getComparisons } from "@/lib/cms/showcase";
import { isSalonImagePath } from "@/lib/media/paths";

const PREP_ICONS = [Scissors, Sparkles, Clock, Droplets, Phone];
const CARE_ICONS = [Droplets, Sparkles, Clock, Scissors];

function Band({ tone, devices, className, children }: { tone: "paper" | "blush"; devices?: string; className?: string; children: ReactNode }) {
  return (
    <div data-devices={devices} className={`${tone === "paper" ? "bg-blush" : "bg-[#F8D5E6]"} ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function HomeSections({ sections, content, locale = "PL" }: { sections: HomeSection[]; content: SalonContent; locale?: Locale }) {
  const tel = phoneHref(content.settings.phone);
  const mensVariantId = content.services.find((service) => service.id === "strzyzenie-meskie")?.variants[0]?.id ?? "";
  const shown = sections.map((section) => presentSection(section, locale));
  const faq = getFaqItems().map((item) => presentFaq(item, locale));
  const lengthGuide = presentLengthGuide(getLengthGuide(), locale);
  const comparisons = getComparisons().map((item) => presentComparison(item, locale));
  const reviews = content.reviews.map((review) => presentReview(review, locale)).filter((review) => review.name.trim() && review.text.trim());
  let band = 0;

  return (
    <>
      {shown.filter((section) => section.enabled).map((section) => {
        const tone: "paper" | "blush" = section.type === "hero" ? "blush" : (++band % 2 === 0 ? "paper" : "blush");
        const devices = deviceToken(section.devices);
        if (section.type === "tekst" && !section.title.trim() && !section.body.trim()) return null;
        if (section.type === "hero") {
          return (
            <div key={section.id} data-devices={deviceToken(section.devices)}>
            <Hero
              rating={content.settings.googleRating}
              reviewCount={content.settings.googleReviewCount}
              reviewsUrl={content.settings.googleReviewsUrl}
              phoneDisplay={content.settings.phone}
              phoneHref={tel}
              title={section.title}
              lead={section.body}
              slides={getHeroSlides()}
            />
            </div>
          );
        }
        if (section.type === "promo") {
          return (
            <Band key={section.id} tone={tone} devices={devices} className="py-14 sm:py-16">
              <PromoCards mensVariantId={mensVariantId} />
            </Band>
          );
        }
        if (section.type === "cennik") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="cennik" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{section.title}</h2>
              <div className="mt-8">
                <PriceList services={content.services} compact lengthGuide={lengthGuide} />
              </div>
            </section>
            </Band>
          );
        }
        if (section.type === "metamorfozy") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="metamorfozy" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{section.title}</h2>
              {section.body ? <p className="mt-4 max-w-xl text-base leading-7 font-medium text-ink">{section.body}</p> : null}
              <div className="mt-8">
                <ComparisonGrid items={comparisons} />
              </div>
              <div className="mt-10">
                <WorkGallery photos={galleryPhotos()} />
              </div>
            </section>
            </Band>
          );
        }
        if (section.type === "zespol") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="o-nas" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">{section.title}</h2>
              <div className="mt-8">
                <Team members={content.team} locale={locale} />
              </div>
            </section>
            </Band>
          );
        }
        if (section.type === "zapis") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{section.title}</h2>
              <ol className="mt-8 grid gap-px overflow-hidden rounded-[1.75rem] bg-ink/8 md:grid-cols-3">
                {(locale === "RU"
                  ? [
                      ["01", "Услуга", "Выбираете процедуру и длину волос. От этого зависят цена и время."],
                      ["02", "Час", "Выбираете свободный час у пани Ирины."],
                      ["03", "Телефон", "Оставляете имя и номер. Аккаунт не нужен."],
                    ]
                  : [
                      ["01", "Usługa", "Wybierasz zabieg i długość włosów. Od tego zależy cena i czas."],
                      ["02", "Godzina", "Wybierasz wolną godzinę u Pani Iryny."],
                      ["03", "Telefon", "Podajesz imię i numer. Konto nie jest potrzebne."],
                    ]
                ).map(([n, title, text]) => (
                  <li key={n} className="bg-white p-7">
                    <p className="text-base font-semibold text-ink">{n}</p>
                    <h3 className="mt-3 font-display text-2xl text-ink">{title}</h3>
                    <p className="mt-2 text-base leading-7 text-ink">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
            </Band>
          );
        }
        if (section.type === "szycie") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="techniki" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className={`${section.eyebrow ? "mt-3 " : ""}font-display text-4xl tracking-tight text-ink`}>{section.title || "Techniki"}</h2>
              <div className="mt-8">
                <Techniques services={content.services} />
              </div>
            </section>
            </Band>
          );
        }
        if (section.type === "pielegnacja") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="poradnik" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">{section.title || "Przed wizytą i po zabiegu"}</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
              <article className="rounded-[1.75rem] bg-white p-8 ring-1 ring-ink/10">
                <h3 className="font-display text-3xl text-ink">{locale === "RU" ? "Перед визитом" : "Przed wizytą"}</h3>
                <ul className="mt-5 space-y-4">
                  {PREP.map((item, index) => {
                    const Icon = PREP_ICONS[index] ?? Sparkles;
                    return (
                      <li key={item.title} className="flex gap-3 text-base leading-7 text-ink">
                        <Icon size={18} className="mt-1 shrink-0 text-berry" aria-hidden />
                        <p>
                          <span className="font-semibold">{locale === "RU" ? ruPhrase(item.title) : item.title}.</span> {locale === "RU" ? ruPhrase(item.text) : item.text}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </article>
              <article className="rounded-[1.75rem] bg-white p-8 ring-1 ring-ink/10">
                <h3 className="font-display text-3xl text-ink">{locale === "RU" ? "После процедуры" : "Po zabiegu"}</h3>
                <ul className="mt-5 space-y-4">
                  {AFTERCARE.map((item, index) => {
                    const Icon = CARE_ICONS[index] ?? Sparkles;
                    return (
                      <li key={item.title} className="flex gap-3 text-base leading-7 text-ink">
                        <Icon size={18} className="mt-1 shrink-0 text-berry" aria-hidden />
                        <p>
                          <span className="font-semibold">{locale === "RU" ? ruPhrase(item.title) : item.title}.</span> {locale === "RU" ? ruPhrase(item.text) : item.text}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </article>
              </div>
            </section>
            </Band>
          );
        }
        if (section.type === "pytania") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section id="faq" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 sm:px-6">
              <h2 className="mb-6 font-display text-4xl tracking-tight">{section.title}</h2>
              <FaqList items={faq} searchable />
            </section>
            </Band>
          );
        }
        if (section.type === "opinie") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{section.title}</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <blockquote key={`${review.name}-${review.service}`} className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                        <GoogleMark />
                        Google
                      </span>
                      <span className="text-gold" aria-label="5 na 5">★★★★★</span>
                    </div>
                    <p className="mt-4 text-[15px] leading-7">{review.text}</p>
                    <footer className="mt-5 text-sm text-mauve">
                      {review.name}
                      <span className="text-ink"> · {review.service}</span>
                      <span className="mt-1 block text-xs text-ink">{locale === "RU" ? "Подтверждённый отзыв из Google Maps" : "Zweryfikowana opinia z Google Maps"}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
              <a href={content.settings.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="mx-auto mt-8 flex w-fit items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
                {locale === "RU" ? `Все ${content.settings.googleReviewCount}+ отзывов в Google Maps` : `Wszystkie ${content.settings.googleReviewCount}+ opinii w Google Maps`}
              </a>
            </section>
            </Band>
          );
        }
        if (section.type === "dojazd") {
          return (
            <Band key={section.id} tone={tone} devices={devices}>
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="flex flex-col gap-6 rounded-[1.75rem] bg-ink p-6 text-white sm:flex-row sm:items-stretch sm:p-8">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">{section.eyebrow}</p>
                  <h2 className="mt-3 font-display text-4xl">
                    {section.title || SALON.street}
                    <br />
                    {SALON.postalCode} {SALON.city}
                  </h2>
                  {section.body ? <p className="mt-3 max-w-md text-base leading-7 text-white">{section.body}</p> : null}
                </div>
                <a
                  href={SALON.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-44 w-full items-center justify-center rounded-[1.4rem] bg-white px-6 py-8 text-ink sm:w-72"
                >
                  <span className="grid grid-cols-[2.75rem_auto_2.75rem] items-center justify-center gap-x-2.5 gap-y-2">
                    <span className="flex size-11 items-center justify-center justify-self-end rounded-full bg-blush">
                      <MapPin size={22} className="text-berry" aria-hidden />
                    </span>
                    <span className="text-center font-display text-3xl leading-none">{locale === "RU" ? "Открыть" : "Otwórz"}</span>
                    <span className="size-11" aria-hidden />
                    <span className="col-span-3 text-center font-display text-3xl leading-none">Google Maps</span>
                  </span>
                </a>
              </div>
            </section>
            </Band>
          );
        }
        return (
          <Band key={section.id} tone={tone} devices={devices}>
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="rounded-[1.75rem] bg-white p-8 ring-1 ring-pink-100">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2 className="mt-3 font-display text-4xl text-ink">{section.title}</h2>
              {section.body ? <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-ink">{section.body}</p> : null}
              {isSalonImagePath(section.image) ? (
                <div className="relative mt-6 aspect-[4/3] max-w-xl overflow-hidden rounded-2xl">
                  <Image src={section.image} alt={section.title || "Zdjęcie salonu"} fill sizes="(min-width: 768px) 36rem, 100vw" quality={68} className="object-cover" />
                </div>
              ) : null}
            </div>
          </section>
          </Band>
        );
      })}
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.2l6.3 5.3C37.4 38.3 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
