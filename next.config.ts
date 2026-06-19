import type { NextConfig } from "next";

// One year, immutable — used for fingerprinted/static assets.
const ONE_YEAR = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Local images served from /public. Long cache TTL for the optimizer.
    minimumCacheTTL: 31536000,
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        // All images shipped in /public/images are content-stable assets:
        // cache them aggressively at the CDN and in the browser.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
    ];
  },
};

export default nextConfig;
