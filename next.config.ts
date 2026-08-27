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
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.google.com https://maps.gstatic.com",
      "frame-src https://maps.google.com https://www.google.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    ].join('; '),
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
      // Belt-and-braces for the private catalogue: it must never be indexed even if a page's
      // robots metadata is wrong or missing. Complements the noindex meta tag, the robots.txt
      // disallow, and its absence from the sitemap.
      {
        source: '/catalog',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/catalog/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
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
            // Product pages now carry 8 sibling product images below the fold on
            // top of the gallery's own, so a 30-entry cache evicted itself within
            // a couple of page views.
            maxEntries: 60,
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
