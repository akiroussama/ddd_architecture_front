import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable Turbopack file system cache for dev performance
    turbopackFileSystemCacheForDev: true,
  },
  // React compiler disabled - enable when ready
  reactCompiler: false,
};

export default nextConfig;
