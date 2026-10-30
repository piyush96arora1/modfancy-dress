'use client'

/**
 * Razorpay's checkout script is loaded only when the customer taps Pay, so no other page and
 * no first visit to /cart pays for it. A preconnect is added on the first focus inside the
 * checkout form so the tap-to-checkout gap stays short.
 *
 * redirect: true with a callback_url: after paying, Razorpay posts the result to our callback
 * route, which sends the customer to /order/<n>?t=…. On phones the customer leaves for
 * GPay/PhonePe and comes back; a full-page redirect survives Android killing the background
 * tab, where an in-page handler would be lost.
 */

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js'

/** The `payment` object /api/checkout and /api/checkout/retry return (see PaymentHandoff). */
export type PaymentHandoff = {
  gateway: 'razorpay'
  keyId: string
  orderId: string
  amount: number
  currency: 'INR'
  description: string
  callbackUrl: string
  prefill: { name: string; contact: string; email?: string }
}

type RazorpayInstance = { open: () => void; on: (event: string, cb: (res: unknown) => void) => void }
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance

let sdkPromise: Promise<RazorpayConstructor> | null = null

export function preconnectPayments(): void {
  if (typeof document === 'undefined' || document.querySelector('link[data-pay-preconnect]')) return
  for (const href of ['https://checkout.razorpay.com', 'https://api.razorpay.com']) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.crossOrigin = 'anonymous'
    link.dataset.payPreconnect = ''
    document.head.appendChild(link)
  }
}

export function loadPayments(): Promise<RazorpayConstructor> {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    const w = window as unknown as { Razorpay?: RazorpayConstructor }
    if (w.Razorpay) return resolve(w.Razorpay)
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error('Razorpay SDK missing')))
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.head.appendChild(script)
  }).catch((error) => {
    sdkPromise = null // let the next tap try again (flaky mobile network)
    throw error
  })
  return sdkPromise
}

/**
 * Opens Razorpay Checkout. While it is open the promise stays pending: paying (or failing)
 * redirects the page to the callback. It resolves only when the customer closes Checkout
 * without paying ('dismissed'), so the caller can send them to their order page.
 */
export async function openPaymentCheckout(
  payment: PaymentHandoff,
  sdk: Promise<RazorpayConstructor> = loadPayments(),
): Promise<'dismissed'> {
  const Razorpay = await sdk
  return new Promise((resolve) => {
    const rzp = new Razorpay({
      key: payment.keyId,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'Mod Fancy Dress',
      description: payment.description,
      prefill: payment.prefill,
      callback_url: payment.callbackUrl,
      redirect: true,
      theme: { color: '#1B2A4A' },
      modal: { ondismiss: () => resolve('dismissed') },
    })
    rzp.open()
  })
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
