import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ChevronRight } from 'lucide-react'
import type { BlogPost } from '@/types/database'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Ideas & Costume Guides for School Functions',
  description: 'Easy fancy dress ideas for school annual function, Republic Day, Navratri and more. Kathak, Bharatnatyam, Garba costume guides. Parent-to-parent tips from Mod Fancy Dress Delhi.',
  path: '/blog',
  type: 'article',
})

export default async function BlogListPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, language, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  const english = (posts || []).filter((p) => (p as BlogPost).language === 'en')
  const hindi = (posts || []).filter((p) => (p as BlogPost).language === 'hi')

  return (
    <div className="fade-in">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
        <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-[#2D2D2D]">Blog</span>
      </nav>

      <header className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">
          Fancy Dress Ideas & Costume Guides
        </h1>
        <p className="text-sm text-[#6B6B6B] max-w-2xl">
          Practical ideas and guides for school annual functions, Republic Day, Navratri, Kathak, Garba and more. Written in a simple, parent-to-parent tone.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/products" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
            Browse costumes →
          </Link>
          <Link href="/wholesale" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
            Wholesale / bulk orders →
          </Link>
        </div>
      </header>

      {english.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">English</h2>
          <ul className="space-y-4">
            {english.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-4 rounded-xl border border-[#E8E5E0] bg-white hover:border-[#C8956C]/40 hover:bg-[#FAFAF8] transition-colors"
                >
                  <h3 className="font-semibold text-[#1B2A4A] mb-1 font-[family-name:var(--font-outfit)]">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-[#6B6B6B] line-clamp-2">{post.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hindi.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">Hindi</h2>
          <ul className="space-y-4">
            {hindi.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-4 rounded-xl border border-[#E8E5E0] bg-white hover:border-[#C8956C]/40 hover:bg-[#FAFAF8] transition-colors"
                >
                  <h3 className="font-semibold text-[#1B2A4A] mb-1 font-[family-name:var(--font-outfit)]">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-[#6B6B6B] line-clamp-2">{post.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(!posts || posts.length === 0) && (
        <p className="text-[#6B6B6B] text-sm">No blog posts yet. Check back soon.</p>
      )}
    </div>
  )
}
