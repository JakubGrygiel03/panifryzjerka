"use client";

import { Star } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLocaleStore } from "@/store/use-locale-store";

export function ReviewsCard({ rating, reviewCount, reviewsUrl }: { rating: number; reviewCount: number; reviewsUrl: string }) {
  const copy = t(useLocaleStore((state) => state.locale));

  return (
    <a
      href={reviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-base font-semibold text-ink shadow-[0_16px_40px_-28px_rgba(31,26,36,0.8)] ring-1 ring-ink/8 transition-colors duration-200 hover:text-berry"
    >
      <span className="font-display text-3xl leading-none">{rating.toFixed(1)}</span>
      <span className="flex gap-0.5 text-gold" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} size={16} fill="currentColor" />
        ))}
      </span>
      <span>
        {reviewCount}+ {copy.reviews}
      </span>
    </a>
  );
}
