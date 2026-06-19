// Gallery is organised as groups of albums; each album holds a set of images.
// The first image in `images` is used as the album cover.
//
// To add more photos to an album later, drop the files into /public/images/...
// and add their paths to the album's `images` array.

export type Album = {
  slug: string;
  title: string;
  images: string[];
};

export type AlbumGroup = {
  title: string;
  albums: Album[];
};

const g = (f: string) => `/images/gallery/${f}`;
const hindu = (f: string) => `/images/hindu/${f}`;
const km = (f: string) => `/images/kovil-maiyam/${f}`;
const home = (f: string) => `/images/home/${f}`;

export const galleryGroups: AlbumGroup[] = [
  {
    title: "Our Activities",
    albums: [
      {
        slug: "tamil-new-year",
        title: "Tamil New Year",
        images: [g("4203603341.jpeg"), hindu("Tamil-New-Year.jpg")],
      },
      {
        slug: "akshaya-tritiya",
        title: "Akshaya Tritiya",
        images: [g("502757691.jpg"), hindu("Akshaya-Tritiya-3.jpg"), hindu("AT.jpg")],
      },
      {
        slug: "krishna-jeyanthi",
        title: "Krishna Jeyanthi",
        images: [g("1630784786.jpg"), hindu("kRISHNA-jEYANTHI.jpg")],
      },
      {
        slug: "navarathiri",
        title: "Navarathiri",
        images: [g("2195081105.jpg"), hindu("Navarathiri.jpg"), hindu("Navarathiri-1-scaled.jpg")],
      },
      {
        slug: "shivarathiri",
        title: "Shivarathiri",
        images: [g("2115610040.jpeg"), hindu("Shivarathiri-1-scaled.jpg")],
      },
      {
        slug: "kudumbamey-kovil",
        title: "Kudumbamey Kovil",
        images: [
          g("2469831439.jpg"),
          hindu("Kudumbamey-Kovil.jpg"),
          hindu("Kudumbamey-Kovil-1.jpeg"),
          hindu("Kudumbamey-Kovil-2.jpeg"),
        ],
      },
      {
        slug: "vyasa-poornima",
        title: "Vyasa Poornima",
        images: [g("2953937740.jpg")],
      },
      {
        slug: "valmiki-jeyanthi",
        title: "Valmiki Jeyanthi",
        images: [g("4200171742.jpg")],
      },
      {
        slug: "kamba-ratham",
        title: "Kamba Ratham",
        images: [g("1611986338.jpg")],
      },
      {
        slug: "training",
        title: "Training",
        images: [g("1260391153.jpeg"), km("SAM_1370-scaled.jpg"), km("SAM_1475-scaled.jpg")],
      },
      {
        slug: "bajan",
        title: "Bajan",
        images: [g("2669334330.jpeg")],
      },
      {
        slug: "vyasa-jayanthi",
        title: "Vyasa Jayanthi",
        images: [g("2823175575.jpg"), home("IMG_1975-scaled.jpg")],
      },
      {
        slug: "vijayadasami",
        title: "Vijayadasami",
        images: [g("3926216569.jpg")],
      },
    ],
  },
  {
    title: "Kovil Maiyam",
    albums: [
      {
        slug: "sakthi-maiyam",
        title: "Sakthi Maiyam",
        images: [g("3148424933.jpg"), km("SAM_1252-scaled.jpg"), km("SAM_1253-scaled.jpg")],
      },
      {
        slug: "saraswathi-maiyam",
        title: "Saraswathi Maiyam",
        images: [g("4174145036.jpg"), km("IMG_20161125_124543-scaled.jpg")],
      },
      {
        slug: "dhanvanthiri-maiyam",
        title: "Dhanvanthiri Maiyam",
        images: [
          g("1023228700.jpeg"),
          km("Dhanvanthiri-Maiyam.jpg"),
          km("Dhanvanthiri-Maiyam2.jpeg"),
          km("Dhanvanthiri-Maiyam3.jpeg"),
        ],
      },
      {
        slug: "prapancha-maiyam",
        title: "Prapancha Maiyam",
        images: [g("874858646.jpg"), km("20200226_114423-scaled.jpg")],
      },
      {
        slug: "mano-maiyam",
        title: "Mano Maiyam",
        images: [g("680907825.jpg"), km("DSC3343-scaled.jpg")],
      },
      {
        slug: "thiruamuthutum-thiruthondar-thirukootam",
        title: "Thiruamuthutum Thiruthondar Thirukootam",
        images: [g("3277966832.jpg")],
      },
    ],
  },
];
