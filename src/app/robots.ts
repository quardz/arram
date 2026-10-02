import type { MetadataRoute } from "next";

const BASE = "https://www.arram.org.in";

// Keep crawlers on the public pages only. /admin, /api (Payload REST + GraphQL)
// and /app are app surfaces — every bot hit there is a wasted function call.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/app", "/next"] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
