import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" />
      <article className="prose-asm mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p>
          By using the pages in this site, you agree to these terms and
          conditions. These terms and conditions may be changed or updated from
          time to time.
        </p>
        <p>
          This website is owned and maintained by Aram Valartha Naayaki Sevai
          Maiyam. Unless otherwise indicated, all information contained in this
          website is copyrighted. You may not copy, frame, modify, transmit or
          distribute the material obtained from this website, in whole or in
          part, without the written consent of the copyright owner.
        </p>
        <p>
          You are welcome to link to this site, provided that in doing so you do
          not use the name of Aram Valartha Naayaki Sevai Maiyam, and their
          emblem, without permission.
        </p>
        <p>
          Use of the names and emblem of Aram Valartha Naayaki Sevai Maiyam by
          unauthorised persons, including their reproduction on other websites
          without appropriate authorisation, constitutes a criminal offence under
          the Emblems and Names (Prevention of Improper Use) Act, 1950, of the
          Government of India.
        </p>
        <p>
          You may not link to this site from a site, or in a manner, which
          disparages the reputation of Aram Valartha Naayaki Sevai Maiyam.
        </p>
        <p>
          For permission to use text information or photographs from this website
          in a manner other than that stated above, please contact us:{" "}
          <a href={`mailto:${site.contact.email}`} className="text-maroon underline">
            {site.contact.email}
          </a>
          .
        </p>
        <p>
          If you have any questions about this website, or if you find any
          errors, please notify us:{" "}
          <a href={`mailto:${site.contact.email}`} className="text-maroon underline">
            {site.contact.email}
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold text-maroon">Refund Policy</h2>
        <p>
          Since the contributions are voluntarily done, we do not have a refund
          policy.
        </p>
      </article>
    </>
  );
}
