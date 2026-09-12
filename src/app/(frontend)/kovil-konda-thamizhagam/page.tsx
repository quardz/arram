import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Kovil Konda Thamizhagam",
  description:
    "Reviving the temple as the social, cultural and economic centre of the community — an initiative of Aram Valartha Naayaki Sevai Maiyam.",
};

export default function KovilKondaPage() {
  return (
    <>
      <PageHeader
        title="Kovil Konda Thamizhagam"
        subtitle="The temple as the binding force that integrates and uplifts the community."
        breadcrumb="Kovil Konda Thamizhagam"
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold text-maroon">Role of Devalayas</h2>
        <p>
          A temple integrates the community and is the binding force that
          promotes unity in society. The Hindu temple is a vast and complex
          adhyatmik, religious, cultural and socio-economic entity. As the scholar
          of Hindu architecture Adam Hardy notes: &ldquo;The foundation and
          endowment of temples played a central role in the development of state
          and society. Temples became social and educational centres, and
          important economic institutions — landowners, employers, moneylenders
          and dispensers of charity. They were a canvas for the visual arts, a
          stage for the performing arts.&rdquo;
        </p>
        <p>
          The temples also functioned as a social security system, helping in
          times of emergencies like floods, famines and epidemics, and supporting
          the poorest sections of society. Till Bharat&rsquo;s independence, they
          served as judicial arbitrators for the rural population. There are more
          than 6,49,000 temples in India, with 53 temples for every one lakh
          persons. Tamil Nadu emerges as the &lsquo;temple state&rsquo; with
          79,154 temples — 103 temples for every one lakh people.
        </p>

        <h2 className="text-2xl font-semibold text-maroon">Conclusion</h2>
        <p>
          The centrality of the Hindu temple in the social life of the community
          cannot be stressed enough. Over the centuries, due to the destruction
          brought by invaders, the Hindu temple fell into neglect. It is only now
          that the world is waking up to the wonder that is the Hindu temple.
        </p>
        <p>
          Kovil Konda Thamizhagam is an effort by Aram Valartha Naayaki Sevai
          Maiyam — a team inspired, trained and having worked under Swami
          Dayananda Saraswathi — to bring back the age-old practice of making the
          temple a charging centre for people to carry out their day-to-day work
          effectively. The temple should once again be a central point in
          people&rsquo;s lives so that all communities prosper and the temples
          flourish alongside them. We invite you to be a part of this great
          endeavour of rejuvenating our temples.
        </p>
      </article>
    </>
  );
}
