'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock, Package } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { whatsappUrl } from '@/lib/constants/contact'
import {
  estimateDelivery,
  estimateLabel,
  normalisePincode,
  readSavedPincode,
  savePincode,
  SAME_DAY_CUTOFF_HOUR_IST,
  type DeliveryEstimate,
} from '@/lib/delivery/pincode'

const cutoffLabel =
  SAME_DAY_CUTOFF_HOUR_IST === 12
    ? '12 noon'
    : `${SAME_DAY_CUTOFF_HOUR_IST % 12 || 12} ${SAME_DAY_CUTOFF_HOUR_IST < 12 ? 'AM' : 'PM'}`

/**
 * "Will it reach me in time?" for the product page.
 *
 * Web-vitals contract — keep it when editing:
 * - The server renders the form at its final size, so hydration moves nothing.
 * - The result only appears after a submit. Layout shifts within 500ms of user
 *   input are excluded from CLS, so the result can push content down freely.
 * - The saved pincode is restored into the input only (fixed size), never as
 *   a result on mount — that would be an unprompted shift after hydration.
 * - The check is a synchronous range lookup: no fetch, nothing to await.
 */
export function PincodeChecker({ productName, productUrl }: { productName: string; productUrl: string }) {
  // Uncontrolled input: restoring the saved pincode writes the DOM directly,
  // so mount costs no re-render.
  const inputRef = useRef<HTMLInputElement>(null)
  const [checked, setChecked] = useState<{ pincode: string; estimate: DeliveryEstimate } | null>(null)
  const pincode = checked?.pincode ?? ''
  const estimate = checked?.estimate ?? null

  useEffect(() => {
    const saved = readSavedPincode()
    if (saved && inputRef.current && !inputRef.current.value) inputRef.current.value = saved
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = normalisePincode(inputRef.current?.value ?? '')
    const result = estimateDelivery(value)
    setChecked({ pincode: value, estimate: result })
    if (result.kind !== 'invalid') savePincode(value)
  }

  const waText = (lead: string) =>
    `${lead}\n\nProduct: ${productName}\nPincode: ${pincode}${
      estimate && estimate.kind !== 'invalid' ? ` (${estimateLabel(estimate)})` : ''
    }\n\n${productUrl}`

  return (
    <div className="px-4 py-3">
      <label htmlFor="delivery-pincode" className="block mb-2 text-xs font-semibold text-[#1B2A4A]">
        Check delivery to your pincode
      </label>
      <form onSubmit={onSubmit} className="flex gap-2" noValidate>
        <input
          id="delivery-pincode"
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="6-digit pincode"
          ref={inputRef}
          onInput={(e) => {
            const el = e.currentTarget
            const clean = normalisePincode(el.value)
            if (clean !== el.value) el.value = clean
            if (checked) setChecked(null)
          }}
          className="min-w-0 flex-1 h-11 px-3 rounded-lg border border-[#E8E5E0] bg-white text-sm text-[#2D2D2D] placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#C8956C]/40 focus:border-[#C8956C]"
        />
        <button
          type="submit"
          className="shrink-0 h-11 px-4 rounded-lg bg-[#1B2A4A] hover:bg-[#2A3B5E] text-white text-sm font-semibold transition-colors touch-manipulation"
        >
          Check
        </button>
      </form>

      <div aria-live="polite">
        {estimate?.kind === 'invalid' && (
          <p className="mt-2 text-xs text-red-600">Enter a valid 6-digit pincode.</p>
        )}

        {estimate?.kind === 'same-day' && estimate.beforeCutoff && (
          <div className="mt-2.5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <div className="text-xs leading-relaxed text-[#6B6B6B]">
              <p>
                <strong className="text-emerald-700 font-semibold">Same-day delivery available</strong> to{' '}
                {estimate.city}. Order or message us before {cutoffLabel} and it reaches you today by Porter or
                Rapido, or collect it today from our Krishna Nagar store.
              </p>
              <a
                href={whatsappUrl(waText(`Hi, I need "${productName}" delivered today.`))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[44px] font-semibold text-[#1B2A4A] underline underline-offset-2 hover:text-[#8F6240]"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Need it today? Confirm on WhatsApp
              </a>
            </div>
          </div>
        )}

        {estimate?.kind === 'same-day' && !estimate.beforeCutoff && (
          <div className="mt-2.5 flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-[#8F6240]" aria-hidden="true" />
            <div className="text-xs leading-relaxed text-[#6B6B6B]">
              <p>
                <strong className="text-[#1B2A4A] font-semibold">Delivers tomorrow morning</strong> to{' '}
                {estimate.city}. Need it today? Book your own Rapido or Porter pickup from our Krishna Nagar
                store. Message us first so it&apos;s packed and ready.
              </p>
              <a
                href={whatsappUrl(waText(`Hi, I need "${productName}" today. I'll book my own Rapido/Porter pickup.`))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[44px] font-semibold text-[#1B2A4A] underline underline-offset-2 hover:text-[#8F6240]"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Arrange a same-day pickup
              </a>
            </div>
          </div>
        )}

        {estimate?.kind === 'india' && (
          <div className="mt-2.5 flex items-start gap-2">
            <Package className="w-4 h-4 mt-0.5 shrink-0 text-[#8F6240]" aria-hidden="true" />
            <div className="text-xs leading-relaxed text-[#6B6B6B]">
              <p>
                <strong className="text-[#1B2A4A] font-semibold">Delivers in 3 to 5 business days</strong> by
                courier, tracked to your pincode. Event coming up sooner? Tell us the date and we&apos;ll suggest
                the fastest option.
              </p>
              <a
                href={whatsappUrl(waText(`Hi, I need "${productName}" urgently. My event date is: `))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[44px] font-semibold text-[#1B2A4A] underline underline-offset-2 hover:text-[#8F6240]"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Urgent? Ask on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
