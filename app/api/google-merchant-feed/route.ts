import { createPublicServerClient } from '@/lib/supabase/public-server'
import { getImageUrl } from '@/lib/imageUrl'
import { variantUrl } from '@/lib/utils/image-variants'
import { getSchemaDisplayPrice } from '@/lib/seo/structured-data'

/**
 * Google Merchant Center product feed (RSS 2.0 with the g: namespace).
 *
 * Merchant Center account 5751272609 already lists ~330 products from its automatic crawl of
 * our Product JSON-LD, but (Nov 2026) it also holds /wholesale/<slug> links with no price
 * (6 disapproved), misses ~20 newer products, and files fruit/food costumes under "Food".
 * A feed of our own fixes all three: exact /products/ links, every live product within a
 * day of upload, and an explicit Google category. Add this URL in Merchant Center →
 * Data sources → Add product source → link to a file (daily fetch, India, English).
 *
 * Rules:
 * - Price = the buy price the page shows on load (getSchemaDisplayPrice, shared with the
 *   Product JSON-LD), or Merchant Center flags a price mismatch.
 * - Never a rent price (owner rule): products without a buy price are left out, not listed
 *   at their rent price.
 * - A Supabase error returns 503, never an empty feed (which would delete every listing).
 */

const SITE = 'https://www.modfancydress.com'
// Google product taxonomy: 5192 = Costumes, 5193 = Costume Accessories.
const CAT_COSTUME = '5192'
const CAT_ACCESSORY = '5193'

type FeedProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  meta_description: string | null
  price: number | null
  wholesale_price: number | null
  size: string | null
  category: { name: string; slug: string } | null
  product_images: { image_url: string; is_primary: boolean | null; order: number | null }[] | null
  product_variants:
    | { size: string | null; color: string | null; price_override: number | null; wholesale_price_override: number | null }[]
    | null
}

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** Markdown/HTML noise reads badly in Shopping. */
function clean(text: string, max = 5000): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

// age_group / gender are optional for India; send them only when the name (or the size
// field, for adults) says so outright. A wrong value hurts more than a missing one.
const ADULT = /\b(adult|adults|men|women|woman|ladies)\b/i
const KIDS = /\b(kid|kids|child|children|boy|boys|girl|girls|baby)\b/i
const FEMALE = /\b(girl|girls|women|woman|ladies|female)\b/i
const MALE = /\b(boy|boys|men|man|male)\b/i

function item(p: FeedProduct): string | null {
  const price = getSchemaDisplayPrice({ ...p, variants: p.product_variants ?? [] })
  const images = [...(p.product_images || [])].sort(
    (a, b) => Number(!!b.is_primary) - Number(!!a.is_primary) || (a.order ?? 0) - (b.order ?? 0)
  )
  if (!(price > 0) || images.length === 0) return null

  const img = (u: string) => variantUrl(getImageUrl(u), 1600)
  const text = `${p.name} ${p.description ?? ''}`
  const saysAdult = ADULT.test(p.name) || /^adult$/i.test(p.size ?? '')
  const saysKids = KIDS.test(p.name)
  const ageGroup = saysAdult && !saysKids ? 'adult' : saysKids && !saysAdult ? 'kids' : null
  const female = FEMALE.test(p.name)
  const male = MALE.test(p.name)
  const gender = female && !male ? 'female' : male && !female ? 'male' : null
  const isAccessory = p.category?.slug === 'accessories'
  const description = clean(p.description || p.meta_description || `${p.name} fancy dress costume`)

  const fields: [string, string][] = [
    ['g:id', p.id],
    ['title', clean(p.name, 150)],
    ['description', description],
    ['link', `${SITE}/products/${p.slug}`],
    ['g:image_link', img(images[0].image_url)],
    ...images.slice(1, 11).map((i): [string, string] => ['g:additional_image_link', img(i.image_url)]),
    ['g:price', `${price.toFixed(2)} INR`],
    ['g:availability', 'in_stock'],
    ['g:condition', 'new'],
    ['g:brand', 'Mod Fancy Dress'],
    ['g:identifier_exists', 'no'],
    ['g:google_product_category', isAccessory ? CAT_ACCESSORY : CAT_COSTUME],
    ['g:product_type', `Fancy Dress > ${p.category?.name ?? 'Costumes'}`],
    ...(ageGroup ? ([['g:age_group', ageGroup]] as [string, string][]) : []),
    ...(gender ? ([['g:gender', gender]] as [string, string][]) : []),
  ]
  if (!isAccessory && /\b(dance|dress|costume)\b/i.test(text)) {
    fields.push(['g:product_highlight', 'Same-day delivery in Delhi NCR or pickup from our Krishna Nagar shop'])
    fields.push(['g:product_highlight', 'Courier delivery across India'])
  }
  return `<item>${fields.map(([k, v]) => `<${k}>${xml(v)}</${k}>`).join('')}</item>`
}

export async function GET() {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, slug, description, meta_description, price, wholesale_price, size, category:categories(name, slug), product_images(image_url, is_primary, order), product_variants(size, color, price_override, wholesale_price_override)'
    )
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error || !data?.length) {
    return new Response('Catalogue temporarily unavailable', { status: 503 })
  }

  const items = (data as unknown as FeedProduct[]).map(item).filter((i): i is string => i !== null)
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>' +
    '<title>Mod Fancy Dress</title>' +
    `<link>${SITE}</link>` +
    '<description>Fancy dress costumes from Mod Fancy Dress, Krishna Nagar, Delhi</description>' +
    items.join('') +
    '</channel></rss>'

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
