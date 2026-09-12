import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/forms/ContactForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Aram Valartha Naayaki Sevai Maiyam (ASM), Chennai.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We would love to hear from you."
        breadcrumb="Contact Us"
      />

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-maroon">Reach Us</h2>
            <div className="mt-6 space-y-6 text-sm text-stone-700">
              <div>
                <p className="font-semibold text-stone-900">Address</p>
                <p className="mt-1 leading-relaxed">{site.contact.address}</p>
              </div>
              <div>
                <p className="font-semibold text-stone-900">Phone</p>
                <p className="mt-1">
                  <a
                    href={`tel:${site.contact.phoneHref}`}
                    className="hover:text-maroon"
                  >
                    {site.contact.phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-stone-900">Email</p>
                <p className="mt-1">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="hover:text-maroon"
                  >
                    {site.contact.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl shadow">
              <iframe
                title="ASM location"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Sri%20Iyappa%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu%20600092&output=embed"
              />
            </div>
          </div>

          <div className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-stone-100">
            <h2 className="mb-6 text-2xl font-semibold text-maroon">
              Send a Message
            </h2>
            <ContactForm defaultSubject={subject} />
          </div>
        </div>
      </section>
    </>
  );
}
