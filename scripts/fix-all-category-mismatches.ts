import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

config({ path: resolve(process.cwd(), '.env.local') })

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const COLLECTION_PATH = '/home/fa064236/Downloads/ModFancyDress-main/public/collection'

interface ProductFix {
  slug: string
  name: string
  correctCategorySlug: string
  correctCategoryId: string
  currentCategorySlug: string
}

async function fixAllCategories() {
  console.log('🔧 Fixing all category mismatches...\n')
  
  // Get all categories from database
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
  
  const categoryMap = new Map(dbCategories?.map(c => [c.slug, c]) || [])
  
  // Get all products from database
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, category_id, deleted_at, category:categories(slug, name)')
  
  const productMap = new Map(allProducts?.map(p => {
    const cat = p.category as any
    return [p.slug, {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categorySlug: cat?.slug,
      categoryName: cat?.name,
      deleted: !!p.deleted_at
    }]
  }) || [])
  
  // Build mapping: product slug -> correct category slug
  const productToCategory = new Map<string, string>()
  
  // Scan collection folder
  const categoryFolders = await readdir(COLLECTION_PATH)
  
  for (const categoryFolder of categoryFolders) {
    const categoryPath = path.join(COLLECTION_PATH, categoryFolder)
    const categoryStat = await stat(categoryPath)
    
    if (!categoryStat.isDirectory()) continue
    
    // Get products in this category folder
    let productFolders: string[]
    try {
      productFolders = await readdir(categoryPath)
    } catch {
      continue
    }
    
    for (const productFolder of productFolders) {
      const productPath = path.join(categoryPath, productFolder)
      try {
        const productStat = await stat(productPath)
        if (!productStat.isDirectory()) continue
        
        const files = await readdir(productPath)
        const hasImages = files.some(f => {
          const ext = path.extname(f).toLowerCase()
          return ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.png'
        })
        
        if (hasImages) {
          productToCategory.set(productFolder, categoryFolder)
        }
      } catch {
        continue
      }
    }
  }
  
  console.log(`📊 Found ${productToCategory.size} products in collection folders\n`)
  
  // Find products that need fixing
  const fixes: ProductFix[] = []
  
  for (const [productSlug, correctCategorySlug] of productToCategory.entries()) {
    const product = productMap.get(productSlug)
    if (!product || product.deleted) continue
    
    const correctCategory = categoryMap.get(correctCategorySlug)
    if (!correctCategory) {
      console.warn(`⚠️  Category "${correctCategorySlug}" not found in database for product "${productSlug}"`)
      continue
    }
    
    if (product.categorySlug !== correctCategorySlug) {
      fixes.push({
        slug: productSlug,
        name: product.name,
        correctCategorySlug,
        correctCategoryId: correctCategory.id,
        currentCategorySlug: product.categorySlug || 'unknown'
      })
    }
  }
  
  if (fixes.length === 0) {
    console.log('✅ No products need fixing! All categories are correct.\n')
    return
  }
  
  console.log(`🔧 Found ${fixes.length} products that need category fixes\n`)
  console.log(`Starting fixes...\n`)
  
  let fixed = 0
  let failed = 0
  const errors: Array<{slug: string, error: string}> = []
  
  // Group fixes by category for better progress reporting
  const fixesByCategory = new Map<string, ProductFix[]>()
  for (const fix of fixes) {
    if (!fixesByCategory.has(fix.correctCategorySlug)) {
      fixesByCategory.set(fix.correctCategorySlug, [])
    }
    fixesByCategory.get(fix.correctCategorySlug)!.push(fix)
  }
  
  // Process fixes
  for (const [categorySlug, categoryFixes] of fixesByCategory.entries()) {
    const category = categoryMap.get(categorySlug)!
    console.log(`\n📦 Fixing ${categoryFixes.length} products in "${category.name}"...`)
    
    for (const fix of categoryFixes) {
      const product = productMap.get(fix.slug)!
      
      const { error } = await supabase
        .from('products')
        .update({ category_id: fix.correctCategoryId })
        .eq('id', product.id)
      
      if (error) {
        console.error(`   ❌ Failed: ${fix.name}`, error.message)
        errors.push({ slug: fix.slug, error: error.message })
        failed++
      } else {
        fixed++
        if (fixed % 10 === 0 || fixed === categoryFixes.length) {
          console.log(`   ✅ Fixed ${fixed}/${fixes.length}: ${fix.name}`)
          console.log(`      ${fix.currentCategorySlug} → ${fix.correctCategorySlug}`)
        }
      }
    }
  }
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 Fix Summary:`)
  console.log(`   ✅ Fixed: ${fixed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   Total: ${fixes.length}`)
  console.log(`${'='.repeat(80)}\n`)
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered:`)
    errors.slice(0, 10).forEach(e => {
      console.log(`   - ${e.slug}: ${e.error}`)
    })
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`)
    }
  }
  
  if (fixed > 0) {
    console.log(`\n✅ Successfully fixed ${fixed} products!`)
  }
}

fixAllCategories().catch(console.error)

