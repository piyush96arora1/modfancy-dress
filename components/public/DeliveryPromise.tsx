import { Truck, Package, Globe } from 'lucide-react'

/**
 * Delivery expectations on the product page.
 *
 * Deliberately a server component with no state, no props and no geo lookup.
 * The obvious version of this feature detects the visitor's city and shows only
 * their row — but that resolves after hydration, which reflows the Add to Cart
 * button sitting directly above it and puts a CLS hit on the page that matters
 * most. All three tiers render as static HTML instead and the customer reads
 * their own row.
 *
 * Icons come from lucide-react, already in the bundle. The competitor page this
 * was modelled on pulls Font Awesome for a single blinking car icon — a
 * render-blocking stylesheet for one glyph, and a `blink` animation that repaints
 * forever and fails WCAG 2.2.2. Neither is worth copying.
 *
 * The wording here is load-bearing: `productSchema` in lib/seo/structured-data.tsx
 * emits the same promise as `offers.shippingDetails`, and Google requires the
 * markup to match the visible page. Change one and change the other.
 */
export function DeliveryPromise() {
  return (
    <div className="rounded-xl border border-[#E8E5E0] bg-white divide-y divide-[#E8E5E0]">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <Truck className="w-4 h-4 mt-0.5 shrink-0 text-[#8F6240]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#6B6B6B]">
          <strong className="text-[#1B2A4A] font-semibold">Delhi NCR — same-day delivery</strong>{' '}
          via Porter or Rapido, or collect from our Krishna Nagar store.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-2.5">
        <Package className="w-4 h-4 mt-0.5 shrink-0 text-[#8F6240]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#6B6B6B]">
          <strong className="text-[#1B2A4A] font-semibold">Rest of India — 3 to 5 business days</strong>{' '}
          by courier or transport, tracked to your pin code.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-2.5">
        <Globe className="w-4 h-4 mt-0.5 shrink-0 text-[#8F6240]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#6B6B6B]">
          <strong className="text-[#1B2A4A] font-semibold">Worldwide parcel delivery</strong>{' '}
          — send your country and pin code for a quote.
        </p>
      </div>

      <p className="px-4 py-2.5 text-xs leading-relaxed text-[#6B6B6B]">
        Shipping charges are extra according to location. Unworn items can be exchanged in
        store within 7 days.
      </p>
    </div>
  )
}
