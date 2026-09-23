/**
 * Seed the date-windowed homepage for the Oct 2026 – Feb 2027 festival run
 * (plan: docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md, Task 2).
 *
 * - Upserts one homepage section per festival row below, matched by title.
 * - End-dates the Janmashtami section (31 Aug 2026).
 * - Upserts a Navratri hero banner pointing at /category/dandiya-dress, matched
 *   by link_url, using a garba chaniya choli photo already in storage.
 *
 * Windows are inclusive IST dates, read at render time by lib/utils/seasonal.ts.
 *
 * Before migration 20260923_homepage_sections_dates.sql is applied the date
 * columns don't exist. The script then falls back to writing `is_enabled` from
 * whether each row is active *today*, so the homepage is right now, and prints
 * a reminder. Re-run with --apply after the migration to write the real dates
 * (which re-enables every seeded row; the render-time filter takes over).
 *
 * Dry run:  npx tsx scripts/seed-seasonal-homepage.ts
 * Apply:    npx tsx scripts/seed-seasonal-homepage.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { isActiveOn, todayIST } from '../lib/utils/seasonal'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const TODAY = todayIST()

type SectionSeed = {
  title: string
  categorySlug: string
  starts_on: string
  ends_on: string
  sort_order: number
  product_count?: number
  /** Hide until the category has at least this many live products. */
  min_products?: number
}

// Within a window, sort_order decides which row leads (and gets the pricing toggle).
const SECTIONS: SectionSeed[] = [
  // Navratri 11–19 Oct 2026
  { title: 'Navratri Dandiya & Garba Dresses', categorySlug: 'dandiya-dress', starts_on: '2026-09-23', ends_on: '2026-10-19', sort_order: 0 },
  // Ramleela 11–20 Oct, Dussehra 20 Oct
  { title: 'Ramleela & Dussehra Costumes', categorySlug: 'ramleela-costumes', starts_on: '2026-09-23', ends_on: '2026-10-20', sort_order: 1 },
  // Halloween 31 Oct — only once the stock is listed (Task 10)
  { title: 'Halloween Costumes', categorySlug: 'halloween', starts_on: '2026-10-05', ends_on: '2026-10-31', sort_order: 2, min_products: 6 },
  // Diwali 8 Nov, Children's Day 14 Nov
  { title: "Children's Day Community Helper Costumes", categorySlug: 'helper-costumes', starts_on: '2026-10-21', ends_on: '2026-11-14', sort_order: 0 },
  { title: "Cartoon Character Costumes for Children's Day", categorySlug: 'cartoon-characters', starts_on: '2026-10-21', ends_on: '2026-11-14', sort_order: 1 },
  { title: 'Chacha Nehru & Freedom Fighter Costumes', categorySlug: 'leaders-freedom-fighters', starts_on: '2026-10-21', ends_on: '2026-11-14', sort_order: 2 },
  // Annual-function season. Both categories are thin today (2–3 products), so
  // they wait for Task 13 stock rather than showing a half-empty row.
  { title: 'Annual Function Dance Dresses', categorySlug: 'dance-dress', starts_on: '2026-11-01', ends_on: '2027-02-28', sort_order: 3, min_products: 4 },
  { title: 'Classical Dance Dresses for Annual Day', categorySlug: 'classical-dance-dress', starts_on: '2026-11-01', ends_on: '2027-02-28', sort_order: 4, min_products: 4 },
]

const JANMASHTAMI_CATEGORY = 'janmashtami-dress'
const JANMASHTAMI_ENDS_ON = '2026-08-31'

const NAVRATRI_BANNER = {
  link_url: '/category/dandiya-dress',
  alt_text: 'Dandiya & Garba Dresses — Buy or Rent for Navratri 2026',
  // Landscape flat-lay (1400x989) of a live product, so the centre crop holds up
  // in both the 2.16:1 mobile and 16:5 desktop frames.
  image_url:
    'https://udnidqllpmyoothwznbv.supabase.co/storage/v1/object/public/product-images/products-webp/rainbow-panel-mirror-work-garba-chaniya-choli.webp',
  starts_on: '2026-09-23',
  ends_on: '2026-10-19',
  sort_order: 0,
}

