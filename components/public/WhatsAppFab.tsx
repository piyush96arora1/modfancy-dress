'use client'

import { useEffect, useState } from 'react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { whatsappUrl } from '@/lib/constants/contact'
import { estimateDelivery, estimateLabel, readSavedPincode } from '@/lib/delivery/pincode'

/**
 * Mobile WhatsApp button for the product page.
 *
 * - Steps aside while the element `hideWhileVisibleId` is on screen. The
 *   delivery card carries its own WhatsApp link, and a fixed button at the
 *   right edge would sit on top of its text. Hiding uses opacity/transform
 *   on a fixed element, so it never moves layout (no CLS).
 * - Adds the pincode the customer checked to the prefilled message, read at
 *   tap time so the server-rendered href stays identical for hydration.
 */
export function WhatsAppFab({ message, hideWhileVisibleId }: { message: string; hideWhileVisibleId?: string }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!hideWhileVisibleId || typeof IntersectionObserver === 'undefined') return
    const target = document.getElementById(hideWhileVisibleId)
    if (!target) return
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      // Only count the band the button actually occupies (bottom ~40% of the screen).
      rootMargin: '-60% 0px 0px 0px',
    })
    io.observe(target)
    return () => io.disconnect()
  }, [hideWhileVisibleId])

  return (
    <a
      href={whatsappUrl(message)}
      onClick={(e) => {
        const pincode = readSavedPincode()
        const estimate = pincode ? estimateDelivery(pincode) : null
        if (estimate && estimate.kind !== 'invalid') {
          e.currentTarget.href = whatsappUrl(`${message}\n\nMy pincode: ${pincode} (${estimateLabel(estimate)})`)
        }
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed right-4 bottom-[4.5rem] z-40 md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-[#1B2A4A] shadow-lg shadow-[#25D366]/30 active:scale-95 transition-[opacity,transform] duration-200 ${
        hidden ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="w-5 h-5" />
    </a>
  )
}
