/**
 * Confirms the supplier catalog migration landed.
 *
 * Run after applying supabase/migrations/20260821120000_create_supplier_catalog.sql in the
 * Supabase SQL Editor. Exits non-zero on any problem so it can gate the import.
 *
 * Wrapped in main() rather than using top-level await: this repo has no "type": "module",
 * so tsx compiles scripts as CJS where top-level await is a build error.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  let failed = false

  for (const table of ['supplier_categories', 'supplier_products', 'supplier_product_images']) {
    const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.error(`FAIL ${table}: ${error.message}`)
      failed = true
    } else {
      console.log(`ok   ${table} (${count ?? 0} rows)`)
    }
  }

  const rpc = await supabase.rpc('search_supplier_catalog', {
    search_term: 'test',
    result_limit: 1,
  })
  if (rpc.error) {
    console.error(`FAIL search_supplier_catalog: ${rpc.error.message}`)
    failed = true
  } else {
    console.log('ok   search_supplier_catalog')
  }

  const setting = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'supplier_markup_pct')
    .maybeSingle()
  if (setting.error) {
    console.error(`FAIL site_settings: ${setting.error.message}`)
    failed = true
  } else if (!setting.data) {
    console.error('FAIL site_settings: supplier_markup_pct row missing')
    failed = true
  } else {
    console.log(`ok   supplier_markup_pct = ${JSON.stringify(setting.data.value)}`)
  }

  // The catalog pages read with the anon key, so verify RLS actually permits public reads.
  // A migration that creates tables but no working policy would build fine and 404 in production.
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (anonKey) {
    const anon = createClient(url, anonKey)
    const { error } = await anon.from('supplier_categories').select('id').limit(1)
    if (error) {
      console.error(`FAIL anon read of supplier_categories: ${error.message}`)
      failed = true
    } else {
      console.log('ok   anon (public) read permitted by RLS')
    }
  } else {
    console.warn('warn NEXT_PUBLIC_SUPABASE_ANON_KEY missing — skipped the RLS read check')
  }

  if (failed) {
    console.error('\nSchema is not ready. Apply the migration in the Supabase SQL Editor.')
    process.exit(1)
  }
  console.log('\nSchema ready.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
