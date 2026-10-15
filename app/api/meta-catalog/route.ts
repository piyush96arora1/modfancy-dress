import { createPublicServerClient } from '@/lib/supabase/public-server'

/**
 * Product feed for the Meta catalogue ("Mod Fancy Dresses" business portfolio → Commerce
 * Manager → Data sources → scheduled feed of this URL). Meta fetches it on a schedule, so an
 * admin upload reaches Instagram/Facebook shopping and catalogue ads without manual work.
 *
 * Format: Meta's TSV feed spec. `id` is the product UUID — the same id the Meta Pixel sends
 * as content_ids (lib/analytics/metaPixel.ts), which is what links site visits to catalogue
 * items for retargeting ads.
 */
// Dynamic + CDN cache on success only: ISR would bake a Supabase-outage response in for the
// whole revalidate window, while a CDN header never applies to the 503 below.
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'

// Google product taxonomy 5192: Apparel & Accessories > Costumes & Accessories > Costumes.
const GOOGLE_PRODUCT_CATEGORY = '5192'

const COLUMNS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'additional_image_link',
  'brand',
  'google_product_category',
  'product_type',
  'custom_label_0',
] as const

type Row = Record<(typeof COLUMNS)[number], string>

interface FeedProduct {
  id: string
  name: string
  slug: string
  description: string | null
  meta_description: string | null
  price: number | null
  rent_price: number | null
  category: { name: string } | null
  product_images: { image_url: string; is_primary: boolean | null; order: number | null }[] | null
}

/** Tabs/newlines would break the TSV; markdown/HTML noise reads badly in ads. */
function clean(text: string, max = 5000): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function toRow(p: FeedProduct): Row | null {
  // Rent-only products have no sale price; Meta requires one, so they list at the rent price
  // and say so in the title.
  const amount = p.price ?? p.rent_price
  const images = [...(p.product_images || [])].sort(
    (a, b) => Number(!!b.is_primary) - Number(!!a.is_primary) || (a.order ?? 0) - (b.order ?? 0),
  )
  if (!amount || images.length === 0) return null

  const rentOnly = p.price == null
  const description = clean(p.description || p.meta_description || p.name)
  return {
    id: p.id,
    title: clean(rentOnly ? `${p.name} (on rent)` : p.name, 200),
    description,
    // Stock is never the blocker for this shop: costumes are made or sourced to order.
    availability: 'in stock',
    condition: 'new',
    price: `${amount.toFixed(2)} INR`,
    link: `${SITE_URL}/products/${p.slug}`,
    image_link: images[0].image_url,
    additional_image_link: images
      .slice(1, 10)
      .map((i) => i.image_url)
      .join(','),
    brand: 'Mod Fancy Dress',
    google_product_category: GOOGLE_PRODUCT_CATEGORY,
    product_type: p.category?.name ?? 'Fancy Dress Costumes',
    custom_label_0: p.rent_price != null ? 'rentable' : 'buy only',
  }
}

export async function GET() {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, slug, description, meta_description, price, rent_price, category:categories(name), product_images(image_url, is_primary, order)',
    )
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Never serve an empty feed: Meta would delete every catalogue item. A 503 makes it keep
  // the last good fetch and retry.
  if (error || !data?.length) {
    return new Response('Catalogue temporarily unavailable', { status: 503 })
  }

  const rows = (data as unknown as FeedProduct[]).map(toRow).filter((r): r is Row => r !== null)
  const tsv = [COLUMNS.join('\t'), ...rows.map((r) => COLUMNS.map((c) => r[c]).join('\t'))].join('\n')

  return new Response(tsv, {
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
