import { useState } from "react";
import {
  Scissors, Phone, MapPin, Clock, Instagram, Facebook,
  Menu, X, Star, Wifi, ParkingCircle, Accessibility, Dog,
  ChevronRight, CalendarCheck, Sparkles,
} from "lucide-react";

// ── Palette shortcuts ───────────────────────────────────────────────
const M = "#E91E8C";       // magenta primary
const MH = "#C4176F";      // magenta hover (darker on light bg)
const CARD = "#FFFFFF";
const CARD2 = "#F7F0F5";
const BORDER = "rgba(26,16,32,0.09)";
const MUTED = "#8B6E82";

// ── Data ────────────────────────────────────────────────────────────
const PRICE_TABS = [
  {
    label: "Fryzjerstwo",
    emoji: "✂️",
    items: [
      { name: "Strzyżenie damskie + mycie + modelowanie", price: "120–150 zł" },
      { name: "Strzyżenie damskie + mycie", price: "100 zł" },
      { name: "Strzyżenie męskie", price: "100 zł" },
      { name: "Strzyżenie dziecięce (do 12 lat)", price: "50 zł" },
      { name: "Czesanie ślubne / okolicznościowe", price: "150 zł" },
      { name: "Grzywka", price: "30 zł" },
    ],
  },
  {
    label: "Koloryzacja",
    emoji: "🎨",
    items: [
      { name: "Farbowanie odrostów", price: "od 130 zł" },
      { name: "Farbowanie całości (krótkie)", price: "180 zł" },
      { name: "Farbowanie całości (długie)", price: "230 zł" },
      { name: "Balayage / Ombre", price: "od 350 zł" },
      { name: "Airtouch", price: "od 750 zł" },
      { name: "Szycie Siwizny #szycieSiwizny", price: "od 1 100 zł", highlight: true },
    ],
  },
  {
    label: "Doczepianie & Dredy",
    emoji: "🪢",
    items: [
      { name: "Afroloki (kompleksowe)", price: "od 360 zł" },
      { name: "Przedłużanie krok po kroku", price: "od 250 zł" },
      { name: "De-dredy (rozplatanie)", price: "170–350 zł" },
      { name: "Dredy syntetyczne (komplet)", price: "od 400 zł" },
      { name: "Cornrowy", price: "od 120 zł" },
    ],
  },
  {
    label: "Paznokcie",
    emoji: "💅",
    items: [
      { name: "Manicure hybrydowy", price: "120 zł" },
      { name: "Przedłużanie paznokci (żel)", price: "160 zł" },
      { name: "Pedicure hybrydowy", price: "140 zł" },
      { name: "Usunięcie hybrydy", price: "40 zł" },
      { name: "Zdobienie (nail art)", price: "od 10 zł/paznokieć" },
    ],
  },
  {
    label: "Rzęsy & Henna",
    emoji: "👁️",
    items: [
      { name: "Rzęsy Volume (objętościowe)", price: "150 zł" },
      { name: "Rzęsy Classic", price: "120 zł" },
      { name: "Uzupełnienie rzęs", price: "od 80 zł" },
      { name: "Henna brwi + rzęs (komplet)", price: "80 zł" },
      { name: "Regulacja brwi (nić / pęseta)", price: "30 zł" },
    ],
  },
];

const REVIEWS = [
  {
    name: "Karolina W.",
    stars: 5,
    text: "Pani Iryna to absolutna mistrzyni! Szycie Siwizny zrobiła perfekcyjnie — przyjaciółki myślą, że to mój naturalny kolor. Salon pełen ciepła, a Bella — pies salonu — spała obok fotela 🐾",
    service: "Szycie Siwizny",
    date: "styczeń 2025",
  },
  {
    name: "Marta K.",
    stars: 5,
    text: "Afroloki zrobione z niesamowitą dokładnością i cierpliwością. Atmosfera jak u przyjaciółki — muzyka, kawka i Bella śpiąca pod fotelem. Wrócę na pewno!",
    service: "Afroloki",
    date: "luty 2025",
  },
  {
    name: "Анастасія П.",
    stars: 5,
    text: "Ірина справжній майстер — airtouch вийшов фантастично. Тепла та домашня атмосфера, все пояснює по-українськи. Рекомендую всім!",
    service: "Airtouch",
    date: "marzec 2025",
  },
  {
    name: "Agnieszka T.",
    stars: 5,
    text: "Byłam tu z córeczką na strzyżeniu dziecięcym. Pani Iryna zrobiła przepiękną fryzurę bez jednej łzy, a pies Bella leżał spokojnie obok.",
    service: "Strzyżenie dziecięce",
    date: "kwiecień 2025",
  },
];

