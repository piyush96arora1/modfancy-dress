import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const COLLECTION_PATH = '/home/fa064236/Downloads/ModFancyDress-main/public/collection'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function checkMissingProducts() {
  console.log('🔍 Checking for missing products...\n')
  
  // Verify connection
  try {
    const { error } = await supabase.from('products').select('count').limit(1)
    if (error) throw error
    console.log('✅ Connected to Supabase\n')
  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    process.exit(1)
  }
  
  // Get all products from database (including soft-deleted)
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('slug, name, deleted_at, category:categories(slug)')
    .limit(10000) // Ensure we get all products
  
  if (dbError) {
    console.error('❌ Error fetching products:', dbError.message)
    process.exit(1)
  }
  
  const allDbProducts = dbProducts || []
  const activeProducts = allDbProducts.filter(p => !p.deleted_at)
  const deletedProducts = allDbProducts.filter(p => p.deleted_at)
  
  const dbSlugs = new Set(allDbProducts.map(p => p.slug))
  const activeSlugs = new Set(activeProducts.map(p => p.slug))
  
  console.log(`📊 Total products in database: ${allDbProducts.length}`)
  console.log(`   ✅ Active products: ${activeProducts.length}`)
  console.log(`   🗑️  Soft-deleted products: ${deletedProducts.length}\n`)
  
  // Scan collection folder
  if (!(await fileExists(COLLECTION_PATH))) {
    console.error(`❌ Collection path does not exist: ${COLLECTION_PATH}`)
    process.exit(1)
  }
  
  const categories = await readdir(COLLECTION_PATH)
  const missingProducts: Array<{category: string, slug: string, name: string}> = []
  const foundProducts: Array<{category: string, slug: string}> = []
  const slugCounts = new Map<string, number>() // Track duplicate slugs
  
  for (const categoryFolder of categories) {
    const categoryPath = path.join(COLLECTION_PATH, categoryFolder)
    const categoryStat = await stat(categoryPath)
    if (!categoryStat.isDirectory()) continue
    
    try {
      const productFolders = await readdir(categoryPath)
      for (const productFolder of productFolders) {
        const productPath = path.join(categoryPath, productFolder)
        try {
          const productStat = await stat(productPath)
          if (!productStat.isDirectory()) continue
          
          // Check if product has images
          const files = await readdir(productPath)
          const hasImages = files.some(f => {
            const ext = path.extname(f).toLowerCase()
            return ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.png'
          })
          
          if (!hasImages) continue
          
          const name = slugToName(productFolder)
          const existsInDb = dbSlugs.has(productFolder)
          const isActive = activeSlugs.has(productFolder)
          
          // Track slug occurrences (for duplicate detection)
          slugCounts.set(productFolder, (slugCounts.get(productFolder) || 0) + 1)
          
          if (!existsInDb) {
            missingProducts.push({
              category: categoryFolder,
              slug: productFolder,
              name
            })
          } else {
            foundProducts.push({
              category: categoryFolder,
              slug: productFolder
            })
            
            // Check if it's soft-deleted
            const dbProduct = allDbProducts.find(p => p.slug === productFolder)
            if (dbProduct?.deleted_at) {
              // Note: This product exists but is soft-deleted
            }
          }
        } catch {
          continue
        }
      }
    } catch (error) {
      console.warn(`⚠️  Cannot read category: ${categoryFolder}`)
    }
  }
  
  const totalInCollection = foundProducts.length + missingProducts.length
  const existingInDb = foundProducts.length
  const uniqueSlugsInCollection = slugCounts.size
  const duplicateSlugs = Array.from(slugCounts.entries()).filter(([_, count]) => count > 1)
  
  console.log(`📦 Total products scanned in collection: ${totalInCollection}`)
  console.log(`   Unique slugs in collection: ${uniqueSlugsInCollection}`)
  if (duplicateSlugs.length > 0) {
    console.log(`   ⚠️  Duplicate slugs found: ${duplicateSlugs.length}`)
    console.log(`      Example duplicates: ${duplicateSlugs.slice(0, 5).map(([slug]) => slug).join(', ')}`)
  }
  console.log(`✅ Products found in database (by slug): ${existingInDb}`)
  console.log(`❌ Missing products (not in database): ${missingProducts.length}`)
  console.log(`\n📊 Database Statistics:`)
  console.log(`   Total products: ${allDbProducts.length}`)
  console.log(`   Active products: ${activeProducts.length}`)
  console.log(`   Soft-deleted: ${deletedProducts.length}`)
  
  // Compare unique slugs, not total matches (which includes duplicates)
  const uniqueFoundInDb = new Set(foundProducts.map(p => p.slug)).size
  
  if (allDbProducts.length !== uniqueFoundInDb) {
    const diff = allDbProducts.length - uniqueFoundInDb
    if (diff > 0) {
      console.log(`\n⚠️  Note: Database has ${allDbProducts.length} products, but only ${uniqueFoundInDb} unique slugs match collection.`)
      console.log(`   Difference: ${diff} products in DB don't match collection folder names.`)
      console.log(`   These might be manually created products or have different slugs.\n`)
    } else {
      console.log(`\n✅ All unique collection products (${uniqueFoundInDb}) are in the database!`)
      console.log(`   Note: ${totalInCollection - uniqueSlugsInCollection} duplicate folders found across categories.\n`)
    }
  } else {
    console.log(`\n✅ All unique collection products (${uniqueFoundInDb}) are in the database!`)
    if (duplicateSlugs.length > 0) {
      console.log(`   Note: ${totalInCollection - uniqueSlugsInCollection} duplicate folders found across categories.\n`)
    } else {
      console.log('')
    }
  }
  
  if (missingProducts.length > 0) {
    console.log('='.repeat(60))
    console.log('Missing Products by Category:\n')
    
    const byCategory = new Map<string, Array<{slug: string, name: string}>>()
    missingProducts.forEach(p => {
      if (!byCategory.has(p.category)) {
        byCategory.set(p.category, [])
      }
      byCategory.get(p.category)!.push({ slug: p.slug, name: p.name })
    })
    
    for (const [category, products] of Array.from(byCategory.entries()).sort()) {
      console.log(`\n📁 ${category} (${products.length} missing):`)
      products.forEach(p => console.log(`   - ${p.name} (${p.slug})`))
    }
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`\n💡 To import missing products, run: npm run import:collection`)
  } else {
    console.log('✅ All products from collection are in the database!')
  }
}

checkMissingProducts().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

