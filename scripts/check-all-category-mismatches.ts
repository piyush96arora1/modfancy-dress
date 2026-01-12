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

interface CategoryMismatch {
  categorySlug: string
  categoryName: string
  expectedProducts: string[]
  actualProducts: string[]
  missing: string[]
  extra: string[]
  wrongCategory: Array<{slug: string, name: string, actualCategory: string}>
}

async function checkAllCategories() {
  console.log('🔍 Checking all categories for mismatches...\n')
  
  // Get all categories from collection folder
  const categoryFolders = await readdir(COLLECTION_PATH)
  const categoryMismatches: CategoryMismatch[] = []
  
  // Get all categories from database
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
  
  const categoryMap = new Map(dbCategories?.map(c => [c.slug, c]) || [])
  
  // Get all products from database with their categories
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
  
  console.log(`📊 Found ${categoryFolders.length} categories in collection folder\n`)
  
  for (const categoryFolder of categoryFolders) {
    const categoryPath = path.join(COLLECTION_PATH, categoryFolder)
    const categoryStat = await stat(categoryPath)
    
    if (!categoryStat.isDirectory()) continue
    
    // Get expected products from folder
    let productFolders: string[]
    try {
      productFolders = await readdir(categoryPath)
    } catch {
      continue
    }
    
    // Filter to only directories with images
    const expectedProducts: string[] = []
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
          expectedProducts.push(productFolder)
        }
      } catch {
        continue
      }
    }
    
    if (expectedProducts.length === 0) continue
    
    // Get category from database
    const dbCategory = categoryMap.get(categoryFolder)
    if (!dbCategory) {
      console.log(`⚠️  Category "${categoryFolder}" not found in database (has ${expectedProducts.length} products in folder)`)
      continue
    }
    
    // Get actual products in this category from database
    const actualProducts = Array.from(productMap.values())
      .filter(p => p.categorySlug === categoryFolder && !p.deleted)
      .map(p => p.slug)
    
    // Find mismatches
    const missing = expectedProducts.filter(slug => !actualProducts.includes(slug))
    const extra = actualProducts.filter(slug => !expectedProducts.includes(slug))
    
    // Find products that should be here but are in wrong category
    const wrongCategory: Array<{slug: string, name: string, actualCategory: string}> = []
    for (const slug of expectedProducts) {
      const product = productMap.get(slug)
      if (product && product.categorySlug !== categoryFolder && !product.deleted) {
        wrongCategory.push({
          slug,
          name: product.name,
          actualCategory: product.categoryName || product.categorySlug || 'unknown'
        })
      }
    }
    
    if (missing.length > 0 || extra.length > 0 || wrongCategory.length > 0) {
      categoryMismatches.push({
        categorySlug: categoryFolder,
        categoryName: dbCategory.name,
        expectedProducts,
        actualProducts,
        missing,
        extra,
        wrongCategory
      })
    }
  }
  
  // Report results
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 Category Mismatch Report`)
  console.log(`${'='.repeat(80)}\n`)
  
  if (categoryMismatches.length === 0) {
    console.log('✅ All categories match perfectly! No mismatches found.\n')
    return
  }
  
  console.log(`⚠️  Found ${categoryMismatches.length} categories with mismatches:\n`)
  
  for (const mismatch of categoryMismatches) {
    console.log(`\n📦 Category: ${mismatch.categoryName} (${mismatch.categorySlug})`)
    console.log(`   Expected products: ${mismatch.expectedProducts.length}`)
    console.log(`   Actual products: ${mismatch.actualProducts.length}`)
    
    if (mismatch.wrongCategory.length > 0) {
      console.log(`\n   ❌ Products in WRONG category (${mismatch.wrongCategory.length}):`)
      mismatch.wrongCategory.forEach(p => {
        console.log(`      - ${p.name} (${p.slug})`)
        console.log(`        Currently in: ${p.actualCategory}`)
        console.log(`        Should be in: ${mismatch.categoryName}`)
      })
    }
    
    if (mismatch.missing.length > 0) {
      console.log(`\n   ⚠️  Missing products (${mismatch.missing.length}):`)
      mismatch.missing.slice(0, 10).forEach(slug => {
        const product = productMap.get(slug)
        if (product) {
          console.log(`      - ${slug}`)
          console.log(`        Status: Exists in DB but in category "${product.categoryName || 'unknown'}"`)
        } else {
          console.log(`      - ${slug} (NOT FOUND in database at all)`)
        }
      })
      if (mismatch.missing.length > 10) {
        console.log(`      ... and ${mismatch.missing.length - 10} more`)
      }
    }
    
    if (mismatch.extra.length > 0) {
      console.log(`\n   ℹ️  Extra products (${mismatch.extra.length}) - products in DB but not in folder:`)
      mismatch.extra.slice(0, 5).forEach(slug => {
        const product = productMap.get(slug)
        console.log(`      - ${product?.name || slug}`)
      })
      if (mismatch.extra.length > 5) {
        console.log(`      ... and ${mismatch.extra.length - 5} more`)
      }
    }
  }
  
  // Summary
  const totalWrongCategory = categoryMismatches.reduce((sum, m) => sum + m.wrongCategory.length, 0)
  const totalMissing = categoryMismatches.reduce((sum, m) => sum + m.missing.length, 0)
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 Summary:`)
  console.log(`   Categories with issues: ${categoryMismatches.length}`)
  console.log(`   Products in wrong category: ${totalWrongCategory}`)
  console.log(`   Missing products: ${totalMissing}`)
  console.log(`${'='.repeat(80)}\n`)
  
  if (totalWrongCategory > 0) {
    console.log(`💡 Tip: Run the fix script to automatically move products to correct categories.`)
  }
}

checkAllCategories().catch(console.error)

