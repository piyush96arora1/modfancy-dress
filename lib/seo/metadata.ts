import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modfacnydress.com'
const siteName = 'Mod Fancy Dress'
const defaultDescription = 'Premium fancy dress costumes and accessories. 15+ years of experience, 400+ successful school functions. Shop quality costumes in Delhi, India.'

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'product' | 'article'
}): Metadata {
  const fullTitle = `${title} | ${siteName}`
  const fullDescription = description || defaultDescription
  const url = `${siteUrl}${path}`
  const ogImage = image || `${siteUrl}/og-image.jpg`

  // OpenGraph only supports 'website' or 'article', so map 'product' to 'website'
  const ogType = type === 'product' ? 'website' : type

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      'fancy dress',
      'fancy dress costumes',
      'costume rental',
      'school function costumes',
      'dance costumes',
      'Delhi costumes',
      'Krishna Nagar costumes',
      'fancy dress Delhi',
      'costume shop Delhi',
      'school event costumes',
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
  }
}

