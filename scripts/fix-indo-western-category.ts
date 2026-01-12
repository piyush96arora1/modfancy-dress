import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixCategory() {
  // Get the correct category
  const { data: correctCategory, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'indo-western-dance-dress')
    .single()
  
  if (catError || !correctCategory) {
    console.error(`❌ Category "indo-western-dance-dress" not found:`, catError?.message)
    return
  }
  
  console.log(`✅ Found category: ${correctCategory.name} (ID: ${correctCategory.id})\n`)
  
  // Products that should be in indo-western-dance-dress category
  const productSlugs = [
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
  
  console.log(`🔍 Updating ${productSlugs.length} products to correct category...\n`)
  
  let updated = 0
  let notFound = 0
  let alreadyCorrect = 0
  
  for (const slug of productSlugs) {
    // Get product with current category
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug, category_id, category:categories(slug)')
      .eq('slug', slug)
      .maybeSingle()
    
    if (!product) {
      console.log(`❌ Product not found: ${slug}`)
      notFound++
      continue
    }
    
    const currentCategory = product.category as any
    
    if (currentCategory?.slug === 'indo-western-dance-dress') {
      console.log(`✅ Already correct: ${product.name}`)
      alreadyCorrect++
      continue
    }
    
    // Update category
    const { error: updateError } = await supabase
      .from('products')
      .update({ category_id: correctCategory.id })
      .eq('id', product.id)
    
    if (updateError) {
      console.error(`❌ Failed to update "${product.name}":`, updateError.message)
    } else {
      console.log(`✅ Updated: ${product.name}`)
      console.log(`   From: ${currentCategory?.slug || 'unknown'} → To: indo-western-dance-dress`)
      updated++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ✅ Already correct: ${alreadyCorrect}`)
  console.log(`   ❌ Not found: ${notFound}`)
  console.log(`   Total processed: ${productSlugs.length}`)
}

fixCategory().catch(console.error)

