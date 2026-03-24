/** Primary business WhatsApp / phone (India, E.164 without + for wa.me). */
export const BUSINESS_WHATSAPP_E164 = '919311365366'

export const BUSINESS_PHONE_TEL = '+919311365366'

/** Spaced display format for UI */
export const BUSINESS_PHONE_DISPLAY = '+91 93113 65366'

export function whatsappUrl(prefilledText: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_E164}?text=${encodeURIComponent(prefilledText)}`
}

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com').replace(/\/$/, '')
}
