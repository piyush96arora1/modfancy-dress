import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getBlogPostBySlugCached,
  getPublishedBlogSlugsCached,
} from '@/lib/supabase/cached-queries'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema, BlogPostingSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { BlogContent } from '@/components/public/BlogContent'
import { getFaqsForBlog } from '@/lib/faqs/queries'
import { FaqSection } from '@/components/public/FaqSection'
import { OccasionGuideTable } from '@/components/public/seo-tables/OccasionGuideTable'
import { ClassicalDanceComparisonTable } from '@/components/public/seo-tables/ClassicalDanceComparisonTable'
import { BLOG_SLUG_ANNUAL_FUNCTION, BLOG_SLUG_CLASSICAL_DANCE, BLOG_SLUG_RENT_GUIDE, BLOG_SLUG_RENT_VS_BUY } from '@/lib/blog/seo-post-slugs'
import type { BlogPost } from '@/types/database'

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

  return generatePageMetadata({
    title: post.title,
    description: post.excerpt || undefined,
    path: `/blog/${slug}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlugCached(slug)

  if (!post) notFound()

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
    cover_image_url: (post as any).cover_image_url ?? null,
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
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
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

        <div className="prose prose-sm max-w-none">
          <BlogContent content={(post as BlogPost).content} />
        </div>

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
              <Link href="/faq" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
                View all FAQs →
              </Link>
            </p>
          </div>
        )}

        <footer className="mt-10 pt-6 border-t border-[#E8E5E0] space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
              Shop fancy dress costumes →
            </Link>
            <Link href="/rent" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
              Rent costumes →
            </Link>
            <Link href="/wholesale" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
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
