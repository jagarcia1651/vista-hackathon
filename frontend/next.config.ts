import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // Use environment variable for API URL, fallback to localhost for local dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },
  // Updated configuration for stable Turbopack
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
};

export default nextConfig;
