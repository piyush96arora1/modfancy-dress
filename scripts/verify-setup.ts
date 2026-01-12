import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

const COLLECTION_PATH = '/home/fa064236/Downloads/ModFancyDress-main/public/collection'

async function verifySetup() {
  console.log('🔍 Verifying setup...\n')
  
  // Check collection path
  console.log(`📁 Checking collection path: ${COLLECTION_PATH}`)
  try {
    const stats = await stat(COLLECTION_PATH)
    if (!stats.isDirectory()) {
      console.error('❌ Collection path exists but is not a directory')
      process.exit(1)
    }
    console.log('✅ Collection folder exists\n')
  } catch (error) {
    console.error('❌ Collection folder not found!')
    console.error(`   Path: ${COLLECTION_PATH}`)
    console.error('\nPlease ensure the collection folder is at the correct location.')
    process.exit(1)
  }
  
  // Check environment variables
  console.log('🔐 Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
    process.exit(1)
  }
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set')
  
  if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set')
    process.exit(1)
  }
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is set\n')
  
  // Count categories and products
  console.log('📊 Scanning collection structure...')
  try {
    const categories = await readdir(COLLECTION_PATH)
    const categoryDirs = []
    
    for (const cat of categories) {
      const catPath = path.join(COLLECTION_PATH, cat)
      const catStat = await stat(catPath)
      if (catStat.isDirectory()) {
        categoryDirs.push(cat)
      }
    }
    
    console.log(`✅ Found ${categoryDirs.length} category folders`)
    
    let totalProducts = 0
    let sampleCategories: string[] = []
    
    for (let i = 0; i < Math.min(5, categoryDirs.length); i++) {
      const catPath = path.join(COLLECTION_PATH, categoryDirs[i])
      const products = await readdir(catPath)
      const productDirs = []
      
      for (const prod of products) {
        const prodPath = path.join(catPath, prod)
        try {
          const prodStat = await stat(prodPath)
          if (prodStat.isDirectory()) {
            productDirs.push(prod)
          }
        } catch {
          // Skip files
        }
      }
      
      totalProducts += productDirs.length
      if (i === 0) {
        sampleCategories.push(`${categoryDirs[i]}: ${productDirs.length} products`)
      }
    }
    
    console.log(`📦 Sample: ${sampleCategories.join(', ')}`)
    console.log(`\n✅ Setup verification complete!`)
    console.log(`\n💡 Estimated products: ${totalProducts}+ (based on first 5 categories)`)
    console.log(`\n🚀 Ready to import! Run: npm run import:collection`)
    
  } catch (error: any) {
    console.error('❌ Error scanning collection:', error.message)
    process.exit(1)
  }
}

verifySetup().catch(console.error)

