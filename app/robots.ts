import { MetadataRoute } from 'next'

/**
 * robots.txt: tells crawlers which paths to crawl and where the sitemap is.
 * - Allow all public pages (default).
 * - Block /admin/ and /api/ to save crawl budget.
 * - Sitemap URL so Google can discover all URLs automatically.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}






