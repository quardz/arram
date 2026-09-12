import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import GalleryAlbums from "@/components/GalleryAlbums";
import { Ornament } from "@/components/ui";
import { galleryGroups } from "@/content/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Our activities gallery — albums from festivals, homams, Kovil Maiyam programs and community work across Chennai.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Our Activities Gallery"
        subtitle="Moments from our festivals, programs and community work across Chennai."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <Ornament className="mb-12" />
        <GalleryAlbums groups={galleryGroups} />
      </section>
    </>
  );
}
