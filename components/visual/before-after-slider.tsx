"use client";

import { useRef, useState } from "react";
import Image from "next/image";

function Photo({ src, alt, split, side }: { src: string; alt: string; split: boolean; side?: "left" | "right" }) {
  const sizes = split ? "(min-width: 1280px) 50vw, 100vw" : "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw";
  if (!split) {
    return <Image src={src} alt={alt} fill sizes={sizes} quality={60} className="object-cover" draggable={false} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={1600}
      sizes={sizes}
      quality={60}
      draggable={false}
      className="absolute top-0 h-full max-w-none object-cover"
      style={side === "right" ? { width: "200%", left: "-100%" } : { width: "200%", left: 0 }}
    />
  );
}

export function BeforeAfterSlider({
  before,
  after,
  title,
  split = false,
  beforeSide = "right",
}: {
  before: string;
  after: string;
  title: string;
  split?: boolean;
  beforeSide?: "left" | "right";
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(52);
  const afterSide = beforeSide === "left" ? "right" : "left";

  function move(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(94, Math.max(6, next)));
  }

  return (
    <figure className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/10">
      <div
        ref={frame}
        className="relative aspect-square cursor-ew-resize touch-none overflow-hidden bg-white select-none"
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
        <Photo src={after} alt={`${title} — po`} split={split} side={split ? afterSide : undefined} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Photo src={before} alt={`${title} — przed`} split={split} side={split ? beforeSide : undefined} />
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
      <figcaption className="px-4 py-4">
        <p className="font-display text-2xl text-ink">{title}</p>
      </figcaption>
    </figure>
  );
}
