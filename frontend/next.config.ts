import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel uses its own deployment adapter; standalone is for the Docker image.
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "4.4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
