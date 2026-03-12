import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export type UploadFolder = 'products-webp' | 'banners-webp' | 'categories-webp'

export async function uploadCompressedImage(
    file: File,
    folder: UploadFolder,
    filename?: string
): Promise<string> {
    const supabase = createClient()

    // Step 1: Compress in browser
    const compressed = await imageCompression(file, {
        maxSizeMB: 0.1,           // max 100KB
        maxWidthOrHeight: 1200,    // preserve aspect ratio, cap at 1200px
        useWebWorker: true,        // non-blocking
        fileType: 'image/webp',    // always output webp
        initialQuality: 0.85,      // matches our script quality
    })

    // Step 2: Generate filename
    // If the original file is already a webp, we might want to keep the name but append a timestamp
    // or just generate a new one to avoid collisions if not provided
    const name = filename
        ? `${filename}.webp`
        : `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

    const storagePath = `${folder}/${name}`

    // Step 3: Upload to Supabase
    const { error } = await supabase.storage
        .from('product-images')
        .upload(storagePath, compressed, {
            contentType: 'image/webp',
            cacheControl: '31536000', // 1 year
            upsert: false,
        })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    // Step 4: Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
}
