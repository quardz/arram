import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" />
      <article className="prose-asm mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p>
          The personal details which we collect through this website will not be
          distributed, shared, rented or given to other companies or
          organisations.
        </p>
        <p>
          The details collected through this website pertaining to you will be
          shared with you at any point of time based on your request by email or
          in writing. We will make sure that all your personal information is held
          safely, as per the Data Protection Act.
        </p>
        <p>
          We make no attempt to link the addresses with the identity of
          individuals visiting our site, unless an attempt to damage the site has
          been detected.
        </p>
        <p>
          Aram Valartha Naayaki Sevai Maiyam is also committed to protecting the
          privacy of its donors, supporters, employees, registered members and
          other stakeholders.
        </p>
      </article>
    </>
  );
}
