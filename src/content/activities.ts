// Activity cards shown on the home page and "Our Activities" sections.

export type Activity = {
  title: string;
  href: string;
  image: string;
  blurb: string;
};

export const activities: Activity[] = [
  {
    title: "Hindu Kudumbam",
    href: "/hindu-kudumbam",
    image: "/images/home/Hindu-Kudumbam.jpg",
    blurb:
      "Re-establishing the family system by reviving the values, customs, rituals and festivals that have held Hindu society together for millennia.",
  },
  {
    title: "Family Welfare Homam",
    href: "/family-welfare-homam",
    image: "/images/home/Homam.jpg",
    blurb:
      "Free monthly homams across every Chennai Corporation zone, with prayaschitta homams cast by experienced astrologers for registered families.",
  },
  {
    title: "Kovil Maiyam",
    href: "/kovil-maiyam",
    image: "/images/home/Kovil-Maiyam.jpg",
    blurb:
      "Restoring the temple as the centre of the community through five free services — women, education, healthcare, ecology and mental wellness.",
  },
  {
    title: "Kovil Konda Thamizhagam",
    href: "/kovil-konda-thamizhagam",
    image: "/images/home/001.jpg",
    blurb:
      "Reviving the age-old role of the temple as a social, cultural and economic anchor that integrates and uplifts the whole community.",
  },
  {
    title: "Voice of Dharma",
    href: "/voice-of-dharma",
    image: "/images/home/Dharmathin-Kural.jpg",
    blurb:
      "Broadcasting daily panchangam, festivals and the words of social reformers through temples, every hour from 6 AM to 10 PM.",
  },
];

export const stats = [
  { value: "1,964", label: "Temples Reached" },
  { value: "8,634", label: "Programs Conducted" },
  { value: "4,171", label: "Volunteers" },
  { value: "2,60,000", label: "People Benefitted" },
];
