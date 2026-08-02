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

    // Step 1: Compress in browser.
    //
    // `alwaysKeepResolution` is what keeps images sharp. Without it the library is free to
    // halve the pixel dimensions over and over trying to reach `maxSizeMB`, and a photo that
    // can't hit the target just gets downscaled until it gives up — that was the source of
    // the blurry uploads. With it on, the image is resized once to `maxWidthOrHeight` and
    // everything after that is quality-only.
    const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,             // ~400KB; 100KB was unreachable and forced downscaling
        maxWidthOrHeight: 1600,     // preserve aspect ratio, cap at 1600px
        useWebWorker: true,         // non-blocking
        fileType: 'image/webp',     // preferred output; see the guard below
        initialQuality: 0.92,
        alwaysKeepResolution: true, // never trade pixels for file size
    })

    // Step 2: Generate filename.
    //
    // Trust what the browser actually produced rather than assuming webp. `canvas.toBlob()`
    // silently falls back to image/png when it can't encode the requested type, and naming a
    // PNG `.webp` (with a webp content-type) misrepresents the file to every client that
    // fetches it. Deriving both from `compressed.type` keeps them honest.
    const isWebp = compressed.type === 'image/webp'
    const ext = isWebp ? 'webp' : 'png'

    const name = filename
        ? `${filename}.${ext}`
        : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const storagePath = `${folder}/${name}`

    // Step 3: Upload to Supabase
    const { error } = await supabase.storage
        .from('product-images')
        .upload(storagePath, compressed, {
            contentType: compressed.type || 'image/png',
            cacheControl: '31536000', // 1 year
            upsert: false,
        })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    // Step 4: Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
}
