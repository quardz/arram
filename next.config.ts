import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

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

// withPayload mounts the Payload admin + API. It is safe at build time and does
// not require a live database (Payload connects lazily at request time).
export default withPayload(nextConfig, { devBundleServerPackages: false });
