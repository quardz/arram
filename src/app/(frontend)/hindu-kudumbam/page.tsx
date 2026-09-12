import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Hindu Kudumbam",
  description:
    "Re-establishing the Hindu family system by reviving customs, rituals and festivals — Tamil New Year, Akshaya Tritiya, Krishna Jayanti, Navarathri, Kudumbamey Kovil, Mahashivarathri and more.",
};

const festivals = [
  {
    title: "Tamil New Year (Chitrai Puthandu)",
    image: "/images/hindu/Tamil-New-Year.jpg",
    body: [
      "Our ancestors not only understood the functioning of the cosmos but also worked out models for translating it into mathematical calculations. These are available to us today in the Panchanga — the Indian calendric system — defined by five parameters: Nakshatra, Thithi, Vaara, Karana and Yoga.",
      "In Tamil Nadu, Sauramanam is followed and the New Year is celebrated as Chitrai Puthandu. ASM undertakes activities to educate people about the scientific aspects of their own calendric system and inspire them to follow it.",
    ],
    reach:
      "In 2021, we reached 3,12,700 families across Chennai on Chitrai Puthandu with a Sree Lakshmi Narashimhar greeting card.",
  },
  {
    title: "Akshaya Tritiya",
    image: "/images/hindu/Akshaya-Tritiya-3.jpg",
    body: [
      "Akshaya Tritiya is one of the most misunderstood festivals — today reduced to an occasion to buy jewellery. In truth it is an auspicious day that grants boons without limit. On this day Bhagiratha brought Akasha Ganga to Earth, Veda Vyasa began narrating the Mahabharata, and the Sun and Moon are at their most exalted brightness.",
      "ASM makes an effort to educate people about the real intention of this auspicious day and to help them reap its actual benefit. We organise Sree Lalitha Parameswari Pooja, free of cost, at the Sarva Siddhi Muhurtham in each ward of Chennai.",
    ],
    reach:
      "In 2019, 66,470 people performed Sree Lalitha Parameswari Pooja at 167 locations across Chennai.",
  },
  {
    title: "Krishna Jayanti",
    image: "/images/hindu/kRISHNA-jEYANTHI.jpg",
    body: [
      "Krishna (Kannan in Tamil) is the most endearing form of the almighty to children. The sheer volume of stories about his childhood, and children's natural identification with him, make Krishnavatar ideal for educating children — teaching them that one should always strive to uphold dharma even amid struggle.",
      "Our volunteers mobilise children at nearby temples. From Prathamai till Krishna Jayanti (Ashtami) the children chant Sri Krishna's Moola Mantra 108 times, and are offered prasadam on the day.",
    ],
    reach:
      "In 2019, we reached 12,225 children across 604 slums in 15 zones of Chennai.",
  },
  {
    title: "Navarathri",
    image: "/images/hindu/Navarathiri.jpg",
    body: [
      "In our tradition, girls and women are placed on a high pedestal — worshipped as kanyas, grih lakshmis and mothers. Our scriptures glorify the dignity of women: yatra naryastu pujyante ramante tatra devata — where women are honoured, there the deities are pleased.",
      "Mahishasuran was killed and Dharma established by Mahishasuramardhini (Sakthi) on Vijayadhasami. For the nine days before, our volunteer teams (Sakthi Maiyam) organise Golu in each local temple to enlighten women on their responsibility towards the protection of Dharma.",
    ],
    reach:
      "Navarathri Golu was celebrated at 1,574 temples across 181 wards of Chennai in 2020, with 15,118 people participating.",
  },
  {
    title: "Kudumbamey Kovil",
    image: "/images/hindu/Kudumbamey-Kovil.jpg",
    body: [
      "The basic building block of Hindu society is the joint family — usually three or four generations living together, sharing responsibilities and pooling income, with elders offering guidance. This interdependence traditionally provides shelter and support for the elderly, the disabled and the less well off.",
      "ASM adopts the whole month of Margazhi (Vrischika) to teach families to perform the Pancha Maha Yajnas — the five great sacrifices each human is expected to perform daily. Five activities for the five Yajnas are prescribed for families throughout Chennai.",
    ],
    reach: "7,500 families participated in this activity in 2020.",
  },
  {
    title: "Mahashivarathri",
    image: "/images/hindu/Shivarathiri-1-scaled.jpg",
    body: [
      "We celebrate Mahashivarathri to mark Lord Shiva's devotion to preserving all life from the poisonous halaahala by consuming it. Our Shastras say the excellence of penance lies in the mantra and its recitation; the mantra 'Om Namah Shivaya' is referred to as the Raja Manthiram.",
      "ASM promotes awareness of this Japam among the public. In each local temple our volunteers organise Shiva Nama Japam — chanting 1008 Shiva nama japam from the first day of the full moon till Chaturdasi.",
    ],
    reach:
      "Mahashivarathri was celebrated at 798 temples in Chennai in 2021, with 8,928 people participating.",
  },
];

export default function HinduKudumbamPage() {
  return (
    <>
      <PageHeader
        title="Hindu Kudumbam"
        subtitle="The family is the smallest unit of Hindu society — we work to re-establish it by reviving our customs, rituals and festivals."
        breadcrumb="Hindu Kudumbam"
      />

      <section className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        <div className="prose-asm">
          <p>
            Family is the smallest unit of Hindu society. Our customs, rituals
            and festivals have kept this institution alive for thousands of
            years. There is a constant effort to weaken faith in this institution
            due to western intrusion.
          </p>
          <p>
            Aram Valartha Naayaki Sevai Maiyam works to re-establish the family
            system by propagating values and encouraging people to practise our
            rituals, customs and festivals.
          </p>
        </div>
      </section>

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-5xl space-y-12 px-4 lg:px-8">
          {festivals.map((f, i) => (
            <div
              key={f.title}
              className="grid items-center gap-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-100 lg:grid-cols-2"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-lg ${
                  i % 2 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-maroon">{f.title}</h2>
                {f.body.map((p, j) => (
                  <p key={j} className="mt-3 leading-relaxed text-stone-700">
                    {p}
                  </p>
                ))}
                <p className="mt-4 rounded-md bg-cream px-4 py-3 text-sm font-medium text-maroon">
                  <span className="font-semibold">Our reach so far:</span>{" "}
                  {f.reach}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
