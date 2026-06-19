"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  src: string;
  alt: string;
};

export default function HeroCarousel({
  slides,
  interval = 6000,
  children,
}: {
  slides: Slide[];
  interval?: number;
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      interval,
    );
  }, [interval, slides.length]);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [start]);

  return (
    <section
      className="relative isolate flex min-h-[88vh] items-center overflow-hidden"
      onMouseEnter={() => timer.current && clearInterval(timer.current)}
      onMouseLeave={start}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="scale-105 object-cover"
            style={{
              animation: i === index ? "kenburns 7s ease-out forwards" : "none",
            }}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-maroon/90 via-maroon/65 to-maroon/20" />

      {/* Overlay content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-24 lg:px-8">{children}</div>

      {/* Prev / Next */}
      <button
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 p-3 text-white backdrop-blur transition hover:bg-saffron hover:text-maroon sm:flex"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 p-3 text-white backdrop-blur transition hover:bg-saffron hover:text-maroon sm:flex"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dot pager */}
      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.src}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 bg-saffron"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
