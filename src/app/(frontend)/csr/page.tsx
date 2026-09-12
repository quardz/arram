import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CSRForm from "@/components/forms/CSRForm";

export const metadata: Metadata = {
  title: "CSR",
  description:
    "Partner with Aram Valartha Naayaki Sevai Maiyam, a non-profit charitable trust, for your Corporate Social Responsibility initiatives across Chennai.",
};

export default function CSRPage() {
  return (
    <>
      <PageHeader
        title="Corporate Social Responsibility"
        subtitle="Partner with us to create a positive, lasting impact on the communities of Chennai."
        breadcrumb="CSR"
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p>
          Corporate Social Responsibility (CSR) is a concept that suggests it is
          the responsibility of corporations operating within society to
          contribute towards economic, social and environmental development that
          creates a positive impact on society at large. The concept revolves
          around the idea that corporations need to focus beyond earning just
          profits.
        </p>
        <p>
          The Companies Act, 2013 is a landmark legislation that made India the
          first country to mandate and quantify CSR expenditure. Under Section 135,
          effective from 1 April 2014, every company — private or public — that has
          a net worth of ₹500 crore, a turnover of ₹1,000 crore, or a net profit
          of ₹5 crore must spend at least 2% of its average net profit of the
          preceding three financial years on CSR activities listed in Schedule VII
          of the Act.
        </p>

        <h2 className="text-2xl font-semibold text-maroon">Why Choose Us?</h2>
        <ul>
          <li>
            We, Aram Valartha Naayaki Sevai Maiyam (ASM), are a non-profit
            charitable trust established in Chennai in 2015 with the objective of
            upliftment of slum communities across the city.
          </li>
          <li>
            We are well connected with the slum communities of Chennai and are
            precisely aware of their problems.
          </li>
          <li>
            Through thousands of devoted volunteers, we have worked relentlessly
            on projects across Chennai covering education, cultural and heritage
            preservation, ecological preservation, health, and women empowerment.
          </li>
        </ul>
      </article>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-semibold text-maroon">
            CSR Enquiry
          </h2>
          <p className="mb-8 text-center text-sm text-stone-600">
            Tell us about your organisation and how you would like to partner with
            us.
          </p>
          <CSRForm />
        </div>
      </section>
    </>
  );
}
