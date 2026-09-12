import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { ArchImage, Eyebrow, Ornament } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Aram Valartha Naayaki Sevai Maiyam — a team of volunteers inspired by Pujya Swami Dayananda Saraswathi, working to protect and promote the Bharatheeya way of life.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Protecting and promoting the Indian way of life, rooted in the ancient tradition of the Vedas."
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="not-prose mb-8 text-center">
          <Eyebrow center>Our Story</Eyebrow>
          <Ornament className="mt-4" />
        </div>
        <p>
          The traditional Indian way of life has persisted for many millennia.
          The civilization itself is attested to the hoariest antiquity in the
          history of humankind. Evidence points to the basic division of stages
          of life and of occupation existing since times immemorial.
        </p>
        <p>
          It is obvious that such a system cannot have persisted without being
          beneficial to the crores of people who lived in the sphere of influence
          of Indian civilization, from Afghanistan to Indonesia. A civilization
          can be protected and promoted only through the preservation of its
          culture and by training younger generations to protect it. The Indian
          way of life is based upon the ancient tradition of the Vedas. One of
          the central tenets is the complete interconnectedness of the Universe —
          <em> Sarvam Khalvidam Brahma</em>.
        </p>
        <p>
          The Ishavasya Upanishad, Mahatma Gandhi&rsquo;s favourite Upanishad,
          declares that the entire Universe is pervaded by Divinity —
          <em> Ishavasyam Idam Sarvam</em>. Indian customs and rituals are
          predicated on this idea. Protecting our ancient way of life
          automatically entails a lifestyle in harmony with the environment, with
          humans, and with the other creatures that share this Earth with us.
          Aram Valartha Naayaki Sevai Maiyam works to protect this culture and
          way of life. Our team of volunteers is inspired, motivated and trained
          by Pujya Swami Dayananda Saraswathi.
        </p>

        <div className="not-prose my-12 grid gap-8 sm:grid-cols-2">
          <ArchImage src="/images/about/E-copy-copy.jpg" alt="Our work" className="aspect-[3/4]" sizes="(max-width:640px) 100vw, 50vw" />
          <ArchImage src="/images/about/F-copy-copy.jpg" alt="Our volunteers" className="aspect-[3/4]" sizes="(max-width:640px) 100vw, 50vw" />
        </div>

        <h2 className="text-2xl font-semibold text-maroon">Our Inspiration</h2>
        <p>
          An eminent teacher of Vedanta and an erudite scholar in Sanskrit,
          Swamiji was well known for his articulate enunciation and clear
          guidance to people from all walks of life and all strata of society.
          Swamiji taught Vedanta in India for more than five decades, and around
          the world from 1976. In his public talks abroad, he spoke at many
          prestigious forums and addressed international conventions, UNESCO and
          the United Nations, where he participated in the Millennium Peace
          Summit. Aram Valartha Naayaki Sevai Maiyam evolved as an organisation
          with Pujya Swamiji as our inspiration.
        </p>

        <h2 className="text-2xl font-semibold text-maroon">Our Team</h2>
        <p>
          Shri Manikandan is our mentor and advisor, the one to whom we look up
          to for guidance. He completed a graduation in engineering in 1991.
          Since then, he has been a full-time social worker in the cause of
          Dharma, working under the direct guidance of Pujya Swami Dayananda
          Saraswathi from 1999 until Swamiji&rsquo;s Samadhi.
        </p>
        <p>
          Aram Valartha Naayaki Sevai Maiyam (ASM) was founded by a group working
          under the guidance of Pujya Swami Dayananda Saraswathi. The group, with
          vast experience of over 25 years in the fields of Dharmic, social and
          humanitarian activities, was inspired by the teachings and vision of
          Pujya Swamiji through the personal experience of working with Him. They
          have taken upon themselves the onerous task of fulfilling some of His
          plans as their life&rsquo;s mission.
        </p>

        <div className="my-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border-l-4 border-saffron bg-white p-7 shadow-sm">
            <h3 className="text-xl font-semibold text-maroon">Our Mission</h3>
            <p className="mt-2 text-stone-700">
              Reclaiming and restoring our Bharatheeya way of life by
              enlightening Bharatvasis to practise customs, rituals and festivals
              through our teachings.
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-saffron bg-white p-7 shadow-sm">
            <h3 className="text-xl font-semibold text-maroon">Our Vision</h3>
            <p className="mt-2 text-stone-700">
              To secure and promote the Dharmic ideals of Bharat and uphold the
              Dharma.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
