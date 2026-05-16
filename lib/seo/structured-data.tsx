import { ProductWithDetails } from '@/types/database'
import { getImageUrl } from '@/lib/imageUrl'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'

/** Brand / legal entity (Organization). Linked from LocalBusiness via `parentOrganization`. */
export function organizationEntityId(): string {
  return `${siteUrl}#org`
}

/** Stable @id for LocalBusiness — use in Product/Offer `seller` so Google links offers to the store entity. */
export function localBusinessEntityId(): string {
  return `${siteUrl}#organization`
}

/** Makes a URL absolute for JSON-LD (Google requires absolute URLs). */
export function toAbsoluteUrl(url: string): string {
  if (!url) return url
  return url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function sortProductImagesForSchema(
  images: ProductWithDetails['images'] | undefined
): ProductWithDetails['images'] {
  if (!images?.length) return []
  return [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.order ?? 0) - (b.order ?? 0)
  })
}

/** LocalBusiness / store entity (site-wide). */
export function LocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': localBusinessEntityId(),
    parentOrganization: {
      '@id': organizationEntityId(),
    },
    name: 'Mod Fancy Dress',
    description:
      'Fancy dress costumes and accessories. Based in Delhi with 15+ years of experience; we serve customers across Delhi, Noida, the wider NCR (Gurugram, Ghaziabad, Faridabad, Greater Noida, and nearby areas), and ship to many localities in other states — contact us for delivery options.',
    url: siteUrl,
    logo: `${siteUrl}/modfancydress-logo.png`,
    image: `${siteUrl}/modfancydress-logo.png`,
    telephone: '+919311365366',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'S64, South Anarkali, Som Bazar',
      addressLocality: 'Krishna Nagar',
      addressRegion: 'Delhi',
      postalCode: '110051',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '28.6680',
      longitude: '77.2897',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Delhi',
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: 'National Capital Territory of Delhi',
        },
      },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurugram' },
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'City', name: 'Faridabad' },
      { '@type': 'City', name: 'Greater Noida' },
      {
        '@type': 'AdministrativeArea',
        name: 'National Capital Region',
        containedInPlace: { '@type': 'Country', name: 'India' },
      },
      { '@type': 'Country', name: 'India' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '21:30',
    },
    priceRange: '₹₹',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: 700,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [
      'https://share.google/j5z6wKKjqsCHJKajh',
    ],
  }
}

/** schema.org Organization (brand). Emit on About and similar pages; links to storefront via `subOrganization`. */
export function OrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationEntityId(),
    name: 'Mod Fancy Dress',
    alternateName: 'Mod Fancy Dress — Delhi & NCR',
    url: siteUrl,
    logo: `${siteUrl}/modfancydress-logo.png`,
    image: `${siteUrl}/modfancydress-logo.png`,
    description:
      'Retailer of fancy dress costumes and accessories. Over 15 years serving schools, events, and families across Delhi, Noida, the National Capital Region, and customers in other states through delivery and coordination.',
    telephone: '+919311365366',
    foundingDate: '2010',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'S64, South Anarkali, Som Bazar',
      addressLocality: 'Krishna Nagar',
      addressRegion: 'Delhi',
      postalCode: '110051',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://share.google/j5z6wKKjqsCHJKajh',
    ],
    subOrganization: {
      '@id': localBusinessEntityId(),
    },
  }
}

/** Optional review stats for Product schema (from product_reviews). Include only when reviewCount >= 1. */
export type ProductAggregateRating = {
  ratingValue: number
  reviewCount: number
}

/** Row shape from `product_reviews` used for JSON-LD `Review` nodes (newest first recommended). */
export type ProductReviewRowForSchema = {
  rating: number
  review_text: string | null
  author_name: string | null
  created_at: string
}

/** Derive Product `aggregateRating` from Supabase `product_reviews` rows (same average as the on-page list). */
export function aggregateRatingFromProductReviews(
  rows: { rating: number }[] | null | undefined
): ProductAggregateRating | null {
  if (!rows?.length) return null
  const sum = rows.reduce((s, r) => s + r.rating, 0)
  return { ratingValue: sum / rows.length, reviewCount: rows.length }
}

