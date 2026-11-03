import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * On-demand revalidation. Pages regenerate only weekly on their own (ISR writes
 * on the Hobby plan: daily regeneration of ~800 pages blew through the allowance
 * in Oct 2026), so every edit has to be pushed through here to go live.
 *
 * Callers: an admin session (admin panel saves), or a data script sending
 * `Authorization: Bearer $REVALIDATE_SECRET` (scripts/lib/revalidate.ts).
 *
 * - default (no body): the homepage — homepage sections and banners.
 * - `{ scope: 'catalog' }`: product, category, wholesale-catalogue and settings
 *   data plus the listing pages — product/category saves, price and copy scripts.
 * - `{ scope: 'content' }`: blog posts and FAQs.
 */
const CATALOG_TAGS = ['products', 'categories', 'reviews', 'catalog', 'settings']
const CONTENT_TAGS = ['blog', 'faqs']

function hasScriptSecret(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET
  const header = request.headers.get('authorization') ?? ''
  if (!secret || !header.startsWith('Bearer ')) return false
  const given = Buffer.from(header.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'admin'
}

export async function POST(request: Request) {
  if (!hasScriptSecret(request) && !(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  if (body?.scope === 'catalog') {
    for (const tag of CATALOG_TAGS) revalidateTag(tag, { expire: 3600 })
    revalidatePath('/products')
    revalidatePath('/wholesale')
    revalidatePath('/')
    return NextResponse.json({ revalidated: true, scope: 'catalog' })
  }

  if (body?.scope === 'content') {
    for (const tag of CONTENT_TAGS) revalidateTag(tag, { expire: 3600 })
    revalidatePath('/blog')
    revalidatePath('/faq')
    return NextResponse.json({ revalidated: true, scope: 'content' })
  }

  // Purge the cached sections config, then regenerate the homepage HTML.
  revalidateTag('homepage-sections', { expire: 3600 })
  revalidatePath('/')

  return NextResponse.json({ revalidated: true })
}
