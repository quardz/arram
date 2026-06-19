// Clean news / updates. Populate this array as new stories are published.
// (The old WordPress blog was excluded — it had been hijacked with spam posts.)

export type NewsItem = {
  slug: string;
  title: string;
  date: string; // ISO date
  excerpt: string;
  body: string[];
  image?: string;
};

export const news: NewsItem[] = [
  {
    slug: "vyasa-jayanthi-quiz",
    title: "Vyasa Jayanthi — Quiz for Fishermen's Children",
    date: "2023-07-03",
    excerpt:
      "As part of our Vyasa Jayanthi celebrations, ASM and Chinmaya Mission Chennai conducted a quiz on Veda Vyasa for children from fishing villages across Chennai.",
    body: [
      "As a part of our Vyasa Jayanthi celebrations, Aram Valartha Naayaki Sevai Maiyam, along with Chinmaya Mission Chennai, organised and conducted a quiz competition for fishermen's children on Veda Vyasa. A book on Vyasa's life and some of his works was compiled and distributed to all the registrants.",
      "Children aged between 11 and 15 from 47 villages across Chennai participated in the quiz, which was spread across three rounds. Teams from 8 fishing villages entered the finals. The winner of the contest was from Kasipuram A Block of Kasimedu, the first runner-up from Singaravelar Nagar of Kasimedu, and the second runner-up from C.G. Colony of Kasimedu.",
      "The prizes were distributed by the Honourable Governor of Tamil Nadu, Shri R. N. Ravi.",
    ],
    image: "/images/home/IMG_1975-scaled.jpg",
  },
];
