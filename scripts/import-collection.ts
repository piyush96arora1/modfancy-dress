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
const readFile = promisify(fs.readFile)

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const COLLECTION_PATH = '/home/fa064236/Downloads/ModFancyDress-main/public/collection'
const DEFAULT_PRICE = 400

interface ProductData {
  name: string
  slug: string
  categorySlug: string
  images: string[]
  displayImage: string
}

// Convert folder name to readable name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function uploadImageToStorage(filePath: string, fileName: string): Promise<string> {
  try {
    const fileBuffer = await readFile(filePath)
    const fileExt = path.extname(fileName).toLowerCase()
    
    // Determine content type
    let contentType = 'image/jpeg'
    if (fileExt === '.webp') contentType = 'image/webp'
    if (fileExt === '.png') contentType = 'image/png'
    
    const storagePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      })

    if (uploadError) {
      // If file already exists, get the public URL
      if (uploadError.message.includes('already exists') || uploadError.message.includes('duplicate')) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath)
        return publicUrl
      }
      console.error(`Error uploading ${fileName}:`, uploadError.message)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)

    return publicUrl
  } catch (error: any) {
    console.error(`Failed to upload ${fileName}:`, error.message)
    throw error
  }
}

async function scanCollection(): Promise<Map<string, ProductData[]>> {
  const categoryProducts = new Map<string, ProductData[]>()
  
  // Check if collection path exists
  if (!(await fileExists(COLLECTION_PATH))) {
    throw new Error(`Collection path does not exist: ${COLLECTION_PATH}`)
  }
  
  try {
    const categories = await readdir(COLLECTION_PATH)
    
    for (const categoryFolder of categories) {
      const categoryPath = path.join(COLLECTION_PATH, categoryFolder)
      const categoryStat = await stat(categoryPath)
      
      if (!categoryStat.isDirectory()) continue
      
      const products: ProductData[] = []
      let productFolders: string[]
      
      try {
        productFolders = await readdir(categoryPath)
      } catch (error) {
        console.warn(`⚠️  Cannot read category folder: ${categoryFolder}`)
        continue
      }
      
      for (const productFolder of productFolders) {
        const productPath = path.join(categoryPath, productFolder)
        let productStat
        
        try {
          productStat = await stat(productPath)
        } catch {
          continue
        }
        
        if (!productStat.isDirectory()) continue
        
        // Get all files in product folder
        let files: string[]
        try {
          files = await readdir(productPath)
        } catch {
          continue
        }
        
        const imageFiles = files.filter(f => {
          const ext = path.extname(f).toLowerCase()
          return ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.png'
        })
        
        if (imageFiles.length === 0) continue
        
        // Find display image and numbered images
        const displayImage = imageFiles.find(f => f.includes('-display.webp') || f.includes('-display.'))
        const numberedImages = imageFiles
          .filter(f => {
            const isDisplay = f.includes('display')
            const hasNumber = /\d+/.test(f)
            return !isDisplay && hasNumber
          })
          .sort((a, b) => {
            const numA = parseInt(a.match(/-(\d+)\./)?.[1] || '0')
            const numB = parseInt(b.match(/-(\d+)\./)?.[1] || '0')
            return numA - numB
          })
        
        // If no numbered images but we have display image, use it
        const allImages = numberedImages.length > 0 ? numberedImages : (displayImage ? [displayImage] : imageFiles.slice(0, 1))
        const displayImagePath = displayImage 
          ? path.join(productPath, displayImage)
          : allImages.length > 0 
            ? path.join(productPath, allImages[0])
            : ''
        
        if (displayImagePath) {
          products.push({
            name: slugToName(productFolder),
            slug: productFolder,
            categorySlug: categoryFolder,
            images: allImages.map(img => path.join(productPath, img)),
            displayImage: displayImagePath
          })
        }
      }
      
      if (products.length > 0) {
        categoryProducts.set(categoryFolder, products)
      }
    }
  } catch (error: any) {
    console.error('Error scanning collection:', error.message)
    throw error
  }
  
  return categoryProducts
}

async function createOrGetCategory(name: string, slug: string): Promise<string> {
  // Check if category exists - use maybeSingle() to avoid errors when not found
  const { data: existing, error: checkError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  
  if (existing) {
    return existing.id
  }
  
  // Log if there was an error checking (other than "not found" which is expected)
  if (checkError && checkError.code !== 'PGRST116') {
    console.warn(`⚠️  Error checking category "${name}":`, checkError.message)
  }
  
  // Create category
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description: null
    })
    .select()
    .single()
  
  if (error) {
    console.error(`Error creating category "${name}":`, error.message)
    throw error
  }
  
  return data.id
}

