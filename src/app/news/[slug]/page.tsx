import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { news } from "@/content/news";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = news.find((n) => n.slug === slug);
  if (!item) return { title: "News" };
  return { title: item.title, description: item.excerpt };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = news.find((n) => n.slug === slug);
  if (!item) notFound();

  return (
    <>
      <PageHeader title={item.title} breadcrumb="News" />
      <article className="prose-asm mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-saffron">
          {new Date(item.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {item.image && (
          <div className="relative my-6 aspect-[16/9] overflow-hidden rounded-xl shadow">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        {item.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="not-prose mt-10">
          <Link href="/news" className="text-sm font-semibold text-maroon hover:underline">
            ← Back to all news
          </Link>
        </div>
      </article>
    </>
  );
}
