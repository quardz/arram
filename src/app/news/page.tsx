import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { news } from "@/content/news";

export const metadata: Metadata = {
  title: "News & Updates",
  description: "Latest news, events and updates from Aram Valartha Naayaki Sevai Maiyam.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  return (
    <>
      <PageHeader
        title="News & Updates"
        subtitle="The latest from our programs, festivals and community work."
        breadcrumb="News"
      />

      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        {news.length === 0 ? (
          <p className="text-center text-stone-600">No updates yet — check back soon.</p>
        ) : (
          <div className="space-y-10">
            {news.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="group grid gap-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-100 transition hover:shadow-lg sm:grid-cols-[260px_1fr]"
              >
                {item.image && (
                  <div className="relative aspect-[4/3] sm:aspect-auto">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 260px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
                    {formatDate(item.date)}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-maroon group-hover:underline">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {item.excerpt}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-saffron">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
