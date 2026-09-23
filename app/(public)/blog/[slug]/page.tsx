import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getBlogPostBySlugCached,
  getCategoryBySlugCached,
  getProductsForCategoryCached,
  getPublishedBlogSlugsCached,
} from '@/lib/supabase/cached-queries'
import { getCategorySlugsForGuideCached } from '@/lib/supabase/cached-seo-queries'
import { interleaveGuideProducts } from '@/lib/utils/guide-products'
import { getImageUrl } from '@/lib/imageUrl'
import { ProductGrid } from '@/components/public/ProductGrid'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema, BlogPostingSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { BlogContent } from '@/components/public/BlogContent'
import { getFaqsForBlog } from '@/lib/faqs/queries'
import { FaqSection } from '@/components/public/FaqSection'
import { OccasionGuideTable } from '@/components/public/seo-tables/OccasionGuideTable'
import { ClassicalDanceComparisonTable } from '@/components/public/seo-tables/ClassicalDanceComparisonTable'
import { BLOG_SLUG_ANNUAL_FUNCTION, BLOG_SLUG_CLASSICAL_DANCE, BLOG_SLUG_RENT_GUIDE, BLOG_SLUG_RENT_VS_BUY } from '@/lib/blog/seo-post-slugs'
import type { BlogPost, ProductWithDetails } from '@/types/database'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugsCached()
  return slugs.map((slug) => ({ slug }))
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlugCached(slug)

  if (!post) return { title: 'Post Not Found' }

  const cover = (post as BlogPost).cover_image_url
  return generatePageMetadata({
    title: post.title,
    description: post.excerpt || undefined,
    path: `/blog/${slug}`,
    type: 'article',
    image: cover ? getImageUrl(cover) : undefined,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlugCached(slug)

  if (!post) notFound()

  const coverImageUrl = (post as BlogPost).cover_image_url ? getImageUrl((post as BlogPost).cover_image_url!) : null

  // "Shop this guide": the post's own related categories, else the categories
  // that name this post as their guide. Live products only (cached category query).
  const relatedSlugs = (post as BlogPost).related_category_slugs ?? []
  const guideCategorySlugs = relatedSlugs.length > 0 ? relatedSlugs : await getCategorySlugsForGuideCached(slug)
  const guideCategoryLists = await Promise.all(
    guideCategorySlugs.map(async (categorySlug) => {
      const category = await getCategoryBySlugCached(categorySlug)
      return category ? (((await getProductsForCategoryCached(category.id)) ?? []) as ProductWithDetails[]) : []
    })
  )
  const shopProducts = interleaveGuideProducts(guideCategoryLists, 8)
  const shopAllHref = guideCategorySlugs.length > 0 ? `/category/${guideCategorySlugs[0]}` : '/products'

  const blogFaqs = await getFaqsForBlog()

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ])

  const blogPostingSchema = BlogPostingSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    content: (post as BlogPost).content ?? null,
    published_at: post.published_at as string,
    updated_at: post.updated_at,
    cover_image_url: coverImageUrl,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <article className="fade-in max-w-3xl">
        <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-4 md:mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/blog" className="hover:text-[#1B2A4A] transition-colors">Blog</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D] truncate">{post.title}</span>
        </nav>

        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] leading-tight">
            {post.title}
          </h1>
        </header>

        {coverImageUrl && (
          // The LCP element on a post: eager + high priority, fixed aspect box so
          // nothing shifts while it loads. Plain <img>: next/image optimisation is off.
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-xl bg-[#F5F3F0] mb-6 md:mb-8">
            <img
              src={coverImageUrl}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-contain"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          <BlogContent content={(post as BlogPost).content} />
        </div>

        {shopProducts.length > 0 && (
          <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0] not-prose" aria-labelledby="blog-shop-heading">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2
                id="blog-shop-heading"
                className="text-lg md:text-xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]"
              >
                Shop this guide
              </h2>
              <Link href={shopAllHref} className="shrink-0 text-sm font-medium text-[#8F6240] hover:text-[#7F5636] transition-colors">
                View all →
              </Link>
            </div>
            <ProductGrid products={shopProducts} productTitleTag="h3" />
          </section>
        )}

        {slug === BLOG_SLUG_ANNUAL_FUNCTION && (
          <div className="mt-10 not-prose">
            <OccasionGuideTable headingId={`blog-annual-occasion-${slug}`} />
          </div>
        )}

        {slug === BLOG_SLUG_CLASSICAL_DANCE && (
          <div className="mt-10 not-prose">
            <ClassicalDanceComparisonTable headingId={`blog-classical-compare-${slug}`} />
          </div>
        )}

        {blogFaqs.length > 0 && (
          <div className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-[#E8E5E0]">
            <FaqSection
              title="Common questions"
              headingId="blog-faq-heading"
              items={blogFaqs.map(({ id, question, answer }) => ({ id, question, answer }))}
            />
            <p className="mt-4 text-center">
              <Link href="/faq" className="text-sm font-medium text-[#8F6240] hover:text-[#7F5636] transition-colors">
                View all FAQs →
              </Link>
            </p>
          </div>
        )}

        <footer className="mt-10 pt-6 border-t border-[#E8E5E0] space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="text-sm font-medium text-[#8F6240] hover:text-[#7F5636] transition-colors">
              Shop fancy dress costumes →
            </Link>
            <Link href="/rent" className="text-sm font-medium text-[#8F6240] hover:text-[#7F5636] transition-colors">
              Rent costumes →
            </Link>
            <Link href="/wholesale" className="text-sm font-medium text-[#8F6240] hover:text-[#7F5636] transition-colors">
              Wholesale / bulk orders →
            </Link>
          </div>
          <Link href="/blog" className="inline-block text-sm text-[#6B6B6B] hover:text-[#1B2A4A] transition-colors">
            ← Back to all posts
          </Link>
        </footer>
      </article>
    </>
  )
}
