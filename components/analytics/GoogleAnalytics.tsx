'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { GA_MEASUREMENT_ID, inferLeadIntent, track } from '@/lib/analytics/gtag'

/**
 * Loads gtag.js and tracks WhatsApp / phone clicks site-wide.
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
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
try{var m=localStorage.getItem('modfancy_pricing_mode');if(m)gtag('set','user_properties',{pricing_mode:m});}catch(e){}
gtag('config','${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
