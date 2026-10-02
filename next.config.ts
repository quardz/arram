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
    // Cap the number of generated variants to cut Image-Optimization
    // transformations + /_next/image requests. Fewer widths/qualities, same look.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256],
    qualities: [75],
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
