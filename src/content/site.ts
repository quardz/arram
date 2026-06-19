// Central site configuration: navigation, contact details, org metadata.

export const site = {
  name: "Aram Valartha Naayaki Sevai Maiyam",
  shortName: "ASM",
  tagline:
    "Reclaiming and restoring our Bharatheeya way of life through customs, rituals and festivals.",
  donateUrl: "https://pay.ertitech.com/arram",
  contact: {
    address:
      "No. 17/12, Roja St, Brundavan Nagar, Sri Iyappa Nagar, Chennai, Tamil Nadu 600092",
    phone: "+91 73580 64179",
    phoneHref: "+917358064179",
    email: "aramvallarthanayaki@gmail.com",
  },
} as const;

export type NavLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export const nav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Our Activities",
    children: [
      { label: "Hindu Kudumbam", href: "/hindu-kudumbam" },
      { label: "Family Welfare Homam", href: "/family-welfare-homam" },
      { label: "Kovil Konda Thamizhagam", href: "/kovil-konda-thamizhagam" },
      { label: "Kovil Maiyam", href: "/kovil-maiyam" },
      { label: "Voice of Dharma", href: "/voice-of-dharma" },
    ],
  },
  {
    label: "Get Involved",
    children: [
      { label: "Volunteer", href: "/volunteer" },
      { label: "CSR", href: "/csr" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Contact Us", href: "/contact" },
];
