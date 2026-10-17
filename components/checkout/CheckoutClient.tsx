'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Lock, Bike, Store, Truck, Clock, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { usePricingMode } from '@/lib/context/PricingModeContext'
import { ecommerce, track } from '@/lib/analytics/gtag'
import { getImageUrl } from '@/lib/imageUrl'
import { whatsappUrl } from '@/lib/constants/contact'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { estimateDelivery, normalisePincode, readSavedPincode, savePincode, SAME_DAY_CUTOFF_HOUR_IST } from '@/lib/delivery/pincode'
import { COURIER_FEE, deliveryFee, deliveryOptions, SHOP_PICKUP_LABEL, type DeliveryMethod } from '@/lib/delivery/config'
import { EMAIL_RE, MOBILE_RE, normaliseIndianMobile } from '@/lib/checkout/phone'
import { cn } from '@/lib/utils/cn'
import {
  clearPendingOrder,
  loadCashfree,
  openCashfreeCheckout,
  preconnectCashfree,
  readPendingOrder,
  savePendingOrder,
  type PendingOrder,
} from './cashfree-client'

type Form = {
  pincode: string
  name: string
  phone: string
  address1: string
  address2: string
  city: string
  email: string
  eventDate: string
  website: string // honeypot
}
type FieldKey = Exclude<keyof Form, 'website'>
type Errors = Partial<Record<FieldKey | 'method', string>>

const EMPTY: Form = { pincode: '', name: '', phone: '', address1: '', address2: '', city: '', email: '', eventDate: '', website: '' }
const DRAFT_KEY = 'mfd-checkout-draft'
const FIELD_ORDER: FieldKey[] = ['pincode', 'phone', 'name', 'address1', 'city', 'email']

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const itemKey = (i: { productId: string; variantId?: string }) => `${i.productId}:${i.variantId ?? ''}`

/** IST calendar date, offset by `days`. */
function istDate(days = 0): string {
  return new Date(Date.now() + 330 * 60_000 + days * 86_400_000).toISOString().slice(0, 10)
}

/** True once the persisted cart has been read from localStorage. Before that the cart is
 *  empty in memory, and showing "Your cart is empty" for a moment is both wrong and a CLS. */
function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  )
}

/** Let the browser paint the pressed/busy state before any work (keeps INP low). */
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)))

