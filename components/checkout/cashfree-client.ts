'use client'

/**
 * Cashfree's checkout script (~18 KB gzipped) is loaded only when the customer taps Pay, so
 * no other page and no first visit to /cart pays for it. A preconnect is added on the first
 * focus inside the checkout form so the tap-to-checkout gap stays short.
 *
 * redirectTarget '_self': Cashfree's full-page checkout. On phones the customer leaves for
 * GPay/PhonePe and comes back; a full page survives Android killing the background tab,
 * where a modal's state would not. Cashfree then returns to /order/<n>?t=… (return_url).
 */

const SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js'

type CashfreeInstance = {
  checkout: (opts: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_modal' }) => Promise<{
    error?: { message?: string }
    redirect?: boolean
  }>
}
type CashfreeFactory = (opts: { mode: 'sandbox' | 'production' }) => CashfreeInstance

let sdkPromise: Promise<CashfreeFactory> | null = null

export function preconnectCashfree(): void {
  if (typeof document === 'undefined' || document.querySelector('link[data-cf-preconnect]')) return
  for (const href of ['https://sdk.cashfree.com', 'https://api.cashfree.com']) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.crossOrigin = 'anonymous'
    link.dataset.cfPreconnect = ''
    document.head.appendChild(link)
  }
}

export function loadCashfree(): Promise<CashfreeFactory> {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<CashfreeFactory>((resolve, reject) => {
    const w = window as unknown as { Cashfree?: CashfreeFactory }
    if (w.Cashfree) return resolve(w.Cashfree)
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => (w.Cashfree ? resolve(w.Cashfree) : reject(new Error('Cashfree SDK missing')))
    script.onerror = () => reject(new Error('Cashfree SDK failed to load'))
    document.head.appendChild(script)
  }).catch((error) => {
    sdkPromise = null // let the next tap try again (flaky mobile network)
    throw error
  })
  return sdkPromise
}

/** Opens Cashfree's checkout page. Resolves only if the redirect did not happen. */
export async function openCashfreeCheckout(
  paymentSessionId: string,
  mode: 'sandbox' | 'production',
  sdk: Promise<CashfreeFactory> = loadCashfree(),
): Promise<string | null> {
  const factory = await sdk
  const result = await factory({ mode }).checkout({ paymentSessionId, redirectTarget: '_self' })
  return result?.error ? result.error.message || 'Could not open the payment page' : null
}

/** Order the customer is paying for, so /cart can offer "finish paying" if they come back. */
export const PENDING_ORDER_KEY = 'mfd-pending-order'

export type PendingOrder = { orderNumber: string; token: string; total: number; at: number }

export function savePendingOrder(p: PendingOrder): void {
  try {
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(p))
  } catch {}
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PendingOrder
    // Older than two days: stale, the order page/track flow covers it.
    return Date.now() - p.at < 2 * 24 * 3600_000 ? p : null
  } catch {
    return null
  }
}

export function clearPendingOrder(orderNumber?: string): void {
  try {
    if (!orderNumber || readPendingOrder()?.orderNumber === orderNumber) localStorage.removeItem(PENDING_ORDER_KEY)
  } catch {}
}
