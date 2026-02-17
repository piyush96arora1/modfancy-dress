import type { Product, ProductVariant, PricingMode } from '@/types/database'

// Default wholesale discount percentage (used when no site_settings override exists)
export const DEFAULT_WHOLESALE_DISCOUNT_PCT = 30

/**
 * Get the display price for a product based on pricing mode.
 * For wholesale: uses wholesale_price if set, otherwise auto-calculates from retail price.
 */
export function getProductPrice(
    product: Pick<Product, 'price' | 'wholesale_price'>,
    mode: PricingMode,
    wholesaleDiscountPct: number = DEFAULT_WHOLESALE_DISCOUNT_PCT
): number {
    const retailPrice = product.price || 0
    if (mode === 'retail') return retailPrice

    // Wholesale: use override if set, otherwise auto-calculate
    if (product.wholesale_price != null) return product.wholesale_price
    return Math.round(retailPrice * (1 - wholesaleDiscountPct / 100))
}

/**
 * Get the display price for a variant based on pricing mode.
 * Falls back to product-level wholesale price if variant doesn't have an override.
 */
export function getVariantPrice(
    product: Pick<Product, 'price' | 'wholesale_price'>,
    variant: Pick<ProductVariant, 'price_override' | 'wholesale_price_override'>,
    mode: PricingMode,
    wholesaleDiscountPct: number = DEFAULT_WHOLESALE_DISCOUNT_PCT
): number {
    if (mode === 'retail') {
        return variant.price_override || product.price || 0
    }

    // Wholesale variant: use variant override → product wholesale → auto-calculate
    if (variant.wholesale_price_override != null) return variant.wholesale_price_override
    const retailVariantPrice = variant.price_override || product.price || 0
    if (product.wholesale_price != null) return product.wholesale_price
    return Math.round(retailVariantPrice * (1 - wholesaleDiscountPct / 100))
}

/**
 * Calculate savings percentage between retail and wholesale price.
 */
export function getSavingsPercent(retailPrice: number, wholesalePrice: number): number {
    if (retailPrice <= 0) return 0
    return Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100)
}

/**
 * Format price in INR.
 */
export function formatPrice(price: number): string {
    return `₹${price.toLocaleString('en-IN')}`
}
