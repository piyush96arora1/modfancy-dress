import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkProductSlugs() {
  const slugs = [
    'achkan-churidar-suit-for-boy',
    'achkan-dhoti-dress-for-boy',
    'contemporary-and-indo-western-costume',
    'contemporary-and-indo-western-dance-costume',
    'contemporary-and-indo-western-fancy-dress',
    'indo-western-dance-dress-in-silver-and-blue',
    'indo-western-dance-fancy-dres',
    'indo-western-dance-fancy-dress',
    'indo-western-dance-fancy-dress-costume',
    'indo-western-dance-kurta-fancy-dress-costume',
    'indo-western-fancy-dress-costume-magenta-green',
    'indo-western-style-long-skirt-top-fancy-dress',
    'multicolor-indo-western-fancy-dress-costume'
  ]
  
  console.log(`🔍 Checking ${slugs.length} product slugs...\n`)
  
  for (const slug of slugs) {
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, slug, category_id, deleted_at, is_active, category:categories(name, slug)')
      .eq('slug', slug)
      .maybeSingle()
    
    if (product) {
      const category = product.category as any
      console.log(`✅ Found: ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Category: ${category?.name || 'Unknown'} (${category?.slug || 'unknown'})`)
      console.log(`   Status: ${product.deleted_at ? '🗑️ Deleted' : product.is_active ? '✅ Active' : '⚠️ Inactive'}`)
      console.log(`   Category ID: ${product.category_id}\n`)
    } else {
      console.log(`❌ NOT FOUND: ${slug}\n`)
    }
  }
}

checkProductSlugs().catch(console.error)

