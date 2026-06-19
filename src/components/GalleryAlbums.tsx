"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { AlbumGroup } from "@/content/gallery";

type Open = { images: string[]; title: string; index: number } | null;

export default function GalleryAlbums({ groups }: { groups: AlbumGroup[] }) {
  const [open, setOpen] = useState<Open>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((o) =>
        o
          ? { ...o, index: (o.index + dir + o.images.length) % o.images.length }
          : o,
      ),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      {groups.map((group) => (
        <div key={group.title} className="mb-16">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="font-display text-2xl text-maroon sm:text-3xl">
              {group.title}
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {group.albums.map((album) => (
              <button
                key={album.slug}
                onClick={() =>
                  setOpen({ images: album.images, title: album.title, index: 0 })
                }
                className="group text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-gold/15">
                  <Image
                    src={album.images[0]}
                    alt={album.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 via-maroon/10 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                    {album.images.length} photo{album.images.length > 1 ? "s" : ""}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-xl text-white drop-shadow">
                      {album.title}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-saffron-light">
                      View Album
                      <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-maroon"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={open.images[open.index]}
                alt={`${open.title} ${open.index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-white">
              <span className="font-display text-lg text-saffron-light">
                {open.title}
              </span>
              <span className="text-sm text-white/70">
                {open.index + 1} of {open.images.length}
              </span>
            </div>

            {open.images.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:bg-saffron hover:text-maroon sm:-left-16"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  aria-label="Next"
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:bg-saffron hover:text-maroon sm:-right-16"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
