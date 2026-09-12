import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Family Welfare Homam",
  description:
    "Free monthly homams across every Chennai Corporation zone. Prayaschitta homams are organised based on horoscopes cast by experienced astrologers for registered families.",
};

export default function HomamPage() {
  return (
    <>
      <PageHeader
        title="Family Welfare Homam"
        subtitle="Vedic solutions for the stresses of modern urban life — free homams for families across Chennai."
        breadcrumb="Family Welfare Homam"
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p>
          More than 68% of Chennai&rsquo;s population has migrated from the
          semi-urban and rural areas of Tamil Nadu. Many are forced to live in
          the new environment as individuals on their own. In due course they
          form nuclear families, cut off from their traditional bonds and roots.
          With the breakdown of the joint family system, they are often
          overwhelmed by financial, cultural and family challenges. Stress,
          alcoholism, anger and depression have become an integral part of this
          new generation&rsquo;s lifestyle.
        </p>
        <p>
          A recent study found that in Chennai, those who committed suicide had
          often lost belief in god, kept aloof from religious ceremonies and
          festivals, and rarely visited places of worship. In almost all cases
          the lack of religious faith was a deciding factor. Our Vedic Rishis
          gave us solutions to such problems in the form of Homams or Yagnas.
        </p>

        <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-xl shadow">
          <Image
            src="/images/homam/2-1-scaled.jpg"
            alt="Family Welfare Homam"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <h2 className="text-2xl font-semibold text-maroon">What We Do</h2>
        <ul>
          <li>
            ASM organises a free Homam every month in each Chennai Corporation
            zone.
          </li>
          <li>
            Based on details shared by registered participants, their horoscopes
            are cast by experienced astrologers, and prayaschitta homams are
            organised accordingly.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-maroon">Our Reach So Far</h2>
        <ul>
          <li>We have conducted 356 Homams across the Chennai Corporation.</li>
          <li>
            A total of 22,126 people have benefitted through the Family Welfare
            Homam.
          </li>
        </ul>

        <div className="not-prose mt-10">
          <Link
            href="/contact?subject=Homam%20Registration"
            className="inline-block rounded-md bg-maroon px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-maroon-600"
          >
            Homam Registration
          </Link>
        </div>
      </article>
    </>
  );
}
