import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateCategoryImages() {
    console.log('🔄 Fetching all categories...')

    // 1. Fetch all active categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)

    if (catError) {
        console.error('Error fetching categories:', catError)
        process.exit(1)
    }

    if (!categories || categories.length === 0) {
        console.log('No active categories found.')
        return
    }

    console.log(`Found ${categories.length} active categories. Finding suitable product images...`)

    let updatedCount = 0;
    let skippedCount = 0;

    // 2. Iterate through each category
    for (const category of categories) {
        // 3. Find the first active product that belongs to this category via the junction table
        const { data: productCategories, error: pcError } = await supabase
            .from('product_categories')
            .select(`
        product_id,
        products!inner (
          id,
          name,
          is_active,
          deleted_at,
          images:product_images (
            image_url,
            is_primary
          )
        )
      `)
            .eq('category_id', category.id)
            .eq('products.is_active', true)
            .is('products.deleted_at', null)
            .limit(10) // Fetch a few to find the best image

        if (pcError) {
            console.warn(`⚠️ Error reading products for category ${category.name}:`, pcError.message)
            skippedCount++;
            continue;
        }

        if (!productCategories || productCategories.length === 0) {
            console.log(`⏭️  Skipped: ${category.name} (No active products found)`)
            skippedCount++;
            continue;
        }

        // Attempt to extract the primary image from the first valid product
        let bestImageUrl: string | null = null;
        let selectedProductName: string = '';

        for (const pc of productCategories) {
            const p = pc.products as any;
            if (p.images && p.images.length > 0) {
                const primaryImg = p.images.find((img: any) => img.is_primary);
                if (primaryImg) {
                    bestImageUrl = primaryImg.image_url;
                    selectedProductName = p.name;
                    break;
                } else if (!bestImageUrl) {
                    // Fallback to first available image
                    bestImageUrl = p.images[0].image_url;
                    selectedProductName = p.name;
                }
            }
        }

        if (bestImageUrl) {
            // 4. Update the category with the found image URL
            const { error: updateError } = await supabase
                .from('categories')
                .update({ image_url: bestImageUrl })
                .eq('id', category.id)

            if (updateError) {
                console.error(`❌ Failed to update category ${category.name}:`, updateError.message)
            } else {
                console.log(`✅ Updated: ${category.name} -> Image from: ${selectedProductName}`)
                updatedCount++;
            }
        } else {
            console.log(`⏭️  Skipped: ${category.name} (Products found, but no images)`)
            skippedCount++;
        }
    }

    console.log('\n🎉 Finished processing category images!')
    console.log(`Total Categories: ${categories.length}`)
    console.log(`Updated: ${updatedCount}`)
    console.log(`Skipped (No Image): ${skippedCount}`)
}

populateCategoryImages()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Unhandled error:', err)
        process.exit(1)
    })
