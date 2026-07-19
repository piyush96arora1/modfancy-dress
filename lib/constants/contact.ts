/** Primary business WhatsApp / phone (India, E.164 without + for wa.me). */
export const BUSINESS_WHATSAPP_E164 = '919311365366'

export const BUSINESS_PHONE_TEL = '+919311365366'

/** Spaced display format for UI */
export const BUSINESS_PHONE_DISPLAY = '+91 93113 65366'

export function whatsappUrl(prefilledText: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_E164}?text=${encodeURIComponent(prefilledText)}`
}

/**
 * Normalize a raw phone string into a wa.me-ready number (India default).
 * - strips spaces/symbols
 * - bare 10-digit mobile -> prepend 91
 * - 0-prefixed 11-digit -> drop the 0, prepend 91
 * - anything else (already carries a country code, etc.) -> return the digits as-is
 */
export function whatsappNumber(raw: string): string {
  const digits = (raw || '').replace(/[^0-9]/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

/** Build a wa.me chat link for an arbitrary customer number, with optional prefilled text. */
export function whatsappChatUrl(raw: string, text?: string): string {
  const num = whatsappNumber(raw)
  const base = `https://wa.me/${num}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com').replace(/\/$/, '')
}
