import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // Empty config to silence turbopack warning
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    minimumCacheTTL: 60,
  },
};

let config = nextConfig;

// Only enable PWA in production - keep dev simple
if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
  });
  
  config = withPWA(nextConfig);
}

export default config;
