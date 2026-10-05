"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/10">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q} className="border-b border-ink/10 last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-ink transition-colors duration-200 hover:bg-blush"
            >
              <span>{item.q}</span>
              <ChevronDown
                size={18}
                aria-hidden
                className={`shrink-0 text-ink transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-base leading-7 text-ink">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
