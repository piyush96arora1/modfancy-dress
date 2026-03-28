import type { NextConfig } from "next";
import redirectsData from "./redirects.json";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  async redirects() {
    return redirectsData as any;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    unoptimized: true,
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
    minimumCacheTTL: 86400,
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
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60,
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
