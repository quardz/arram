import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Voice of Dharma",
  description:
    "Voice-based content — daily panchangam, festivals and the words of social reformers — broadcast through temples every hour from 6 AM to 10 PM.",
};

export default function VoiceOfDharmaPage() {
  return (
    <>
      <PageHeader
        title="Voice of Dharma"
        subtitle="Spreading philosophical thoughts, chants and hymns to the masses through our temples."
        breadcrumb="Voice of Dharma"
      />

      <article className="prose-asm mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p>
          In the battle of Kurukshetra, Arjuna — a great warrior — had a panic
          attack and was incapacitated. It is not that Arjuna was weak; the
          Srimad Bhagavad Gita explains that anyone, even a great warrior, would
          need support. In our daily lives we face problems of various kinds at
          home and at work. We rejoice in success but feel miserable in failure.
          We all need emotional support.
        </p>
        <p>
          Our temples have always been a place not just for spiritual upliftment
          but also for boosting the morale of the devotee. A darshan of the deity,
          a deep breath of air purified by the camphor lit for arti, and a drop of
          theertham relax the mind — an ephemeral moment of meditation that
          diverts the mind from wandering and helps a person take proper decisions
          and behave coherently.
        </p>
        <p>
          In this age of technology, we wanted to reach out to the masses with a
          unified way of conveying messages and spreading philosophical thoughts,
          chants and hymns simultaneously to all people through the temples. Thus,
          under Aram Valartha Naayaki Sevai Maiyam, the Voice of Dharma was born.
        </p>

        <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-xl shadow">
          <Image
            src="/images/voice/2-1-scaled.jpg"
            alt="Voice of Dharma"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <h2 className="text-2xl font-semibold text-maroon">What We Do</h2>
        <ul>
          <li>
            Every hour, from 6 AM to 10 PM, voice-based content — daily
            panchangam, festivals and the words of social reformers — is
            broadcast through each temple.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-maroon">Our Reach So Far</h2>
        <ul>
          <li>
            So far we have installed this device in 150 temples around the Chennai
            Corporation.
          </li>
        </ul>
      </article>
    </>
  );
}
