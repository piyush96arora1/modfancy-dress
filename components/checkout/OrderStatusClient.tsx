'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, Copy, Check, Truck, Bike, Store, ShieldCheck, PackageCheck } from 'lucide-react'
import type { PublicOrderView } from '@/lib/checkout/orders'
import { useCart } from '@/lib/store/cart'
import { track } from '@/lib/analytics/gtag'
import { whatsappUrl } from '@/lib/constants/contact'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { SHOP_PICKUP_LABEL } from '@/lib/delivery/config'
import { cn } from '@/lib/utils/cn'
import { clearPendingOrder, loadCashfree, openCashfreeCheckout, readPendingOrder, savePendingOrder } from './cashfree-client'

type Progress = { attempted: boolean; bankPending: boolean }
type Status = { paymentStatus: PublicOrderView['paymentStatus']; status: PublicOrderView['status']; paymentMethod: PublicOrderView['paymentMethod'] } & Progress

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/** Poll quickly at first (most UPI payments settle in seconds), then back off. */
function pollDelay(elapsedMs: number): number | null {
  if (elapsedMs < 60_000) return 3_000
  if (elapsedMs < 10 * 60_000) return 10_000
  if (elapsedMs < 30 * 60_000) return 30_000
  return null
}

export function OrderStatusClient({ initial, initialProgress, token }: { initial: PublicOrderView; initialProgress: Progress; token: string }) {
  const [s, setS] = useState<Status>({
    paymentStatus: initial.paymentStatus,
    status: initial.status,
    paymentMethod: initial.paymentMethod,
    ...initialProgress,
  })
  const [checks, setChecks] = useState(0)
  const [busy, setBusy] = useState<null | 'pay' | 'pay_later'>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const started = useRef(Date.now())
  const order = initial
  const clearCart = useCart((st) => st.clearCart)

  const waiting = s.paymentStatus === 'awaiting_payment'

  // Arriving from the cart's submit button (far down the page): start at the outcome.
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Keep asking while the payment is unsettled. The API asks Cashfree directly, so this
  // works even if Cashfree's webhook to us is slow.
  useEffect(() => {
    if (!waiting) return
    const delay = pollDelay(Date.now() - started.current)
    if (delay == null) return
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${order.orderNumber}/status?t=${encodeURIComponent(token)}`, { cache: 'no-store' })
        if (res.ok) setS(await res.json())
      } catch {}
      setChecks((c) => c + 1)
    }, delay)
    return () => clearTimeout(timer)
  }, [waiting, checks, order.orderNumber, token])

  // Also re-check the moment the customer comes back from their UPI app.
  useEffect(() => {
    if (!waiting) return
    const onVisible = () => { if (document.visibilityState === 'visible') setChecks((c) => c + 1) }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [waiting])

  // Paid or placed: the cart has done its job. Analytics fire once per order, ever.
  useEffect(() => {
    const done = s.paymentStatus === 'paid' || (s.paymentMethod === 'pay_later' && s.paymentStatus === 'unpaid')
    if (!done) return
    if (readPendingOrder()?.orderNumber === order.orderNumber) {
      clearCart()
      clearPendingOrder(order.orderNumber)
      try { localStorage.removeItem('mfd-checkout-draft') } catch {}
    }
    if (s.paymentStatus !== 'paid') return
    const key = `mfd-purchase-sent:${order.orderNumber}`
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
    } catch {}
    track('purchase', {
      transaction_id: order.orderNumber,
      currency: 'INR',
      value: order.total,
      shipping: order.deliveryFee,
      items: order.items.map((i, n) => ({ item_id: `${order.orderNumber}-${n}`, item_name: i.name, item_variant: i.size ?? undefined, price: i.price, quantity: i.quantity })),
    })
  }, [s.paymentStatus, s.paymentMethod, order, clearCart])

  useEffect(() => {
    if (s.paymentStatus === 'failed') track('payment_failed', { transaction_id: order.orderNumber, value: order.total, currency: 'INR' })
  }, [s.paymentStatus, order.orderNumber, order.total])

  async function act(action: 'pay' | 'pay_later') {
    if (busy) return
    setBusy(action)
    setActionError(null)
    const sdk = action === 'pay' ? loadCashfree() : null
    sdk?.catch(() => {})
    try {
      const res = await fetch('/api/checkout/retry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderNumber: order.orderNumber, token, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.paymentStatus === 'paid') { setS((x) => ({ ...x, paymentStatus: 'paid' })); return }
      if (data.paymentStatus === 'awaiting_payment') { setS((x) => ({ ...x, paymentStatus: 'awaiting_payment', bankPending: true, attempted: true })); return }
      if (action === 'pay_later' && res.ok) {
        setS((x) => ({ ...x, paymentStatus: 'unpaid', paymentMethod: 'pay_later' }))
        return
      }
      if (!res.ok || !data.paymentSessionId) throw new Error(data.error || 'Could not start the payment')
      savePendingOrder({ orderNumber: order.orderNumber, token, total: order.total, at: Date.now() })
      const err = await openCashfreeCheckout(data.paymentSessionId, data.cashfreeMode, sdk!)
      if (err) throw new Error(err)
      return // navigating to Cashfree
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  // A few seconds of "checking" before concluding nobody paid, so a just-returned customer
  // never sees "not paid" flash up while Cashfree is still recording the payment.
  const stillChecking = waiting && !s.attempted && !s.bankPending && checks < 2
  const confirming = waiting && (s.bankPending || s.attempted || stillChecking)
  const notPaidYet = waiting && !confirming
  const longWait = waiting && Date.now() - started.current > 10 * 60_000

  return (
    <div className="fade-in max-w-xl mx-auto pb-8">
      <div aria-live="polite">
        {s.status === 'cancelled' ? (
          <Hero tone="neutral" icon={XCircle} title="This order was cancelled" body="If you paid, the amount is refunded to your original payment method. Questions? WhatsApp us." />
        ) : s.paymentStatus === 'paid' ? (
          <Hero tone="success" icon={CheckCircle2} title="Payment received — thank you!"
            body={`We’ve got your order and ${rupees(order.total)} payment. ${nextStepCopy(order.deliveryMethod)}`} />
        ) : s.paymentStatus === 'refunded' || s.paymentStatus === 'partially_refunded' ? (
          <Hero tone="neutral" icon={CheckCircle2} title="Refund issued" body="Your refund is on its way to your original payment method (UPI up to 5 working days, cards up to 7)." />
        ) : s.paymentMethod === 'pay_later' ? (
          <Hero tone="success" icon={PackageCheck} title="Order placed!" body="We’ll WhatsApp you shortly to confirm availability, delivery and payment. Nothing to pay right now." />
        ) : confirming ? (
          <Hero tone="pending" icon={Clock} spinning title={stillChecking ? 'Checking your payment…' : 'Confirming your payment'}
            body={
              longWait
                ? 'Your bank is taking longer than usual. Your order is saved — we’ll WhatsApp you as soon as it confirms. If the payment fails, any amount debited is refunded automatically.'
                : 'This usually takes a few seconds, sometimes a few minutes for UPI. Your order is saved. Please don’t pay again — this page updates by itself.'
            } />
        ) : s.paymentStatus === 'failed' ? (
          <Hero tone="error" icon={XCircle} title="Payment didn’t go through"
            body="The payment wasn’t completed, so nothing was charged for this order. If your bank shows a debit, it’s returned automatically within 3–5 working days." />
        ) : notPaidYet ? (
          <Hero tone="pending" icon={Clock} title="Payment not completed yet" body="Your order is saved. Complete the payment below, or place it now and pay later." />
        ) : null}
      </div>

      {/* Actions for an unpaid online order */}
      {(s.paymentStatus === 'failed' || notPaidYet) && s.status !== 'cancelled' && (
        <div className="mt-4 space-y-2.5">
          <button type="button" onClick={() => act('pay')} disabled={!!busy} aria-busy={busy === 'pay' || undefined}
            className="w-full min-h-[50px] rounded-xl bg-[#1B2A4A] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
            {busy === 'pay' ? 'Opening payment…' : `Pay ${rupees(order.total)} now`}
          </button>
          <button type="button" onClick={() => act('pay_later')} disabled={!!busy}
            className="w-full min-h-[44px] rounded-xl border border-[#1B2A4A] text-[#1B2A4A] font-medium disabled:opacity-60">
            {busy === 'pay_later' ? 'Placing order…' : 'Place order, pay later instead'}
          </button>
          {actionError && <p role="alert" className="text-sm text-red-700 text-center">{actionError}</p>}
        </div>
      )}

      {/* Order number: the one thing to keep */}
      <OrderNumberCard orderNumber={order.orderNumber} />

      {(s.paymentStatus === 'paid' || s.paymentMethod === 'pay_later') && s.status !== 'cancelled' && (
        <Timeline status={s.status} paid={s.paymentStatus === 'paid'} deliveryMethod={order.deliveryMethod} />
      )}

      <OrderDetails order={order} />

      <div className="mt-5 grid gap-2.5">
        <a
          href={whatsappUrl(`Hi! About my order ${order.orderNumber}`)}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="order_help"
          className="flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#25D366] text-[#1B2A4A] font-semibold"
        >
          <WhatsAppIcon className="w-5 h-5" /> WhatsApp us about this order
        </a>
        <Link href="/products" className="flex items-center justify-center min-h-[44px] text-sm text-[#1B2A4A] font-medium underline underline-offset-2">
          Continue shopping
        </Link>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-[#6B6B6B]">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>
          Bookmark this page to check your order any time, or use{' '}
          <Link href="/track" className="underline">Track order</Link> with your order number and mobile.
        </span>
      </p>
    </div>
  )
}

function nextStepCopy(method: PublicOrderView['deliveryMethod']): string {
  if (method === 'porter') return 'We’ll WhatsApp you the Porter fare before sending it out.'
  if (method === 'pickup') return 'We’ll WhatsApp you when it’s ready to pick up.'
  return 'We’ll WhatsApp you when it ships.'
}

function Hero({ tone, icon: Icon, title, body, spinning }: {
  tone: 'success' | 'pending' | 'error' | 'neutral'; icon: React.ElementType; title: string; body: string; spinning?: boolean
}) {
  const tones = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    pending: 'bg-amber-50 border-amber-200 text-amber-950',
    error: 'bg-red-50 border-red-200 text-red-900',
    neutral: 'bg-[#F5F3F0] border-[#E8E5E0] text-[#2D2D2D]',
  }
  const iconTones = { success: 'text-emerald-600', pending: 'text-amber-600', error: 'text-red-600', neutral: 'text-[#6B6B6B]' }
  return (
    <div className={cn('rounded-2xl border p-5 text-center', tones[tone])}>
      <div className="relative w-12 h-12 mx-auto mb-3">
        {spinning && <span className="absolute inset-0 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" aria-hidden />}
        <Icon className={cn('absolute inset-0 m-auto w-7 h-7', iconTones[tone])} aria-hidden />
      </div>
      <h1 className="text-xl font-bold font-[family-name:var(--font-outfit)]" tabIndex={-1}>{title}</h1>
      <p className="mt-1.5 text-sm leading-relaxed opacity-90">{body}</p>
    </div>
  )
}

function OrderNumberCard({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#E8E5E0] bg-white p-4">
      <div>
        <p className="text-xs text-[#6B6B6B]">Order number</p>
        <p className="text-lg font-bold tracking-wide text-[#1B2A4A] tabular-nums">{orderNumber}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(orderNumber); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
        }}
        className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-[#D8D4CC] text-sm text-[#1B2A4A]"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Timeline({ status, paid, deliveryMethod }: { status: PublicOrderView['status']; paid: boolean; deliveryMethod: PublicOrderView['deliveryMethod'] }) {
  const order = ['pending', 'confirmed', 'shipped', 'delivered'] as const
  const at = order.indexOf(status as (typeof order)[number])
  const steps = [
    paid ? 'Paid' : 'Order placed',
    'Confirmed',
    deliveryMethod === 'pickup' ? 'Ready to pick up' : deliveryMethod === 'porter' ? 'Out for delivery' : 'Shipped',
    deliveryMethod === 'pickup' ? 'Picked up' : 'Delivered',
  ]
  return (
    <ol className="mt-4 rounded-xl border border-[#E8E5E0] bg-white p-4 space-y-3" aria-label="Order progress">
      {steps.map((label, i) => {
        const done = i <= Math.max(at, 0)
        return (
          <li key={label} className="flex items-center gap-3">
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', done ? 'bg-emerald-600 text-white' : 'bg-[#EEEBE6] text-[#6B6B6B]')}>
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className={cn('text-sm', done ? 'text-[#2D2D2D] font-medium' : 'text-[#6B6B6B]')}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function OrderDetails({ order }: { order: PublicOrderView }) {
  const DeliveryIcon = order.deliveryMethod === 'porter' ? Bike : order.deliveryMethod === 'pickup' ? Store : Truck
  const deliveryLine =
    order.deliveryMethod === 'porter'
      ? `Same-day bike delivery${order.city ? ` to ${order.city}` : ''} — Porter fare paid to the rider`
      : order.deliveryMethod === 'pickup'
        ? `Pickup from our shop, ${SHOP_PICKUP_LABEL}`
        : `Courier${order.city ? ` to ${order.city}` : ''}${order.pincode ? ` ${order.pincode}` : ''} · 3–5 business days`
  return (
    <section className="mt-4 rounded-xl border border-[#E8E5E0] bg-white p-4" aria-label="Order details">
      <ul className="divide-y divide-[#F0EDE8]">
        {order.items.map((i, n) => (
          <li key={n} className="py-2 flex justify-between gap-3 text-sm">
            <span className="text-[#2D2D2D]">{i.name}{i.size ? ` · ${i.size}` : ''} <span className="text-[#6B6B6B]">× {i.quantity}</span></span>
            <span className="tabular-nums">{rupees(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 pt-2 border-t border-[#E8E5E0] text-sm space-y-1">
        <div className="flex justify-between"><dt className="text-[#6B6B6B]">Delivery</dt><dd className="tabular-nums">{order.deliveryFee ? rupees(order.deliveryFee) : order.deliveryMethod === 'porter' ? 'Paid to rider' : 'FREE'}</dd></div>
        <div className="flex justify-between font-bold text-[#1B2A4A]"><dt>Total</dt><dd className="tabular-nums">{rupees(order.total)}</dd></div>
      </dl>
      <p className="mt-3 flex gap-2 text-sm text-[#2D2D2D]"><DeliveryIcon className="w-4 h-4 mt-0.5 text-[#8F6240] flex-shrink-0" />{deliveryLine}</p>
      {order.eventDate && <p className="mt-1 text-xs text-[#6B6B6B]">Needed by {new Date(order.eventDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
    </section>
  )
}
