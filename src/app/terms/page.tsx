import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" breadcrumb="Terms" />
      <article className="prose-asm mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p>
          This page is a placeholder for the Terms &amp; Conditions of Aram
          Valartha Naayaki Sevai Maiyam. Please replace this content with your
          organisation&rsquo;s official terms before going live.
        </p>
      </article>
    </>
  );
}
