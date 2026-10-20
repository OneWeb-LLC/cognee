import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone for the frontend Docker image. Vercel's build tracer
  // expects the default output layout when rootDirectory is cognee-frontend.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "lh3.googleusercontent.com",
    }],
  },
};

export default nextConfig;