async function importProducts() {
  console.log('🚀 Starting collection import...')
  console.log(`📁 Collection path: ${COLLECTION_PATH}\n`)
  
  // Verify Supabase connection
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    if (error) throw error
    console.log('✅ Connected to Supabase\n')
  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    process.exit(1)
  }
  
  // Scan collection folder
  console.log('📁 Scanning collection folder...')
  let categoryProducts: Map<string, ProductData[]>
  
  try {
    categoryProducts = await scanCollection()
  } catch (error: any) {
    console.error('❌ Error scanning collection:', error.message)
    process.exit(1)
  }
  
  console.log(`✅ Found ${categoryProducts.size} categories\n`)
  
  // Create categories and import products
  let totalProducts = 0
  let totalImages = 0
  let skippedProducts = 0
  let errors = 0
  
  const categories = Array.from(categoryProducts.entries())
  
  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const [categorySlug, products] = categories[catIdx]
    
    console.log(`\n📦 [${catIdx + 1}/${categories.length}] Processing category: ${categorySlug}`)
    console.log(`   Products found: ${products.length}`)
    
    // Create category
    const categoryName = slugToName(categorySlug)
    let categoryId: string
    
    try {
      categoryId = await createOrGetCategory(categoryName, categorySlug)
      console.log(`   ✅ Category: ${categoryName}`)
    } catch (error: any) {
      console.error(`   ❌ Failed to create category: ${error.message}`)
      errors++
      continue
    }
    
    // Import products in this category
    for (let prodIdx = 0; prodIdx < products.length; prodIdx++) {
      const product = products[prodIdx]
      
      try {
        // Check if product already exists in THIS category - use maybeSingle() to avoid errors when not found
        // Note: We check by slug + category_id to handle cases where same slug exists in different categories
        const { data: existing, error: checkError } = await supabase
          .from('products')
          .select('id, name, category_id')
          .eq('slug', product.slug)
          .eq('category_id', categoryId)
          .maybeSingle() // Returns null if not found instead of throwing error
        
        if (existing) {
          skippedProducts++
          // Log skipped products (first 20 and every 50th for visibility)
          if (skippedProducts <= 20 || skippedProducts % 50 === 0) {
            console.log(`   ⏭️  [${skippedProducts}] Skipped: "${product.name}" (already exists in this category)`)
          }
          continue
        }
        
        // Also check if product exists in a DIFFERENT category (by slug only)
        // This helps identify potential mis-categorizations
        const { data: existingInOtherCategory } = await supabase
          .from('products')
          .select('id, name, category_id, category:categories(name, slug)')
          .eq('slug', product.slug)
          .neq('category_id', categoryId)
          .maybeSingle()
        
        if (existingInOtherCategory) {
          const otherCategory = existingInOtherCategory.category as any
          console.log(`   ⚠️  Product "${product.name}" exists in different category: ${otherCategory?.name || 'unknown'} (${otherCategory?.slug || 'unknown'})`)
          console.log(`      Skipping import - product already exists with this slug in another category`)
          skippedProducts++
          continue
        }
        
        // Log if there was an error checking (other than "not found" which is expected)
        if (checkError && checkError.code !== 'PGRST116') {
          console.warn(`   ⚠️  Error checking "${product.name}":`, checkError.message)
        }
        
        // Create product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            slug: product.slug,
            category_id: categoryId,
            price: DEFAULT_PRICE,
            is_active: true,
            quantity: null,
            size: null,
            description: null
          })
          .select()
          .single()
        
        if (productError) {
          console.error(`   ❌ [${prodIdx + 1}/${products.length}] Error creating "${product.name}":`, productError.message)
          console.error(`      Slug: ${product.slug}, Category: ${categorySlug}`)
          errors++
          continue
        }
        
        const productId = productData.id
        
        // Upload and link images
        const imageUrls: { url: string; isPrimary: boolean; order: number }[] = []
        
        // Upload display image first (as primary)
        if (product.displayImage && await fileExists(product.displayImage)) {
          const displayFileName = path.basename(product.displayImage)
          try {
            const displayUrl = await uploadImageToStorage(product.displayImage, displayFileName)
            imageUrls.push({ url: displayUrl, isPrimary: true, order: 0 })
            totalImages++
          } catch (error: any) {
            console.warn(`   ⚠️  Failed to upload display image for "${product.name}":`, error.message)
          }
        }
        
        // Upload numbered images
        for (let i = 0; i < product.images.length; i++) {
          const imagePath = product.images[i]
          
          if (!(await fileExists(imagePath))) continue
          
          const fileName = path.basename(imagePath)
          const displayFileName = product.displayImage ? path.basename(product.displayImage) : ''
          
          // Skip if it's the same as display image
          if (displayFileName && displayFileName === fileName) {
            continue
          }
          
          try {
            const imageUrl = await uploadImageToStorage(imagePath, fileName)
            imageUrls.push({ 
              url: imageUrl, 
              isPrimary: imageUrls.length === 0, // Make first image primary if no display image
              order: imageUrls.length 
            })
            totalImages++
          } catch (error: any) {
            console.warn(`   ⚠️  Failed to upload image ${i + 1} for "${product.name}":`, error.message)
          }
        }
        
        // Insert image records
        if (imageUrls.length > 0) {
          const { error: imageError } = await supabase
            .from('product_images')
            .insert(
              imageUrls.map((img) => ({
                product_id: productId,
                image_url: img.url,
                is_primary: img.isPrimary,
                order: img.order
              }))
            )
          
          if (imageError) {
            console.warn(`   ⚠️  Error linking images for "${product.name}":`, imageError.message)
          }
        }
        
        totalProducts++
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error: any) {
        console.error(`   ❌ Error importing product "${product.name}":`, error.message)
        console.error(`      Slug: ${product.slug}, Category: ${categorySlug}`)
        errors++
      }
    }
    
    console.log(`   ✅ Completed: ${totalProducts} products imported, ${skippedProducts} skipped`)
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Import Summary:`)
  console.log(`   Categories processed: ${categoryProducts.size}`)
  console.log(`   Products imported: ${totalProducts}`)
  console.log(`   Products skipped (already exist): ${skippedProducts}`)
  console.log(`   Images uploaded: ${totalImages}`)
  if (errors > 0) {
    console.log(`   ⚠️  Errors encountered: ${errors}`)
    console.log(`   💡 Check error messages above for details`)
  }
  console.log(`\n💡 Note: Skipped products already exist in database (by slug).`)
  console.log(`   To re-import skipped products, delete them first or use --force flag.`)
  console.log(`${'='.repeat(60)}\n`)
}

// Run import
importProducts().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

