import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  compiler: {
    styledComponents: true,
  },
  images: {
    formats: ["image/webp"],
    qualities: [60, 68, 75],
    deviceSizes: [640, 828, 1080, 1600],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
