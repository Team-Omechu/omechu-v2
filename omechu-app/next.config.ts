import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "motion",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "zod",
      "@supabase/ssr",
      "@supabase/supabase-js",
      "react-hook-form",
      "@hookform/resolvers",
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/mainpage",
        permanent: true,
      },
    ];
  },
  images: {
    // 모바일 max-w-120(375px) 기준. 큰 데스크톱 사이즈 변환 불필요.
    deviceSizes: [384, 750, 1080],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    // Vercel transform 캐시 1년 보유 — 재변환 빈도 ↓ (Hobby 5K/월 한도 보호)
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xztldvunnasjaxnzqpct.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
        pathname: "/v1/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  webpack: {
    reactComponentAnnotation: {
      enabled: true,
    },
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});
