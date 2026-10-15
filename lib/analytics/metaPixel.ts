/**
 * Meta Pixel ("Mod Fancy Dress Pixel" dataset in the Mod Fancy Dresses business portfolio).
 *
 * Mirrors gtag.ts: calls queue in a local fbq stub and fbevents.js is fetched lazily by
 * GoogleAnalytics.tsx alongside gtag.js, so the pixel never touches LCP/TBT/INP. GA4 events
 * are translated to Meta standard events in one place (toMetaEvent), so call sites only ever
 * call track() from gtag.ts.
 *
 * content_ids are product UUIDs — the same ids the catalogue feed (/api/meta-catalog) uses,
 * which is what lets Meta match events to catalogue items for retargeting.
 */

// A pixel id is public (it ships in every page's HTML), so it lives in code like the GA id.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1621066439376823'

export const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js'

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: FbqFn
  loaded: boolean
  version: string
}
type FbWindow = Window & { fbq?: FbqFn; _fbq?: FbqFn }

/** Meta's standard stub, without its script injection (GoogleAnalytics.tsx does that lazily). */
function fbq(): FbqFn | null {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return null
  const w = window as FbWindow
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args)
      else n.queue.push(args)
    } as FbqFn
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    w.fbq = n
    if (!w._fbq) w._fbq = n
    n('init', META_PIXEL_ID)
    n('track', 'PageView')
  }
  return w.fbq
}

/** Queues init + the first PageView. Later client navigations are tracked by fbevents.js itself. */
export function initFbq(): void {
  fbq()
}

interface ItemLike {
  item_id?: string
  quantity?: number
}

/** GA4 event + params → Meta standard event + params, or null for events Meta doesn't need. */
function toMetaEvent(
  event: string,
  params: Record<string, unknown>,
): [string, Record<string, unknown>] | null {
  const items = (params.items as ItemLike[] | undefined) ?? []
  const ids = items.map((i) => i.item_id).filter(Boolean)
  const commerce = ids.length
    ? {
        content_ids: ids,
        content_type: 'product',
        contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity ?? 1 })),
        currency: params.currency ?? 'INR',
        value: params.value ?? 0,
      }
    : {}

  switch (event) {
    case 'view_item':
      return ['ViewContent', commerce]
    case 'add_to_cart':
      return ['AddToCart', commerce]
    case 'add_to_wishlist':
      return ['AddToWishlist', commerce]
    case 'begin_checkout':
      return ['InitiateCheckout', { ...commerce, num_items: items.length }]
    case 'purchase':
      return ['Purchase', { ...commerce, currency: 'INR', value: params.value ?? 0 }]
    case 'generate_lead':
      return ['Lead', commerce]
    case 'search':
      return ['Search', { search_string: params.search_term }]
    case 'whatsapp_click':
    case 'phone_click':
      // Contact is the event the "Leads"/"Engagement" ad objectives optimise for.
      return ['Contact', { content_category: params.lead_intent, method: event === 'whatsapp_click' ? 'whatsapp' : 'phone' }]
    default:
      return null
  }
}

/** Called from gtag.ts track(); never pass name, phone, email or address. */
export function trackMeta(event: string, params: Record<string, unknown> = {}): void {
  const mapped = toMetaEvent(event, params)
  if (mapped) fbq()?.('track', mapped[0], mapped[1])
}
