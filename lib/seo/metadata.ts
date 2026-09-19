import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'
const siteName = 'Mod Fancy Dress'
const defaultDescription = 'Fancy dress costumes and accessories. 15+ years of experience, 400+ successful school functions. Shop quality costumes in Delhi, India.'

/** Truncate to ~155 chars for meta description (Google typically shows ~155–160). */
export function truncateMetaDescription(text: string | null | undefined, max = 155): string | undefined {
  if (!text || typeof text !== 'string') return undefined
  const t = text.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1).trim()
  const last = cut.lastIndexOf(' ')
  const out = last > max * 0.7 ? cut.slice(0, last) : cut
  return out + (out.length < t.length ? '…' : '')
}

/**
 * Site-wide keywords, used when a page does not supply its own.
 */
export const SITE_KEYWORDS = [
  'fancy dress',
  'fancy dress costumes',
  'buy fancy dress online',
  'fancy dress on rent',
  'fancy dress on rent near me',
  'costume on rent Delhi',
  'fancy dress for kids',
  'school function costumes',
  'dance costumes',
  'fancy dress Delhi',
  'costume shop Delhi',
  'school annual day dress',
  'fancy dress competition costume',
  'wholesale fancy dress',
  'Krishna Nagar costumes',
]

/**
 * Appended after page keywords so a specific page still carries the shop's
 * location and intent terms. Kept short — a long tag reads as stuffing.
 */
const BRAND_TAIL_KEYWORDS = [
  'fancy dress on rent',
  'fancy dress Delhi',
  'costume shop Delhi',
  'Krishna Nagar costumes',
]

const MAX_KEYWORDS = 20

/**
 * Page keywords first, then the brand tail, de-duplicated case-insensitively
 * and capped. Falls back to the site-wide list when a page supplies none.
 */
function resolveKeywords(pageKeywords?: string[]): string[] {
  if (!pageKeywords?.length) return SITE_KEYWORDS

  const seen = new Set<string>()
  const out: string[] = []
  for (const kw of [...pageKeywords, ...BRAND_TAIL_KEYWORDS]) {
    const clean = kw.trim()
    const key = clean.toLowerCase()
    if (!clean || seen.has(key)) continue
    seen.add(key)
    out.push(clean)
    if (out.length === MAX_KEYWORDS) break
  }
  return out
}

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  verification,
  keywords,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'product' | 'article'
  verification?: {
    google?: string
  }
  /**
   * Page-specific keywords, most important first. They are emitted ahead of a
   * short brand tail; pass nothing and the page keeps the site-wide list.
   */
  keywords?: string[]
}): Metadata {
  const fullTitle = `${title} | ${siteName}`
  const rawDescription = description || defaultDescription
  const fullDescription = rawDescription.length > 155 ? truncateMetaDescription(rawDescription, 155) || rawDescription.slice(0, 152) + '…' : rawDescription
  const url = `${siteUrl}${path}`
  const ogImage = image || `${siteUrl}/modfancydress-logo.png`

  // OpenGraph only supports 'website' or 'article', so map 'product' to 'website'
  const ogType = type === 'product' ? 'website' : type

  return {
    title: fullTitle,
    description: fullDescription,
    verification,
    keywords: resolveKeywords(keywords),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType,
      url,
      title: fullTitle,
      description: fullDescription,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  }
}

