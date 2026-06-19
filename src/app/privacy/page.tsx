import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" breadcrumb="Privacy" />
      <article className="prose-asm mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p>
          This page is a placeholder for the Privacy Policy of Aram Valartha
          Naayaki Sevai Maiyam. Please replace this content with your
          organisation&rsquo;s official privacy policy before going live.
        </p>
      </article>
    </>
  );
}
