/**
 * Admin-side: push a saved edit to the public site. Pages regenerate only weekly
 * on their own, so every admin save that changes public data calls this.
 * Uses the admin's session cookie; see app/api/revalidate/route.ts for scopes.
 */
export function revalidateSite(scope: 'catalog' | 'home' = 'catalog'): Promise<unknown> {
  return fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scope === 'home' ? {} : { scope }),
  }).catch(() => {})
}