function buildProductReviewJsonLd(
  rows: ProductReviewRowForSchema[],
  max = 5,
  /** Retail product @id for `itemReviewed` (same entity for wholesale + retail pages). */
  retailProductSlug?: string
): Record<string, unknown>[] {
  const productRef = retailProductSlug ? `${siteUrl}/products/${retailProductSlug}#product` : undefined
  return rows.slice(0, max).map((r) => {
    const node: Record<string, unknown> = {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author_name?.trim() || 'Customer',
      },
      datePublished: r.created_at.slice(0, 10),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }
    const body = r.review_text?.trim()
    if (body) node.reviewBody = body
    if (productRef) {
      node.itemReviewed = { '@type': 'Product', '@id': productRef }
    }
    return node
  })
}

/** Exported for wholesale JSON-LD — up to 5 `Review` objects aligned with aggregateRating. */
export function reviewsForProductJsonLd(
  rows: ProductReviewRowForSchema[],
  retailProductSlug?: string
): Record<string, unknown>[] {
  return buildProductReviewJsonLd(rows, 5, retailProductSlug)
}

function stripJsonLdContext(node: Record<string, unknown>): Record<string, unknown> {
  const { '@context': _, ...rest } = node
  return rest
}

/** Single `<script type="application/ld+json">`: Product + BreadcrumbList for crawlers. */
export function ProductPageJsonLdGraph(
  product: ProductWithDetails,
  options: {
    aggregateRating?: ProductAggregateRating | null
    reviewsForJsonLd?: ProductReviewRowForSchema[]
  },
  breadcrumbItems: Array<{ name: string; url: string }>
): Record<string, unknown> {
  const productNode = stripJsonLdContext(ProductSchema(product, options) as Record<string, unknown>)
  const crumbNode = {
    ...stripJsonLdContext(BreadcrumbSchema(breadcrumbItems) as Record<string, unknown>),
    '@id': `${siteUrl}/products/${product.slug}#breadcrumb`,
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [crumbNode, productNode],
  }
}

export function WholesaleProductPageJsonLdGraph(
  wholesaleProductNode: Record<string, unknown>,
  breadcrumbItems: Array<{ name: string; url: string }>,
  slug: string
): Record<string, unknown> {
  const crumbNode = {
    ...stripJsonLdContext(BreadcrumbSchema(breadcrumbItems) as Record<string, unknown>),
    '@id': `${siteUrl}/wholesale/${slug}#breadcrumb`,
  }
  const { '@context': _, ...productRest } = wholesaleProductNode
  return {
    '@context': 'https://schema.org',
    '@graph': [crumbNode, productRest],
  }
}

