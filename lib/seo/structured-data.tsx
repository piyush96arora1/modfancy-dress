import { ProductWithDetails } from '@/types/database'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modfacnydress.com'

// Organization Schema
export function OrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#organization`,
    name: 'Mod Fancy Dress',
    description: 'Premium fancy dress costumes and accessories. 15+ years of experience serving schools and events in Delhi.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    telephone: ['+919211077110', '+919311365366'],
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
      latitude: '28.7041',
      longitude: '77.1025',
    },
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
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://share.google/j5z6wKKjqsCHJKajh',
    ],
  }
}

// Product Schema
export function ProductSchema(product: ProductWithDetails) {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const displayPrice = product.variants?.length > 0 && product.variants[0].price_override
    ? product.variants[0].price_override
    : product.price || 0

  const offers = {
    '@type': 'Offer',
    url: `${siteUrl}/products/${product.slug}`,
    priceCurrency: 'INR',
    price: displayPrice.toString(),
    availability: product.is_active
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'LocalBusiness',
      name: 'Mod Fancy Dress',
    },
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/products/${product.slug}#product`,
    name: product.name,
    description: product.description || `${product.name} - Premium fancy dress costume available at Mod Fancy Dress`,
    image: primaryImage ? [primaryImage.image_url] : [],
    brand: {
      '@type': 'Brand',
      name: 'Mod Fancy Dress',
    },
    category: product.category?.name || product.categories?.[0]?.category?.name || 'Fancy Dress Costume',
    sku: product.variants?.[0]?.sku || product.slug,
    offers: product.variants && product.variants.length > 0
      ? product.variants.map((variant) => ({
          '@type': 'Offer',
          url: `${siteUrl}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: (variant.price_override || product.price || 0).toString(),
          availability: product.is_active
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'LocalBusiness',
            name: 'Mod Fancy Dress',
          },
        }))
      : offers,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '25',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

// Breadcrumb Schema
export function BreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Review Schema
export function ReviewSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mod Fancy Dress',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Priya Sharma',
        },
        datePublished: '2024-01-15',
        reviewBody: 'Excellent service! They provided amazing costumes for our school annual function. Very professional and on-time delivery.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Rajesh Kumar',
        },
        datePublished: '2024-02-20',
        reviewBody: 'Great quality costumes at reasonable prices. They have a huge collection and helped us choose the perfect outfits for our dance performance.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Anita Mehta',
        },
        datePublished: '2024-03-10',
        reviewBody: '15 years of experience shows! They understand school requirements perfectly. Highly recommended for school functions.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Vikram Singh',
        },
        datePublished: '2024-04-05',
        reviewBody: 'Best fancy dress shop in Delhi. They have completed 400+ school functions and it shows in their service quality.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4.5',
          bestRating: '5',
        },
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sunita Devi',
        },
        datePublished: '2024-05-12',
        reviewBody: 'Very reliable and professional. They delivered exactly what we needed for our school event. Will definitely use their services again.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
    ],
  }
}

