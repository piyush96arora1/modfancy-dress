import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    unoptimized: true, // keeping this since Vercel optimization limit reached
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'udnidqllpmyoothwznbv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    minimumCacheTTL: 86400, // 24 hours (was 60 seconds — this alone helps)
  },
};

let config = nextConfig;

if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/udnidqllpmyoothwznbv\.supabase\.co\/storage\/v1\/object\/public\/product-images\/.*/i,
        handler: 'StaleWhileRevalidate', // was CacheFirst
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 30,            // was 500 — this was the killer
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  });

  config = withPWA(nextConfig);
}

export default config;