import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkCategory() {
  const categorySlug = 'indo-western-dance-dress'
  
  // Check if category exists
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .single()
  
  if (catError || !category) {
    console.log(`❌ Category "${categorySlug}" does NOT exist in database`)
    console.log(`   Error: ${catError?.message || 'Not found'}`)
    return
  }
  
  console.log(`✅ Category exists: ${category.name} (${category.slug})`)
  console.log(`   Category ID: ${category.id}\n`)
  
  // Check products in this category
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, slug, deleted_at, is_active')
    .eq('category_id', category.id)
  
  if (prodError) {
    console.error(`❌ Error fetching products:`, prodError.message)
    return
  }
  
  const activeProducts = products?.filter(p => !p.deleted_at && p.is_active) || []
  const deletedProducts = products?.filter(p => p.deleted_at) || []
  const inactiveProducts = products?.filter(p => !p.deleted_at && !p.is_active) || []
  
  console.log(`📊 Products in category:`)
  console.log(`   Total: ${products?.length || 0}`)
  console.log(`   ✅ Active: ${activeProducts.length}`)
  console.log(`   🗑️  Soft-deleted: ${deletedProducts.length}`)
  console.log(`   ⚠️  Inactive: ${inactiveProducts.length}\n`)
  
  if (activeProducts.length > 0) {
    console.log(`✅ Active products:`)
    activeProducts.slice(0, 10).forEach(p => {
      console.log(`   - ${p.name} (${p.slug})`)
    })
    if (activeProducts.length > 10) {
      console.log(`   ... and ${activeProducts.length - 10} more`)
    }
  } else {
    console.log(`❌ No active products found in this category!`)
    
    if (deletedProducts.length > 0) {
      console.log(`\n🗑️  Soft-deleted products (${deletedProducts.length}):`)
      deletedProducts.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (${p.slug})`)
      })
    }
    
    if (inactiveProducts.length > 0) {
      console.log(`\n⚠️  Inactive products (${inactiveProducts.length}):`)
      inactiveProducts.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (${p.slug})`)
      })
    }
  }
  
  // Check what products should exist (from collection folder)
  console.log(`\n📁 Expected products from collection folder:`)
  const expectedProducts = [
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
  
  const foundSlugs = new Set(products?.map(p => p.slug) || [])
  const missing = expectedProducts.filter(slug => !foundSlugs.has(slug))
  
  console.log(`   Expected: ${expectedProducts.length}`)
  console.log(`   Found in DB: ${foundSlugs.size}`)
  console.log(`   Missing: ${missing.length}`)
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing products:`)
    missing.forEach(slug => {
      console.log(`   - ${slug}`)
    })
  }
}

checkCategory().catch(console.error)