async function hasDateColumns(): Promise<boolean> {
  const a = await sb.from('homepage_sections').select('starts_on, ends_on, min_products').limit(1)
  const b = await sb.from('banners').select('starts_on, ends_on').limit(1)
  return !a.error && !b.error
}

async function write(label: string, op: () => PromiseLike<{ error: { message: string } | null }>) {
  if (!APPLY) return console.log(`  [dry] ${label}`)
  const { error } = await op()
  if (error) throw new Error(`${label}: ${error.message}`)
  console.log(`  [ok]  ${label}`)
}

async function main() {
  const dated = await hasDateColumns()
  console.log(`today (IST) ${TODAY} · date columns ${dated ? 'present' : 'MISSING — falling back to is_enabled for today'} · ${APPLY ? 'APPLY' : 'dry run'}`)

  const slugs = [...SECTIONS.map((s) => s.categorySlug), JANMASHTAMI_CATEGORY]
  const { data: cats, error: catErr } = await sb.from('categories').select('id, slug').in('slug', slugs)
  if (catErr) throw catErr
  const catId = new Map((cats ?? []).map((c) => [c.slug, c.id as string]))

  const { data: existing, error: exErr } = await sb.from('homepage_sections').select('id, title, category_id')
  if (exErr) throw exErr

  console.log('\nSections')
  for (const s of SECTIONS) {
    const category_id = catId.get(s.categorySlug)
    if (!category_id) {
      console.log(`  [skip] ${s.title}: category ${s.categorySlug} not found`)
      continue
    }
    const base = {
      title: s.title,
      source_type: 'category' as const,
      category_id,
      product_count: s.product_count ?? 8,
      sort_order: s.sort_order,
    }
    const row = dated
      ? { ...base, is_enabled: true, starts_on: s.starts_on, ends_on: s.ends_on, min_products: s.min_products ?? null }
      : { ...base, is_enabled: isActiveOn(s, TODAY) }
    const match = existing?.find((e) => e.title === s.title)
    const desc = `${s.title} (${s.categorySlug}) ${s.starts_on}→${s.ends_on}${s.min_products ? ` min ${s.min_products}` : ''} enabled=${row.is_enabled}`
    if (match) {
      await write(`update ${desc}`, () => sb.from('homepage_sections').update({ ...row, updated_at: new Date().toISOString() }).eq('id', match.id))
    } else {
      await write(`insert ${desc}`, () => sb.from('homepage_sections').insert(row))
    }
  }

  const janId = catId.get(JANMASHTAMI_CATEGORY)
  for (const j of existing?.filter((e) => e.category_id === janId) ?? []) {
    const patch = dated ? { ends_on: JANMASHTAMI_ENDS_ON } : { is_enabled: false }
    await write(`Janmashtami "${j.title}" -> ${JSON.stringify(patch)}`, () =>
      sb.from('homepage_sections').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', j.id))
  }

  console.log('\nBanner')
  const { data: banners, error: bErr } = await sb.from('banners').select('id, link_url').eq('link_url', NAVRATRI_BANNER.link_url)
  if (bErr) throw bErr
  const b = NAVRATRI_BANNER
  const bannerBase = {
    desktop_image_url: b.image_url,
    mobile_image_url: b.image_url,
    link_url: b.link_url,
    alt_text: b.alt_text,
    sort_order: b.sort_order,
  }
  const bannerRow = dated
    ? { ...bannerBase, is_enabled: true, starts_on: b.starts_on, ends_on: b.ends_on }
    : { ...bannerBase, is_enabled: isActiveOn(b, TODAY) }
  if (banners && banners.length > 0) {
    await write(`update banner ${b.link_url} ${b.starts_on}→${b.ends_on}`, () =>
      sb.from('banners').update({ ...bannerRow, updated_at: new Date().toISOString() }).eq('id', banners[0].id))
  } else {
    await write(`insert banner ${b.link_url} ${b.starts_on}→${b.ends_on}`, () => sb.from('banners').insert(bannerRow))
  }

  if (!dated) {
    console.log('\nNOTE: apply supabase/migrations/20260923_homepage_sections_dates.sql, then re-run with --apply to write the date windows.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
