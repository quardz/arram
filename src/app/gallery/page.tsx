import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from our programs, festivals and community work.",
};

function getGalleryImages() {
  const dir = path.join(process.cwd(), "public", "images", "gallery");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/images/gallery/${f}`);
  } catch {
    return [];
  }
}

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Moments from our programs, festivals and community work."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {images.length === 0 ? (
          <p className="text-center text-stone-600">
            Photos will be added here soon.
          </p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {images.map((src, i) => (
              <div
                key={src}
                className="mb-4 break-inside-avoid overflow-hidden rounded-lg shadow-sm ring-1 ring-stone-100"
              >
                <Image
                  src={src}
                  alt={`Gallery photo ${i + 1}`}
                  width={500}
                  height={500}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-auto w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
