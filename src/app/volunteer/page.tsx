import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import VolunteerForm from "@/components/forms/VolunteerForm";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Be a volunteer and work with us. Field, virtual and content-preparation opportunities across 15 zones, 200 wards and 2000 temples under the Chennai Corporation.",
};

export default function VolunteerPage() {
  return (
    <>
      <PageHeader
        title="Be a Volunteer and Work with Us"
        subtitle="Our reach: 15 zones, 200 wards and 2000 temples under the Chennai Corporation."
        breadcrumb="Volunteer"
      />

      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-stone-100">
            <h2 className="text-xl font-semibold text-maroon">
              Field Volunteering
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>
                <strong>14 hrs/week — zonal level:</strong> train and motivate
                volunteers in each kovil maiyam under a zone; travel within the
                zone.
              </li>
              <li>
                <strong>8 hrs/week — ward level:</strong> train and motivate
                volunteers from different temples under a ward for the Hindu
                Kudumbam project.
              </li>
              <li>
                <strong>4 hrs/week — area level:</strong> part of Hindu Kudumbam,
                Kovil Maiyam or Family Welfare Homam projects in your area.
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-stone-100">
            <h2 className="text-xl font-semibold text-maroon">
              Virtual Volunteering
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>Data entry on different activities</li>
              <li>Tele-calling</li>
            </ul>
            <h2 className="mt-6 text-xl font-semibold text-maroon">
              Content Preparation
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>Content preparation in Tamil</li>
              <li>Content preparation in English (documentation &amp; social media)</li>
              <li>Translation of content</li>
            </ul>
            <h2 className="mt-6 text-xl font-semibold text-maroon">
              Other Opportunities
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>Recording photos and videos</li>
              <li>Technical support (software)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-semibold text-maroon">
            Volunteer Registration
          </h2>
          <VolunteerForm />
        </div>
      </section>
    </>
  );
}
