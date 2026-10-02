import type { MetadataRoute } from "next";

const BASE = "https://www.arram.org.in";

// Public pages only. Static list — no DB call, so this stays a cheap static file.
const PATHS = [
  "", "about", "contact", "csr", "family-welfare-homam", "gallery",
  "hindu-kudumbam", "join", "kovil-konda-thamizhagam", "kovil-maiyam",
  "news", "voice-of-dharma", "volunteer", "privacy", "terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((p) => ({
    url: p ? `${BASE}/${p}` : BASE,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
