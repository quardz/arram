import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Kovil Maiyam",
  description:
    "Restoring the temple as the centre of the community through five free services: Sakthi, Saraswathi, Dhanvantri, Prapancha and Mano Maiyam.",
};

const maiyams = [
  {
    title: "Sakthi Maiyam",
    desc: "Promoting the Indian concept of women. We organise the women of each kovil maiyam and train them in self-empowerment, family development and social development.",
  },
  {
    title: "Saraswathi Maiyam",
    desc: "Educational support. We provide academic and moral support through learning centres, identify and train intelligent students for competitive examinations, and offer skill development.",
  },
  {
    title: "Dhanvantri Maiyam",
    desc: "Healthcare. We work to build a healthier society by educating people about home remedies, lifestyle training, and conducting health camps.",
  },
  {
    title: "Prapancha Maiyam",
    desc: "Ecological preservation. We help people live harmoniously with nature through the Indian view of the environment — preserving local water bodies and reducing plastic usage.",
  },
  {
    title: "Mano Maiyam",
    desc: "Mental wellness. Through forums, lifestyle training (yoga, meditation, pranayama) and the practice of vrathams, we help build confidence and keep people away from liquor, drugs and suicide.",
  },
];

export default function KovilMaiyamPage() {
  return (
    <>
      <PageHeader
        title="Kovil Maiyam"
        subtitle="The temple as the centre of the community — five free services to reclaim our ancient glory."
        breadcrumb="Kovil Maiyam"
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p>
          The economic historian Angus Maddison documented that India and China
          together dominated the world economy between 1 CE and 1700 CE. In 1 CE,
          India alone contributed 32% of world GDP, and it was still 25% in 1700.
          Temples were central to this prosperity — social and educational
          centres, and important economic institutions that ensured the local
          re-distribution of wealth and supported priests, musicians, dancers,
          craftspeople and village medicine practitioners.
        </p>
        <p>
          Starting with the destruction of our native education system, our
          economy, education and healthcare rapidly deteriorated and we fell
          behind the rest of the world — Indian GDP fell from 25% in 1700 to 3% by
          1947. To reverse this fall and reclaim our heritage, Aram Valartha
          Naayaki Sevai Maiyam is taking steps in the form of Kovil Maiyam — the
          temple as the centre of the community.
        </p>
        <p>
          We select only neighbourhood temples in low-income localities of Chennai
          and its suburbs, and provide five services entirely free of cost to
          beneficiaries.
        </p>

        <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-xl shadow">
          <Image
            src="/images/kovil-maiyam/Kovil-Maiyam-1-scaled.jpg"
            alt="Kovil Maiyam"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
      </article>

      <section className="bg-cream py-14">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-semibold text-maroon">
            The Five Maiyams
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {maiyams.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border-t-4 border-saffron bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-maroon">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
