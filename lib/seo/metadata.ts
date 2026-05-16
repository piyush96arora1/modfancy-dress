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

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  verification,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'product' | 'article'
  verification?: {
    google?: string
  }
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
    keywords: [
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
    ],
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