/** Category listing: BreadcrumbList + CollectionPage + ItemList (retail or wholesale URL). */
export function CategoryListingJsonLd(args: {
  variant: 'retail' | 'wholesale'
  slug: string
  categoryName: string
  description?: string | null
  products: { slug: string; name: string }[]
}): Record<string, unknown> {
  const pageUrl =
    args.variant === 'wholesale'
      ? `${siteUrl}/wholesale/category/${args.slug}`
      : `${siteUrl}/category/${args.slug}`

  const breadcrumbItems =
    args.variant === 'wholesale'
      ? [
          { name: 'Home', url: '/' },
          { name: 'Wholesale', url: '/wholesale' },
          { name: args.categoryName, url: `/wholesale/category/${args.slug}` },
        ]
      : [
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: args.categoryName, url: `/category/${args.slug}` },
        ]

  const breadcrumbNode = {
    ...stripJsonLdContext(BreadcrumbSchema(breadcrumbItems) as Record<string, unknown>),
    '@id': `${pageUrl}#breadcrumb`,
  }

  const collectionNode: Record<string, unknown> = {
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    url: pageUrl,
    name:
      args.variant === 'wholesale'
        ? `${args.categoryName} — wholesale fancy dress costumes`
        : `${args.categoryName} fancy dress costumes`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Mod Fancy Dress',
      url: siteUrl,
    },
  }
  const desc = args.description?.trim()
  if (desc) collectionNode.description = desc

  const graph: Record<string, unknown>[] = [breadcrumbNode, collectionNode]

  if (args.products.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#itemlist`,
      numberOfItems: args.products.length,
      itemListElement: args.products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        item: toAbsoluteUrl(`/products/${p.slug}`),
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

// Product Schema — pass aggregateRating from real reviews for star ratings in search results
const sellerRef = () => ({ '@id': localBusinessEntityId() })

export function ProductSchema(
  product: ProductWithDetails,
  options?: {
    aggregateRating?: ProductAggregateRating | null
    /** Newest-first rows from `product_reviews`; first 5 become `review` in JSON-LD when aggregate exists. */
    reviewsForJsonLd?: ProductReviewRowForSchema[]
  }
) {
  const displayPrice = product.price || 0

  const imageUrls = sortProductImagesForSchema(product.images)
    .map((img) => toAbsoluteUrl(getImageUrl(img.image_url)))
    .filter(Boolean)

  const offers = {
    '@type': 'Offer',
    url: `${siteUrl}/products/${product.slug}`,
    priceCurrency: 'INR',
    price: displayPrice.toString(),
    availability: product.is_active
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: sellerRef(),
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/products/${product.slug}#product`,
    name: product.name,
    description: product.description || `${product.name} - Fancy dress costume available at Mod Fancy Dress`,
    image: imageUrls,
    brand: {
      '@type': 'Brand',
      name: 'Mod Fancy Dress',
    },
    category: product.category?.name || product.categories?.[0]?.category?.name || 'Fancy Dress Costume',
    sku: product.variants?.[0]?.sku || product.slug,
    offers: (() => {
      type OfferNode = {
        '@type': string
        url: string
        priceCurrency: string
        price: string
        availability: string
        itemCondition: string
        seller: ReturnType<typeof sellerRef>
        businessFunction?: string
        description?: string
      }

      const purchaseOffers: OfferNode[] = product.variants && product.variants.length > 0
        ? product.variants.map((variant) => ({
          '@type': 'Offer',
          url: `${siteUrl}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: (variant.price_override || product.price || 0).toString(),
          availability: product.is_active
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: sellerRef(),
        }))
        : [offers]

      if (product.rent_price) {
        purchaseOffers.push({
          '@type': 'Offer',
          url: `${siteUrl}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: product.rent_price.toString(),
          availability: product.is_active
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: sellerRef(),
          businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
          description: `Available on rent${product.rent_deposit ? `. Refundable deposit: ₹${product.rent_deposit}` : ''}`,
        })
      }

      return purchaseOffers
    })(),
    ...(options?.aggregateRating && options.aggregateRating.reviewCount >= 1
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.round(options.aggregateRating.ratingValue * 10) / 10,
            reviewCount: options.aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(options?.aggregateRating &&
    options.aggregateRating.reviewCount >= 1 &&
    options.reviewsForJsonLd?.length
      ? { review: buildProductReviewJsonLd(options.reviewsForJsonLd, 5, product.slug) }
      : {}),
  }
}

// Breadcrumb Schema — use absolute URLs so Google can show breadcrumbs in search results
export function BreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  }
}

/** FAQPage JSON-LD — use only on the dedicated /faq page (Google guidelines). */
export function FaqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

/** BlogPosting JSON-LD for individual blog post pages. */
export function BlogPostingSchema(post: {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  published_at: string
  updated_at: string
  cover_image_url?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt?.trim() || post.title,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: 'Piyush Arora',
      jobTitle: 'Founder',
      worksFor: {
        '@id': organizationEntityId(),
      },
    },
    publisher: {
      '@type': 'Organization',
      '@id': organizationEntityId(),
      name: 'Mod Fancy Dress',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/modfancydress-logo.png`,
      },
    },
    ...(post.cover_image_url ? { image: toAbsoluteUrl(post.cover_image_url) } : {}),
    isPartOf: {
      '@type': 'Blog',
      '@id': `${siteUrl}/blog`,
      name: 'Mod Fancy Dress Blog',
    },
  }
}

/** WebSite + SearchAction JSON-LD for the homepage sitelinks search box. */
export function WebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'Mod Fancy Dress',
    description: 'Fancy dress costumes and accessories — Delhi NCR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
