import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { BlogContent } from '@/components/public/BlogContent'
import type { BlogPost } from '@/types/database'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, published_at')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

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
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

  if (!post) notFound()

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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

        <footer className="mt-10 pt-6 border-t border-[#E8E5E0] space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
              Shop fancy dress costumes →
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
