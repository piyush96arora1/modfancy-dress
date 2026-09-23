import { MetadataRoute } from 'next'
import { createPublicServerClient } from '@/lib/supabase/public-server'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicServerClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .is('deleted_at', null)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, updated_at')
    .eq('is_active', true)

  // Category ids that actually have products — keeps empty categories out of the
  // sitemap (index-bloat prevention). A category counts if it has any junction row
  // or is the primary category of an active product.
  const { data: junctionRows } = await supabase
    .from('product_categories')
    .select('category_id')
  const { data: primaryRows } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true)
    .is('deleted_at', null)
    .not('category_id', 'is', null)
  const nonEmptyCategoryIds = new Set<string>([
    ...(junctionRows || []).map((r) => r.category_id as string),
    ...(primaryRows || []).map((r) => r.category_id as string),
  ])

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .not('published_at', 'is', null)

  const productUrls = products?.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
  })) || []

  const wholesaleProductUrls = products?.map((product) => ({
    url: `${baseUrl}/wholesale/${product.slug}`,
    lastModified: new Date(product.updated_at),
  })) || []

  const categoryUrls = (categories || [])
    .filter((category) => nonEmptyCategoryIds.has(category.id as string))
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(category.updated_at),
    }))

  const wholesaleCategoryUrls = categories?.map((category) => ({
    url: `${baseUrl}/wholesale/category/${category.slug}`,
    lastModified: new Date(category.updated_at),
  })) || []

  const blogUrls = blogPosts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  })) || []

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/products`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/wholesale`, lastModified: new Date('2026-08-08') },
    { url: `${baseUrl}/rent`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/faq`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/returns`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-noida`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-gurgaon`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-ghaziabad`, lastModified: new Date('2026-09-23') },
    { url: `${baseUrl}/fancy-dress-delhi`, lastModified: new Date('2026-04-14') },
    { url: `${baseUrl}/wholesale/schools`, lastModified: new Date('2026-04-14') },
    { url: `${baseUrl}/wholesale/delhi-market`, lastModified: new Date('2026-08-08') },
    { url: `${baseUrl}/wholesale/resellers`, lastModified: new Date('2026-08-08') },
    { url: `${baseUrl}/wholesale/dance-academies`, lastModified: new Date('2026-08-08') },
    { url: `${baseUrl}/compare/local-vs-online`, lastModified: new Date('2026-04-14') },
  ]

  // Wholesale URLs intentionally excluded from the sitemap: /wholesale/<slug>
  // canonicals to /products/<slug> and /wholesale/category/<slug> canonicals to
  // /category/<slug>. Listing a canonicalised URL in the sitemap contradicts its
  // own canonical tag, so only the retail equivalents are submitted. The
  // hand-written wholesale landing pages (/wholesale and its /schools,
  // /delhi-market, /resellers, /dance-academies children) carry self-referencing
  // canonicals and unique content, so they ARE listed in staticPages above.
  void wholesaleProductUrls
  void wholesaleCategoryUrls

  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...blogUrls,
  ]
}
