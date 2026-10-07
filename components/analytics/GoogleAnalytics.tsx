'use client'

import { useEffect } from 'react'
import { GA_MEASUREMENT_ID, initGtag, inferLeadIntent, track } from '@/lib/analytics/gtag'

/**
 * Loads gtag.js (deferred, see below) and tracks WhatsApp / phone clicks site-wide.
 *
 * The wa.me and tel: links live in ~15 server-rendered pages (city pages, wholesale pages,
 * PDP, footer…). One delegated listener covers all of them without turning those pages into
 * client components. A link can name its placement with data-cta="pdp_rent"; otherwise the
 * path is used.
 *
 * Mounted in the (public) layout only, so admin traffic never reaches GA.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    initGtag()
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link) return
      const href = link.href
      const isWhatsApp = /^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(href)
      const isPhone = href.startsWith('tel:')
      if (!isWhatsApp && !isPhone) return

      const pathname = window.location.pathname
      const params = {
        lead_intent: inferLeadIntent(href, pathname),
        cta_location: link.dataset.cta || pathname,
        page_path: pathname,
        item_id: link.dataset.itemId,
        // The query string carries the pre-filled message; keep it out of GA.
        link_url: href.split('?')[0],
      }
      track(isWhatsApp ? 'whatsapp_click' : 'phone_click', params)
    }
    document.addEventListener('click', onClick, { capture: true })

    // gtag.js is ~500 KB of JS to parse. Fetch it on the first interaction, or 5 s after
    // mount, so it never lands inside LCP or the initial main-thread work (TBT/INP).
    // Everything tracked before then waits in dataLayer and is replayed on load.
    const triggers = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      triggers.forEach((t) => window.removeEventListener(t, load))
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(s)
    }
    triggers.forEach((t) => window.addEventListener(t, load, { once: true, passive: true }))
    const timer = setTimeout(load, 5000)

    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      triggers.forEach((t) => window.removeEventListener(t, load))
      clearTimeout(timer)
    }
  }, [])

  return null
}
