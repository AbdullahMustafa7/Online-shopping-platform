import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack config as requested, even though plugins failed
  turbopack: {},
};

export default nextConfig;
