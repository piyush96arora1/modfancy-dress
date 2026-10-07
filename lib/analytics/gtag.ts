/**
 * GA4 event helpers. Measurement plan: docs/analytics/ga4-measurement-plan.md
 *
 * Calls queue until gtag.js loads, and are dropped harmlessly if it never does (ad-blockers),
 * so callers never need to guard. Never pass name, phone, email or address — GA4 bans PII.
 */

// A measurement ID is public (it ships in every page's HTML), so the fallback lives in code.
// The env var exists only to point a preview deployment at a separate property.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-WEKY2VM8CJ'

export type LeadIntent = 'buy' | 'rent' | 'wholesale' | 'general'

export interface GaItem {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price?: number
  quantity?: number
}

type GtagFn = (...args: unknown[]) => void
type GaWindow = Window & { dataLayer?: unknown[]; gtag?: GtagFn }

/**
 * Sets up the dataLayer queue and config the first time anything is tracked. gtag.js itself
 * loads lazily (idle time, see GoogleAnalytics.tsx) and replays this queue in order, so no
 * event is lost while the ~500 KB script is still waiting — and it never competes with LCP.
 */
function gtag(): GtagFn | null {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return null
  const w = window as GaWindow
  if (!w.gtag) {
    w.dataLayer = w.dataLayer || []
    // gtag.js only accepts the `arguments` object, not an array.
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments)
    }
    w.gtag('js', new Date())
    try {
      const mode = localStorage.getItem('modfancy_pricing_mode')
      if (mode) w.gtag('set', 'user_properties', { pricing_mode: mode })
    } catch {}
    w.gtag('config', GA_MEASUREMENT_ID)
  }
  return w.gtag
}

/** Queues config (and so the page_view). Called once from GoogleAnalytics on mount. */
export function initGtag(): void {
  gtag()
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  gtag()?.('event', event, params)
}

export function setUserProperties(props: Record<string, unknown>): void {
  gtag()?.('set', 'user_properties', props)
}

/** INR value + items, the shape every GA4 ecommerce event expects. */
export function ecommerce(items: GaItem[]): { currency: 'INR'; value: number; items: GaItem[] } {
  const value = items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0)
  return { currency: 'INR', value, items }
}

/**
 * Buy / rent / wholesale for a WhatsApp or phone click. The pre-filled wa.me text is the
 * most reliable signal (each CTA writes its own message), then the page the click came from.
 */
export function inferLeadIntent(href: string, pathname: string): LeadIntent {
  let text = ''
  try {
    text = (new URL(href).searchParams.get('text') ?? '').toLowerCase()
  } catch {}
  const haystack = `${text} ${pathname.toLowerCase()}`
  if (/\brent|kiraye|on hire/.test(haystack)) return 'rent'
  if (/wholesale|bulk|reseller|school|academ|pieces/.test(haystack)) return 'wholesale'
  if (pathname.startsWith('/products/') || /\bbuy|order|price/.test(text)) return 'buy'
  return 'general'
}
