/**
 * Push a data-script edit live. Pages regenerate only weekly on their own, so a
 * script that writes products, prices, copy or photos must call this after it
 * applies, or the site keeps showing the old data for up to a week.
 *
 * Needs REVALIDATE_SECRET in .env.local, matching the Vercel production env.
 * Without it this only warns: the write itself already succeeded.
 */
export type RevalidateScope = 'catalog' | 'content' | 'home'

const SITE_URL = process.env.REVALIDATE_SITE_URL || 'https://www.modfancydress.com'

export async function revalidateSite(scope: RevalidateScope = 'catalog'): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.warn(`\n⚠ REVALIDATE_SECRET is not set: run POST /api/revalidate {scope:'${scope}'} or the change shows within a week.`)
    return
  }
  const res = await fetch(`${SITE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
    body: JSON.stringify(scope === 'home' ? {} : { scope }),
  })
  if (!res.ok) {
    console.warn(`\n⚠ Revalidate (${scope}) failed: HTTP ${res.status}. The change shows within a week.`)
    return
  }
  console.log(`\n✓ Revalidated ${scope} on ${SITE_URL}`)
}
