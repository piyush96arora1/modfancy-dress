import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin-only on-demand revalidation. Auth is enforced via the caller's Supabase
 * session cookie (admin role required).
 *
 * - default (no body): the homepage — called after saving homepage sections so
 *   occasion swaps go live immediately instead of waiting for the 24h ISR window.
 * - `{ scope: 'catalog' }`: product data and the listing pages — called after a
 *   product save. /products and /wholesale regenerate only daily to stay inside
 *   the Hobby plan's ISR-write allowance (hourly regeneration of those ~750KB
 *   pages was the largest ISR write cost, Sep 2026), so edits are pushed here.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  if (body?.scope === 'catalog') {
    revalidateTag('products', { expire: 3600 })
    revalidateTag('categories', { expire: 3600 })
    revalidatePath('/products')
    revalidatePath('/wholesale')
    revalidatePath('/')
    return NextResponse.json({ revalidated: true, scope: 'catalog' })
  }

  // Purge the cached sections config, then regenerate the homepage HTML.
  revalidateTag('homepage-sections', { expire: 3600 })
  revalidatePath('/')

  return NextResponse.json({ revalidated: true })
}