export function CheckoutClient() {
  const router = useRouter()
  const hydrated = useCartHydrated()
  const { items, updateQuantity, removeItem, clearCart, syncPrices } = useCart()
  const { mode: pricingMode, ready: pricingReady } = usePricingMode()
  const wholesale = pricingMode === 'wholesale'

  const [form, setForm] = useState<Form>(EMPTY)
  const [chosenMethod, setChosenMethod] = useState<DeliveryMethod | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<null | 'online' | 'later'>(null)
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [typing, setTyping] = useState(false)
  const checkoutTracked = useRef(false)
  const draftLoaded = useRef(false)
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({})
  const reg = (k: FieldKey) => (el: HTMLInputElement | null) => { fieldRefs.current[k] = el }

  // Restore a saved draft (failed payment, came back later) and the pincode from the product page.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as Partial<Form> & { method?: DeliveryMethod }
        setForm((f) => ({ ...f, ...draft, website: '' }))
        if (draft.method) setChosenMethod(draft.method)
      }
    } catch {}
    const saved = readSavedPincode()
    if (saved) setForm((f) => (f.pincode ? f : { ...f, pincode: saved }))
    setPending(readPendingOrder())
    draftLoaded.current = true
  }, [])

  // Save the draft as the customer types (never payment data; there is none on this page).
  useEffect(() => {
    if (!draftLoaded.current) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, website: undefined, method: chosenMethod }))
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [form, chosenMethod])

  const gaItems = useCallback(
    () =>
      ecommerce(
        items.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          item_variant: [item.size, item.color].filter(Boolean).join(' / ') || undefined,
          price: item.price,
          quantity: item.quantity,
        })),
      ),
    [items],
  )

  const hasItems = items.length > 0
  useEffect(() => {
    if (hasItems) track('view_cart', gaItems())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems])

  // Derived checkout state ------------------------------------------------------------
  const pincode = normalisePincode(form.pincode)
  const options = useMemo(() => deliveryOptions(pincode), [pincode])
  const method: DeliveryMethod | null = chosenMethod && options.includes(chosenMethod) ? chosenMethod : (options[0] ?? null)
  const estimate = estimateDelivery(pincode)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const fee = method ? deliveryFee(method, subtotal) : 0
  const total = subtotal + fee
  const needsAddress = method !== 'pickup'
  const ncr = estimate.kind === 'same-day'
  const urgent = form.eventDate !== '' && form.eventDate <= istDate(1)

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as FieldKey]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  // City is known for NCR pincodes: fill it so there is one field less to type.
  useEffect(() => {
    if (estimate.kind === 'same-day' && !form.city) setForm((f) => ({ ...f, city: estimate.city }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode])

  const chooseMethod = (m: DeliveryMethod) => {
    setChosenMethod(m)
    track('add_shipping_info', { ...gaItems(), shipping_tier: m })
  }

  const handleFocus = (e: React.FocusEvent) => {
    if (e.target instanceof HTMLInputElement) setTyping(true)
    preconnectCashfree()
    if (checkoutTracked.current) return
    checkoutTracked.current = true
    track('begin_checkout', gaItems())
  }
  const handleBlur = () => setTimeout(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLInputElement)) setTyping(false)
  }, 50)

  // Validation (mirrors the server's zod schema; the server has the final say) ------------
  function validate(): Errors {
    const e: Errors = {}
    if (!/^[1-9][0-9]{5}$/.test(pincode)) e.pincode = 'Enter your 6-digit pincode'
    if (!MOBILE_RE.test(normaliseIndianMobile(form.phone))) e.phone = 'Enter a 10-digit mobile number'
    if (form.name.trim().length < 2) e.name = 'Enter your name'
    if (needsAddress && form.address1.trim().length < 5) e.address1 = 'Enter house / flat number and street'
    if (needsAddress && form.city.trim().length < 2) e.city = 'Enter your city'
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'Check the email address'
    if (pincode && options.length > 0 && !method) e.method = 'Choose a delivery option'
    return e
  }

  function showErrors(e: Errors) {
    setErrors(e)
    const first = FIELD_ORDER.find((k) => e[k])
    const el = first ? fieldRefs.current[first] : null
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus({ preventScroll: true })
    }
  }

  async function submit(pay: 'online' | 'later') {
    if (submitting) return
    const e = validate()
    if (Object.keys(e).length) {
      setFormError('Please fill in the highlighted details')
      showErrors(e)
      return
    }
    setFormError(null)
    setSubmitting(pay)
    await nextFrame()

    // Start fetching Cashfree's script while the order is being created.
    const sdk = pay === 'online' ? loadCashfree() : null
    sdk?.catch(() => {})
    track('add_payment_info', { ...gaItems(), payment_type: pay === 'online' ? 'online' : 'pay_later' })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loosely-typed API reply
    let data: Record<string, any> = {}
    let ok = false
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            size: i.size ?? null,
            color: i.color ?? null,
            quantity: i.quantity,
            shownPrice: i.price,
          })),
          customer: { name: form.name.trim(), phone: form.phone, email: form.email.trim() },
          delivery: {
            pincode,
            method,
            ...(needsAddress ? { address1: form.address1.trim(), address2: form.address2.trim(), city: form.city.trim() } : { city: form.city.trim() }),
          },
          eventDate: form.eventDate,
          pay,
          expectedTotal: total,
          pricingMode,
          website: form.website,
        }),
      })
      ok = res.ok
      data = await res.json().catch(() => ({}))
    } catch {
      data = { error: 'No internet connection. Your details are saved; please try again.' }
    }

    if (!data.orderNumber) {
      // Nothing was created.
      if (data.reason === 'price_changed' && Array.isArray(data.prices)) syncPrices(data.prices)
      if (data.fields) {
        const mapped: Errors = {}
        for (const [path, msg] of Object.entries(data.fields as Record<string, string>)) {
          const key = path.split('.').pop() as FieldKey | 'method'
          mapped[key === 'address1' || key === 'city' || key === 'pincode' || key === 'name' || key === 'phone' || key === 'email' || key === 'method' ? key : 'name'] = msg
        }
        showErrors(mapped)
      }
      setFormError(data.error || 'Something went wrong. Please try again.')
      setSubmitting(null)
      return
    }

    const orderUrl = `/order/${data.orderNumber}?t=${encodeURIComponent(data.token)}`
    savePincode(pincode)

    if (pay === 'later') {
      track('generate_lead', { ...gaItems(), value: data.total, lead_source: 'checkout_pay_later', transaction_id: data.orderNumber })
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
      clearCart()
      router.push(orderUrl)
      return
    }

    // Online: the order exists. Remember it, then hand over to Cashfree.
    savePendingOrder({ orderNumber: data.orderNumber, token: data.token, total: data.total, at: Date.now() })
    if (!ok || !data.paymentSessionId) {
      router.push(orderUrl) // the order page offers "try again" / "pay later"
      return
    }
    try {
      const err = await openCashfreeCheckout(data.paymentSessionId, data.cashfreeMode, sdk!)
      if (err) router.push(orderUrl)
      // Otherwise the browser is navigating to Cashfree; keep the busy state.
    } catch {
      router.push(orderUrl)
    }
  }

  // Render ------------------------------------------------------------------------------
  if (!hydrated) return <CheckoutSkeleton />

  if (!hasItems) {
    return (
      <div className="text-center py-16 fade-in min-h-[70svh]">
        {pending && <PendingBanner pending={pending} onDismiss={() => { clearPendingOrder(); setPending(null) }} />}
        <div className="w-16 h-16 rounded-full bg-[#F5F3F0] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-[#6B6B6B]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Your cart is empty</h1>
        <p className="text-[#6B6B6B] text-sm mb-6">Add a costume to get started.</p>
        <Link href="/products" className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-[#1B2A4A] text-white font-medium">
          Browse costumes
        </Link>
        <p className="mt-6 text-sm">
          <Link href="/track" className="text-[#8F6240] underline underline-offset-2">Track an order</Link>
        </p>
      </div>
    )
  }

  // Pay online needs a known (retail) pricing mode; until then keep its space, hidden.
  const showPayOnline = pricingReady && !wholesale
  const primaryLabel = showPayOnline ? `Pay ${rupees(total)} now` : 'Place order'
  const fieldError = (k: FieldKey | 'method') =>
    errors[k] ? <p id={`${k}-error`} className="mt-1 text-xs text-red-600">{errors[k]}</p> : null
  const aria = (k: FieldKey) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${k}-error` : undefined,
  })
  const inputCls = (k: FieldKey) =>
    cn(
      'block w-full h-12 rounded-xl border bg-white px-3.5 text-base text-[#2D2D2D] placeholder:text-[#8A877F] focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/15 focus:border-[#1B2A4A]',
      errors[k] ? 'border-red-500' : 'border-[#B9B5AC]',
    )

  return (
    <div className="fade-in pb-28 md:pb-0">
      <nav className="hidden md:flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2D2D2D]">Checkout</span>
      </nav>

      {pending && <PendingBanner pending={pending} onDismiss={() => { clearPendingOrder(); setPending(null) }} />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
        <div className="lg:col-span-3 space-y-5">
          {/* 1. Items */}
          <section aria-labelledby="cart-heading">
            <h1 id="cart-heading" className="text-xl md:text-2xl font-bold mb-3 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
              Your cart ({items.length})
            </h1>
            <ul className="space-y-2.5">
              {items.map((item, idx) => (
                <li key={itemKey(item)} className="bg-white border border-[#E8E5E0] rounded-xl p-3 flex gap-3">
                  <div className="relative w-20 h-20 bg-[#F5F3F0] rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <Image src={getImageUrl(item.image)} alt="" fill sizes="80px" className="object-cover" priority={idx === 0} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug text-[#2D2D2D] line-clamp-2">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' · ')}</p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="font-bold text-[#1B2A4A]">{rupees(item.price * item.quantity)}</p>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center rounded-lg border border-[#D8D4CC]">
                          <button
                            type="button"
                            aria-label={item.quantity === 1 ? `Remove ${item.name}` : `Decrease quantity of ${item.name}`}
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            className="w-11 h-11 flex items-center justify-center text-[#1B2A4A] active:bg-[#F5F3F0] rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={item.quantity >= (wholesale ? 500 : 20)}
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="w-11 h-11 flex items-center justify-center text-[#1B2A4A] active:bg-[#F5F3F0] rounded-r-lg disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="w-11 h-11 flex items-center justify-center text-[#6B6B6B] hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <form
            noValidate
            onSubmit={(e) => { e.preventDefault(); submit(showPayOnline ? 'online' : 'later') }}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
            className="space-y-5"
          >
            {/* 2. Delivery: pincode first so options and total settle early */}
            <section aria-labelledby="delivery-heading" className="bg-white border border-[#E8E5E0] rounded-xl p-4">
              <h2 id="delivery-heading" className="text-base font-bold text-[#1B2A4A] mb-3">Delivery</h2>
              <label htmlFor="pincode" className="block text-sm font-medium text-[#2D2D2D] mb-1">Pincode</label>
              <input
                id="pincode"
                ref={(el) => { fieldRefs.current.pincode = el }}
                value={form.pincode}
                onChange={set('pincode')}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                enterKeyHint="next"
                placeholder="6-digit pincode"
                className={cn(inputCls('pincode'), 'max-w-[220px] tracking-wider')}
                {...aria('pincode')}
              />
              {fieldError('pincode')}

              {/* Options appear as the pincode is typed; shifts within 500 ms of input don't count as CLS. */}
              <div className="mt-3">
                {options.length === 0 ? (
                  <p className="text-sm text-[#6B6B6B] pt-1">Enter your pincode to see delivery options and the total.</p>
                ) : (
                  <fieldset>
                    <legend className="sr-only">Delivery option</legend>
                    <div className="space-y-2">
                      {options.map((m) => (
                        <DeliveryOption
                          key={m}
                          method={m}
                          checked={method === m}
                          onChange={() => chooseMethod(m)}
                          city={ncr ? estimate.city : null}
                          beforeCutoff={estimate.kind === 'same-day' ? estimate.beforeCutoff : true}
                          fee={deliveryFee(m, subtotal)}
                        />
                      ))}
                    </div>
                    {fieldError('method')}
                  </fieldset>
                )}
              </div>

              <div className="mt-2">
                <label htmlFor="eventDate" className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Need it by <span className="font-normal text-[#6B6B6B]">(optional)</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  min={istDate(0)}
                  value={form.eventDate}
                  onChange={set('eventDate')}
                  className={cn(inputCls('eventDate'), 'max-w-[220px]')}
                />
                {urgent && method === 'courier' && (
                  <p className="mt-2 flex gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Courier takes 3–5 days.{' '}
                      <a href={whatsappUrl(`Hi! I need a costume by ${form.eventDate} at pincode ${pincode}. Is urgent delivery possible?`)} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                        WhatsApp us
                      </a>{' '}
                      for urgent options.
                    </span>
                  </p>
                )}
              </div>
            </section>

            {/* 3. Contact + address */}
            <section aria-labelledby="details-heading" className="bg-white border border-[#E8E5E0] rounded-xl p-4 space-y-3.5">
              <h2 id="details-heading" className="text-base font-bold text-[#1B2A4A]">Your details</h2>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#2D2D2D] mb-1">Mobile number (WhatsApp)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#B9B5AC] bg-[#F5F3F0] text-[#2D2D2D] text-base">+91</span>
                  <input
                    id="phone"
                    ref={(el) => { fieldRefs.current.phone = el }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    enterKeyHint="next"
                    maxLength={14}
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                    className={cn(inputCls('phone'), 'rounded-l-none')}
                    {...aria('phone')}
                  />
                </div>
                {fieldError('phone') ?? <p className="mt-1 text-xs text-[#6B6B6B]">We’ll send order updates here.</p>}
              </div>
              <Field id="name" label="Full name" value={form.name} onChange={set('name')} error={fieldError('name')} aria={aria('name')} cls={inputCls('name')} inputRef={reg('name')}
                autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
              {needsAddress && (
                <>
                  <Field id="address1" label="House / flat, street" value={form.address1} onChange={set('address1')} error={fieldError('address1')} aria={aria('address1')} cls={inputCls('address1')} inputRef={reg('address1')}
                    autoComplete="address-line1" enterKeyHint="next" />
                  <Field id="address2" label="Area, landmark (optional)" value={form.address2} onChange={set('address2')} error={null} aria={aria('address2')} cls={inputCls('address2')} inputRef={reg('address2')}
                    autoComplete="address-line2" enterKeyHint="next" />
                  <Field id="city" label="City" value={form.city} onChange={set('city')} error={fieldError('city')} aria={aria('city')} cls={inputCls('city')} inputRef={reg('city')}
                    autoComplete="address-level2" enterKeyHint="next" />
                </>
              )}
              <Field id="email" label="Email (optional, for the receipt)" value={form.email} onChange={set('email')} error={fieldError('email')} aria={aria('email')} cls={inputCls('email')} inputRef={reg('email')}
                type="email" inputMode="email" autoComplete="email" enterKeyHint="done" />
              {/* Honeypot: hidden from people, filled by bots. */}
              <input tabIndex={-1} aria-hidden="true" autoComplete="off" value={form.website} onChange={set('website')} name="website" className="absolute -left-[9999px] w-px h-px opacity-0" />
            </section>

            {/* 4. Summary (in flow on mobile; sticky column on desktop) */}
            <section aria-labelledby="summary-heading" className="lg:hidden">
              <Summary subtotal={subtotal} fee={fee} method={method} total={total} pincodeKnown={options.length > 0} />
            </section>

            {formError && (
              <div role="alert" className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2.5 lg:hidden">
              <PayLater submitting={submitting} onClick={() => submit('later')} wholesale={wholesale} />
              <HelpLink items={items.map((i) => i.name)} />
            </div>
          </form>
        </div>

        {/* Desktop summary column */}
        <aside className="hidden lg:block lg:col-span-2">
          <div className="lg:sticky lg:top-20 bg-white border border-[#E8E5E0] rounded-xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 id="summary-heading" className="text-lg font-bold text-[#1B2A4A]">Order summary</h2>
            <Summary subtotal={subtotal} fee={fee} method={method} total={total} pincodeKnown={options.length > 0} bare />
            <PayButton
              label={primaryLabel}
              busy={submitting === (showPayOnline ? 'online' : 'later')}
              disabled={!!submitting}
              hidden={!pricingReady}
              onClick={() => submit(showPayOnline ? 'online' : 'later')}
              online={showPayOnline}
            />
            {showPayOnline && <PayLater submitting={submitting} onClick={() => submit('later')} wholesale={false} />}
            <HelpLink items={items.map((i) => i.name)} />
          </div>
        </aside>
      </div>

      {/* Mobile sticky pay bar (replaces the bottom nav on this page). Slides away while
          the keyboard is up so it never covers the field being typed into. */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white border-t border-[#E8E5E0] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] transition-transform duration-200',
          typing ? 'translate-y-full' : 'translate-y-0',
        )}
        style={{ boxShadow: '0 -4px 16px rgba(27,42,74,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#6B6B6B] leading-tight">{options.length ? (fee ? `incl. ${rupees(fee)} delivery` : 'Total') : 'Items total'}</p>
            <p className="text-lg font-bold text-[#1B2A4A] leading-tight tabular-nums">{rupees(total)}</p>
          </div>
          <div className="flex-1">
            <PayButton
              label={showPayOnline ? `Pay ${rupees(total)}` : 'Place order'}
              busy={submitting === (showPayOnline ? 'online' : 'later')}
              disabled={!!submitting}
              hidden={!pricingReady}
              onClick={() => submit(showPayOnline ? 'online' : 'later')}
              online={showPayOnline}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Pieces ----------------------------------------------------------------------------------

function Field(props: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error: React.ReactNode
  aria: Record<string, unknown>
  cls: string
  inputRef: (el: HTMLInputElement | null) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id' | 'aria'>) {
  const { id, label, value, onChange, error, aria, cls, inputRef, ...rest } = props
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#2D2D2D] mb-1">{label}</label>
      <input id={id} ref={inputRef} value={value} onChange={onChange} className={cls} {...aria} {...rest} />
      {error}
    </div>
  )
}

function DeliveryOption({
  method, checked, onChange, city, beforeCutoff, fee,
}: { method: DeliveryMethod; checked: boolean; onChange: () => void; city: string | null; beforeCutoff: boolean; fee: number }) {
  const content = {
    courier: {
      icon: Truck,
      title: 'Courier delivery',
      note: '3–5 business days across India',
      price: fee ? rupees(fee) : 'FREE',
    },
    porter: {
      icon: Bike,
      title: `Same-day bike delivery${city ? ` in ${city}` : ''}`,
      note: beforeCutoff
        ? `Pay the rider the Porter fare. We’ll WhatsApp you the exact fare before sending.`
        : `Ordered after ${SAME_DAY_CUTOFF_HOUR_IST} pm: goes out tomorrow morning. Pay the rider the Porter fare.`,
      price: 'Pay rider',
    },
    pickup: {
      icon: Store,
      title: 'Pick up from our shop',
      note: `${SHOP_PICKUP_LABEL}. We’ll WhatsApp you when it’s ready.`,
      price: 'FREE',
    },
  }[method]
  const Icon = content.icon
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 cursor-pointer min-h-[60px]',
        checked ? 'border-[#1B2A4A] bg-[#F3F5FA] ring-1 ring-[#1B2A4A]' : 'border-[#D8D4CC] bg-white',
      )}
    >
      <input type="radio" name="delivery" value={method} checked={checked} onChange={onChange} className="mt-1 w-5 h-5 accent-[#1B2A4A] flex-shrink-0" />
      <Icon className="w-5 h-5 text-[#8F6240] flex-shrink-0 mt-0.5" aria-hidden />
      <span className="flex-1 min-w-0">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-[#2D2D2D]">{content.title}</span>
          <span className="text-sm font-semibold text-[#1B2A4A] whitespace-nowrap">{content.price}</span>
        </span>
        <span className="block text-xs text-[#6B6B6B] mt-0.5">{content.note}</span>
      </span>
    </label>
  )
}

function Summary({
  subtotal, fee, method, total, pincodeKnown, bare,
}: { subtotal: number; fee: number; method: DeliveryMethod | null; total: number; pincodeKnown: boolean; bare?: boolean }) {
  const deliveryText = !pincodeKnown
    ? 'Enter pincode'
    : method === 'courier'
      ? fee ? rupees(fee) : 'FREE'
      : method === 'porter'
        ? 'Paid to rider'
        : 'FREE'
  return (
    <div className={cn(!bare && 'bg-white border border-[#E8E5E0] rounded-xl p-4')} aria-live="polite">
      {!bare && <h2 id="summary-heading" className="text-base font-bold text-[#1B2A4A] mb-2">Order summary</h2>}
      <dl className="text-sm space-y-1.5">
        <div className="flex justify-between"><dt className="text-[#6B6B6B]">Items</dt><dd className="tabular-nums">{rupees(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-[#6B6B6B]">Delivery</dt><dd className="tabular-nums">{deliveryText}</dd></div>
        <div className="flex justify-between pt-2 mt-1 border-t border-[#E8E5E0] text-base font-bold text-[#1B2A4A]">
          <dt>Total</dt><dd className="tabular-nums">{rupees(total)}</dd>
        </div>
      </dl>
      {method === 'porter' && <p className="mt-2 text-xs text-[#6B6B6B]">Porter fare is paid to the rider on delivery, not included above.</p>}
      {!pincodeKnown && <p className="mt-2 text-xs text-[#6B6B6B]">Courier across India is {rupees(COURIER_FEE)}. Same-day delivery or free pickup in Delhi NCR.</p>}
    </div>
  )
}

function PayButton({
  label, busy, disabled, hidden, onClick, online, compact,
}: { label: string; busy: boolean; disabled: boolean; hidden: boolean; onClick: () => void; online: boolean; compact?: boolean }) {
  return (
    <div className={cn(hidden && 'invisible')}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-busy={busy || undefined}
        className="w-full min-h-[50px] rounded-xl bg-[#1B2A4A] text-white font-semibold text-base flex items-center justify-center gap-2 active:bg-[#0F1D36] disabled:opacity-70"
      >
        {busy ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
            {online ? 'Opening payment…' : 'Placing order…'}
          </>
        ) : (
          <>
            {online && <Lock className="w-4 h-4" aria-hidden />}
            {label}
          </>
        )}
      </button>
      {!compact && online && (
        <p className="mt-2 text-center text-xs text-[#6B6B6B]">UPI · GPay · PhonePe · Paytm · Cards · Netbanking — secured by Cashfree</p>
      )}
      {compact && online && <p className="mt-1 text-center text-[11px] text-[#6B6B6B]">UPI · Cards · Netbanking · secured by Cashfree</p>}
    </div>
  )
}

function PayLater({ submitting, onClick, wholesale }: { submitting: null | 'online' | 'later'; onClick: () => void; wholesale: boolean }) {
  if (wholesale) {
    return <p className="text-xs text-[#6B6B6B] text-center">Wholesale orders are confirmed on WhatsApp with final pricing and availability.</p>
  }
  return (
    <div className="rounded-xl border border-dashed border-[#D8D4CC] p-3 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={!!submitting}
        aria-busy={submitting === 'later' || undefined}
        className="w-full min-h-[44px] rounded-lg border border-[#1B2A4A] text-[#1B2A4A] font-medium text-sm active:bg-[#EEF1F7] disabled:opacity-60"
      >
        {submitting === 'later' ? 'Placing order…' : 'Place order, pay later'}
      </button>
      <p className="mt-1.5 text-xs text-[#6B6B6B]">We’ll WhatsApp you to confirm and share payment options.</p>
    </div>
  )
}

function HelpLink({ items }: { items: string[] }) {
  return (
    <a
      href={whatsappUrl(`Hi! I have a question about my order: ${items.slice(0, 3).join(', ')}`)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="checkout_help"
      className="flex items-center justify-center gap-2 min-h-[44px] text-sm text-[#1B2A4A] font-medium"
    >
      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" /> Questions? WhatsApp us
    </a>
  )
}

function PendingBanner({ pending, onDismiss }: { pending: PendingOrder; onDismiss: () => void }) {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm">
      <p className="font-semibold text-amber-900">You started paying for order {pending.orderNumber}</p>
      <p className="text-amber-900/80 mt-0.5">Check its status before paying again — if money left your account, it’s safe.</p>
      <div className="mt-2 flex gap-3">
        <Link href={`/order/${pending.orderNumber}?t=${encodeURIComponent(pending.token)}`} className="inline-flex items-center min-h-[40px] px-3 rounded-lg bg-[#1B2A4A] text-white font-medium">
          View order status
        </Link>
        <button type="button" onClick={onDismiss} className="min-h-[40px] px-2 text-amber-900 underline underline-offset-2">Dismiss</button>
      </div>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    // At least a screen tall: the checkout always is, so the footer stays below the fold
    // through the swap instead of jumping out of view (it measured CLS 0.16 when short).
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8 min-h-[100svh]" aria-busy="true" aria-label="Loading your cart">
      <div className="lg:col-span-3 space-y-3">
        <div className="h-7 w-40 rounded bg-[#EEEBE6]" />
        {[0, 1].map((i) => <div key={i} className="h-[106px] rounded-xl bg-[#F5F3F0]" />)}
        <div className="h-[260px] rounded-xl bg-[#F5F3F0]" />
      </div>
      <div className="hidden lg:block lg:col-span-2 h-[320px] rounded-xl bg-[#F5F3F0]" />
    </div>
  )
}
