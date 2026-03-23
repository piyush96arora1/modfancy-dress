/** Stable keys stored in `faqs.section` — labels for UI grouping on /faq */
export const FAQ_SECTION_LABELS: Record<string, string> = {
  general: '🛒 General / Buying',
  rental: '👗 Costume Rental',
  sizing: '📐 Sizing',
  school_bulk: '🏫 School & Bulk Orders',
  costume_guidance: '🎭 Costume Guidance',
  delivery: '🚚 Delivery & Returns',
  about_shop: '🏪 About the Shop',
}

export const FAQ_SECTION_ORDER = [
  'general',
  'rental',
  'sizing',
  'school_bulk',
  'costume_guidance',
  'delivery',
  'about_shop',
] as const
