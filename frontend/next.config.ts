import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   // Enable standalone output for Docker
   output: "standalone",

   /* config options here */
   async rewrites() {
      // Use environment variable for API URL, fallback to localhost for local dev
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      return [
         {
            source: "/api/v1/:path*",
            destination: `${apiUrl}/api/v1/:path*`
         }
      ];
   },
   // Updated configuration for stable Turbopack
   turbopack: {
      resolveAlias: {
         canvas: "./empty-module.js"
      }
   },

   // Environment variables
   env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
   },

   devIndicators: false
};

export default nextConfig;