const AMENITIES = [
  { icon: ParkingCircle, label: "Bezpłatny parking", sub: "tuż przy salonie" },
  { icon: Dog, label: "Pet Friendly 🐾", sub: "Poznaj Bellę!" },
  { icon: Wifi, label: "Wi-Fi", sub: "szybkie łącze" },
  { icon: Accessibility, label: "Dostęp dla niepełnosprawnych", sub: "podjazd i winda" },
];

// ── Component ────────────────────────────────────────────────────────
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [lang, setLang] = useState<"PL" | "RU">("PL");

  return (
    <div
      className="min-h-screen bg-[#FDF9FB] text-[#1A1020] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ────────────────── NAV ────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FDF9FB]/90 backdrop-blur-xl border-b"
        style={{ borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-auto py-3 flex flex-wrap md:flex-nowrap items-center gap-3 justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)` }}>
              <Scissors size={13} className="text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}>
              Pani<span style={{ color: M }}>Fryzjerka</span>
            </span>
          </a>

          {/* Center info — hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 text-xs" style={{ color: MUTED }}>
            <span className="flex items-center gap-1">
              <MapPin size={11} style={{ color: M }} />
              Gdańsk, ul. Skarpowa 24
            </span>
            <span className="w-px h-3 bg-white/10" />
            <a href="tel:880606454" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={11} style={{ color: M }} /> 880-606-454
            </a>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Lang badge */}
            <div className="flex rounded-full overflow-hidden border text-xs font-medium"
              style={{ borderColor: BORDER }}>
              {(["PL", "RU"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="px-2.5 py-1 transition-colors"
                  style={{ background: lang === l ? M : "transparent", color: lang === l ? "#fff" : MUTED }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1E1829] rounded-full px-3 py-1.5 text-xs"
              style={{ border: `1px solid ${BORDER}` }}>
              <Star size={11} fill={M} style={{ color: M }} />
              <span className="font-semibold">4.9</span>
              <span style={{ color: MUTED }}>(194+ opinii)</span>
            </div>

            {/* Booksy CTA */}
            <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)`, color: "#fff" }}>
              <CalendarCheck size={13} />
              Zarezerwuj w Booksy
            </a>

            {/* Hamburger */}
            <button className="md:hidden p-1.5 rounded-lg" style={{ background: CARD }}
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden px-5 py-6 flex flex-col gap-5 border-t" style={{ background: CARD, borderColor: BORDER }}>
            <a href="tel:880606454" className="flex items-center gap-2 text-sm" onClick={() => setMobileOpen(false)}>
              <Phone size={15} style={{ color: M }} /> 880-606-454
            </a>
            <a href="#cennik" className="text-sm" onClick={() => setMobileOpen(false)}>Cennik</a>
            <a href="#opinie" className="text-sm" onClick={() => setMobileOpen(false)}>Opinie</a>
            <a href="#kontakt" className="text-sm" onClick={() => setMobileOpen(false)}>Kontakt</a>
            <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)` }}>
              <CalendarCheck size={16} /> Zarezerwuj w Booksy
            </a>
          </div>
        )}
      </header>

      {/* ────────────────── HERO ────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-5">
        {/* Background image with overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1400&h=900&fit=crop&auto=format"
            alt="Salon Pani Fryzjerka — Gdańsk"
            className="w-full h-full object-cover object-top opacity-10"
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #FDF9FB 40%, rgba(233,30,140,0.04) 100%)" }} />
          {/* Glow orb */}
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-10 pointer-events-none"
            style={{ background: M }} />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium mb-6"
              style={{ background: "rgba(233,30,140,0.12)", border: `1px solid rgba(233,30,140,0.3)`, color: MH }}>
              <Sparkles size={12} />
              Salon Beauty w Gdańsku · ul. Skarpowa 24
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.1] mb-5"
              style={{ fontFamily: "'Fraunces', serif" }}>
              Twój Rodzinny<br />
              <em className="not-italic" style={{ color: M }}>Salon Beauty</em><br />
              w Gdańsku
            </h1>

            <p className="text-base sm:text-lg leading-relaxed mb-3 max-w-xl" style={{ color: "#5C4460" }}>
              Mistrzowska koloryzacja,{" "}
              <span className="font-semibold" style={{ color: M }}>#szycieSiwizny</span>
              , afroloki, stylizacja paznokci i rzęs — w wyjątkowo ciepłej atmosferze.
            </p>
            <p className="text-sm mb-10" style={{ color: MUTED }}>
              🐾 Zaprzyjaźniony z psami · 🅿️ Bezpłatny parking · ♿ Dostęp dla niepełnosprawnych
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)`, color: "#fff", boxShadow: `0 8px 32px rgba(233,30,140,0.4)` }}>
                <CalendarCheck size={16} />
                Zarezerwuj Wizytę Online
              </a>
              <a href="tel:880606454"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-white/10 border"
                style={{ border: `1px solid ${BORDER}`, background: CARD }}>
                <Phone size={15} style={{ color: M }} />
                Zadzwoń: 880-606-454
              </a>
            </div>
          </div>

          {/* Rating card — desktop */}
          <div className="hidden lg:flex flex-col gap-4 items-center">
            <div className="rounded-3xl p-7 text-center w-52"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex justify-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={M} style={{ color: M }} />
                ))}
              </div>
              <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>4.9</p>
              <p className="text-xs" style={{ color: MUTED }}>194+ opinii Google</p>
              <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: BORDER, color: "#5C4460" }}>
                Pani Iryna czeka na Ciebie,<br />a pies Bella też 🐾
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── PROMO BANNER ────────────────── */}
      <section className="py-12 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Promo 1 */}
            <div className="rounded-2xl p-6 flex items-center gap-5"
              style={{ background: "linear-gradient(135deg, rgba(233,30,140,0.15), rgba(155,30,106,0.08))", border: "1px solid rgba(233,30,140,0.2)" }}>
              <div className="text-4xl">👔</div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: M }}>Każdy czwartek</p>
                <p className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Męski Czwartek</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Strzyżenie męskie tylko <span className="font-bold text-white">70 zł</span></p>
              </div>
            </div>
            {/* Promo 2 */}
            <div className="rounded-2xl p-6 flex items-center gap-5"
              style={{ background: "linear-gradient(135deg, rgba(255,63,164,0.1), rgba(233,30,140,0.06))", border: "1px solid rgba(233,30,140,0.15)" }}>
              <div className="text-4xl">👨‍👩‍👧</div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: M }}>Każda środa</p>
                <p className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Rodzinna Środa</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Zniżka <span className="font-bold text-white">−20%</span> dla całej rodziny</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES.map((a) => (
              <div key={a.label} className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(233,30,140,0.12)" }}>
                  <a.icon size={16} style={{ color: M }} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{a.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── PRICING TABS ────────────────── */}
      <section id="cennik" className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: M }}>Cennik</p>
            <h2 className="text-3xl sm:text-4xl font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
              Przejrzyste ceny,<br />
              <em className="not-italic" style={{ color: M }}>zero niespodzianek</em>
            </h2>
          </div>

          {/* Tab row — scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}>
            {PRICE_TABS.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
                style={activeTab === i
                  ? { background: M, color: "#fff", boxShadow: `0 4px 20px rgba(233,30,140,0.4)` }
                  : { background: CARD, color: MUTED, border: `1px solid ${BORDER}` }}>
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Price rows */}
          <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            {PRICE_TABS[activeTab].items.map((item, i) => (
              <div key={item.name}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: i < PRICE_TABS[activeTab].items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div className="flex items-center gap-2">
                  {item.highlight && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(233,30,140,0.2)", color: M }}>
                      ✦ Premium
                    </span>
                  )}
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums shrink-0 ml-4" style={{ color: M }}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: MUTED }}>
            * Ceny mogą się różnić w zależności od długości i gęstości włosów. Bezpłatna konsultacja przed każdą usługą.
          </p>
          <div className="mt-6">
            <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)`, boxShadow: `0 4px 24px rgba(233,30,140,0.3)` }}>
              <CalendarCheck size={15} />
              Zarezerwuj online w Booksy
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────── GALLERY STRIP ────────────────── */}
      <section className="py-8 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3 rounded-3xl overflow-hidden">
          <div className="aspect-[3/4] bg-[#F0E8EE] overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1616166183781-0fdd2ef83374?w=400&h=550&fit=crop&auto=format"
              alt="Afroloki — Pani Fryzjerka Gdańsk"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-[3/4] bg-[#1E1829] overflow-hidden rounded-2xl col-span-1 mt-8">
            <img src="https://images.unsplash.com/photo-1636302925868-52075f44d810?w=400&h=550&fit=crop&auto=format"
              alt="Stylizacja włosów — Pani Fryzjerka"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-[3/4] bg-[#F0E8EE] overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=400&h=550&fit=crop&auto=format"
              alt="Manicure hybrydowy — Pani Fryzjerka"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* ────────────────── TESTIMONIALS ────────────────── */}
      <section id="opinie" className="py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: M }}>Opinie</p>
              <h2 className="text-3xl sm:text-4xl font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                Klientki mówią<br />
                <em className="not-italic" style={{ color: M }}>same za siebie</em>
              </h2>
            </div>
            {/* Big rating widget */}
            <div className="flex items-center gap-4 rounded-2xl px-6 py-4 shrink-0"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div>
                <p className="text-4xl font-bold" style={{ fontFamily: "'Fraunces', serif", color: M }}>4.9</p>
                <div className="flex gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={M} style={{ color: M }} />)}
                </div>
                <p className="text-xs" style={{ color: MUTED }}>194+ opinii Google</p>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div>
                <div className="flex flex-col gap-1">
                  {[5, 4, 3].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs w-2" style={{ color: MUTED }}>{stars}</span>
                      <div className="h-1.5 rounded-full overflow-hidden w-20" style={{ background: CARD2 }}>
                        <div className="h-full rounded-full"
                          style={{ width: stars === 5 ? "92%" : stars === 4 ? "6%" : "2%", background: M }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex gap-0.5">
                  {[...Array(r.stars)].map((_, i) => <Star key={i} size={12} fill={M} style={{ color: M }} />)}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#4A3355" }}>"{r.text}"</p>
                <div className="pt-3 border-t" style={{ borderColor: BORDER }}>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs" style={{ color: M }}>{r.service}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{r.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CONTACT + MAP ────────────────── */}
      <section id="kontakt" className="py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden grid lg:grid-cols-[1fr_1.2fr]"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}>

            {/* Info panel */}
            <div className="p-8 lg:p-10 flex flex-col gap-8">
              <div>
                <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: M }}>Kontakt</p>
                <h2 className="text-3xl font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  Znajdź nas<br />w Gdańsku
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(233,30,140,0.12)" }}>
                    <MapPin size={18} style={{ color: M }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: MUTED }}>Adres</p>
                    <p className="text-sm leading-relaxed">ul. Skarpowa 24<br />80-215 Gdańsk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(233,30,140,0.12)" }}>
                    <Phone size={18} style={{ color: M }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: MUTED }}>Telefon</p>
                    <a href="tel:880606454" className="text-sm hover:underline" style={{ color: MH }}>
                      880-606-454
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(233,30,140,0.12)" }}>
                    <Clock size={18} style={{ color: M }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: MUTED }}>Godziny otwarcia</p>
                    <div className="text-sm space-y-1">
                      {[
                        ["Poniedziałek – Piątek", "9:00–20:00"],
                        ["Sobota", "9:00–18:00"],
                        ["Niedziela", "Nieczynne"],
                      ].map(([day, hours]) => (
                        <div key={day} className="flex justify-between gap-8">
                          <span style={{ color: MUTED }}>{day}</span>
                          <span className={hours === "Nieczynne" ? "" : "font-medium"}
                            style={{ color: hours === "Nieczynne" ? MUTED : "#1A1020" }}>
                            {hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)`, boxShadow: `0 4px 20px rgba(233,30,140,0.35)` }}>
                  <CalendarCheck size={15} /> Zarezerwuj w Booksy
                </a>
                <a href="tel:880606454"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border"
                  style={{ border: `1px solid rgba(233,30,140,0.3)`, color: M }}>
                  <Phone size={15} /> Zadzwoń
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative min-h-72 lg:min-h-0 bg-[#F7F0F5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=600&fit=crop&auto=format"
                alt="Wnętrze salonu Pani Fryzjerka"
                className="w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ background: "linear-gradient(135deg, rgba(247,240,245,0.85), rgba(233,30,140,0.04))" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)`, boxShadow: `0 0 40px rgba(233,30,140,0.5)` }}>
                  <MapPin size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-[#1A1020]">ul. Skarpowa 24, Gdańsk</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>80-215 Gdańsk, Polska</p>
                </div>
                <a href="https://maps.google.com/?q=ul.+Skarpowa+24,+Gdańsk" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all hover:opacity-80"
                  style={{ border: `1px solid rgba(233,30,140,0.4)`, color: M, background: "rgba(233,30,140,0.08)" }}>
                  Otwórz w Mapach <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="border-t py-10 px-5 bg-[#FDF9FB]" style={{ borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)` }}>
              <Scissors size={11} className="text-white" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
              Pani<span style={{ color: M }}>Fryzjerka</span>
            </span>
          </div>

          <div className="text-center">
            <p className="text-xs text-[#1A1020]/60">
              © 2025 Pani Fryzjerka · ul. Skarpowa 24, Gdańsk · Tel: 880-606-454
            </p>
            <p className="text-xs mt-1 text-[#1A1020]/40">
              Wszystkie prawa zastrzeżone 🐾 z miłością od Belli
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://instagram.com/panifryzjerka" target="_blank" rel="noopener noreferrer"
              aria-label="Instagram @panifryzjerka"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(233,30,140,0.12)", border: `1px solid rgba(233,30,140,0.2)` }}>
              <Instagram size={16} style={{ color: M }} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(233,30,140,0.12)", border: `1px solid rgba(233,30,140,0.2)` }}>
              <Facebook size={16} style={{ color: M }} />
            </a>
            <a href="https://panifryzjerka.booksy.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${M}, #9B1E6A)` }}>
              <CalendarCheck size={13} /> Booksy
            </a>
          </div>
        </div>
      </footer>

      {/* Global scrollbar hide */}
      <style>{`* { scrollbar-width: none; } *::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
