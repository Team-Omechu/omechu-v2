import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "omechu-s3-bucket.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "omechu-service-s3-bucket.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
