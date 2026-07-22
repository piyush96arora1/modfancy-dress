import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import type { Faq } from '@/types/database'

/** All published FAQs (for /faq + FAQPage schema), ordered for display. */
export async function getFaqsForFaqPage(): Promise<Faq[]> {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[faqs] getFaqsForFaqPage:', error.message, error)
    return []
  }
  return (data ?? []) as Faq[]
}

/**
 * Cached wrapper so the /faq page renders as ISR instead of dynamic.
 * 24h cache; invalidate via revalidateTag('faqs') if an admin FAQ editor is added.
 */
export const getFaqsForFaqPageCached = unstable_cache(
  getFaqsForFaqPage,
  ['faqs-for-faq-page'],
  { revalidate: 86400, tags: ['faqs'] }
)

/** Curated subset for blog post footers (`show_on_blog`). */
export async function getFaqsForBlog(): Promise<Faq[]> {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .eq('show_on_blog', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[faqs] getFaqsForBlog:', error.message, error)
    return []
  }
  return (data ?? []) as Faq[]
}

/**
 * `show_on_category` plus optional `category_slugs`: when the array is non-empty,
 * the FAQ only appears on those category slugs; when null/empty, it appears on every category page.
 */
export function filterFaqsForCategorySlug(faqs: Faq[], categorySlug: string): Faq[] {
  return faqs.filter((f) => {
    if (!f.show_on_category) return false
    const slugs = f.category_slugs
    if (!slugs?.length) return true
    return slugs.includes(categorySlug)
  })
}

/** Published rows flagged for category pages, filtered by current category slug. */
export async function getFaqsForCategoryPage(categorySlug: string): Promise<Faq[]> {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .eq('show_on_category', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[faqs] getFaqsForCategoryPage:', error.message, error)
    return []
  }
  return filterFaqsForCategorySlug((data ?? []) as Faq[], categorySlug)
}
