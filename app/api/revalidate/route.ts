import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin-only on-demand revalidation of the homepage. Called after saving
 * homepage sections so occasion swaps go live immediately instead of waiting
 * for the 24h ISR window. Auth is enforced via the caller's Supabase session
 * cookie (admin role required).
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Purge the cached sections config, then regenerate the homepage HTML.
  revalidateTag('homepage-sections', { expire: 3600 })
  revalidatePath('/')

  return NextResponse.json({ revalidated: true })
}
