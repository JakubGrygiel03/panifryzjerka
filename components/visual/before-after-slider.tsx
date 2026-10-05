"use client";

import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
  title,
  tag,
  split = false,
  beforeSide = "right",
}: {
  before: string;
  after: string;
  title: string;
  tag: string;
  split?: boolean;
  beforeSide?: "left" | "right";
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(52);

  function move(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(94, Math.max(6, next)));
  }

  const half = "absolute top-0 h-full max-w-none object-cover";
  const afterSide = beforeSide === "left" ? "right" : "left";

  function halfStyle(side: "left" | "right") {
    return side === "left" ? { width: "200%", left: 0 } : { width: "200%", left: "-100%" };
  }

  return (
    <figure className="min-w-0">
      <div
        ref={frame}
        className="relative aspect-square cursor-ew-resize touch-none overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_50px_-36px_rgba(31,26,36,0.7)] select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setPosition((value) => Math.max(6, value - 4));
          if (event.key === "ArrowRight") setPosition((value) => Math.min(94, value + 4));
        }}
        tabIndex={0}
        role="slider"
        aria-valuemin={6}
        aria-valuemax={94}
        aria-valuenow={Math.round(position)}
        aria-label={`${title}: porównanie przed i po`}
      >
        {split ? (
          <img src={after} alt={`${title} — po`} className={half} style={halfStyle(afterSide)} />
        ) : (
          <img src={after} alt={`${title} — po`} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          {split ? (
            <img src={before} alt={`${title} — przed`} className={half} style={halfStyle(beforeSide)} />
          ) : (
            <img src={before} alt={`${title} — przed`} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${position}%` }} />
        <div
          className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-semibold text-ink shadow"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          ↔
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">Przed</span>
        <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">Po</span>
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="text-base text-ink">{tag}</p>
      </figcaption>
    </figure>
  );
}
