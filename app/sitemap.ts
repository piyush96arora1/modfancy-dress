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
    .select('slug, updated_at')
    .eq('is_active', true)

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

  const categoryUrls = categories?.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(category.updated_at),
  })) || []

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
    { url: `${baseUrl}/wholesale`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/rent`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/faq`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/returns`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-noida`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-gurgaon`, lastModified: new Date('2026-03-28') },
    { url: `${baseUrl}/fancy-dress-delhi`, lastModified: new Date('2026-04-14') },
    { url: `${baseUrl}/wholesale/schools`, lastModified: new Date('2026-04-14') },
    { url: `${baseUrl}/compare/local-vs-online`, lastModified: new Date('2026-04-14') },
  ]

  // wholesaleCategoryUrls intentionally excluded — those pages canonical to
  // /category/<slug> and are noindex'd to eliminate duplicate-content drag.
  void wholesaleCategoryUrls

  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...blogUrls,
  ]
}
