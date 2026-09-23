import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export type UploadFolder = 'products-webp' | 'banners-webp' | 'categories-webp'

const MIME_EXT: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
}

let webpEncodingSupport: Promise<boolean> | undefined

/**
 * Can this browser encode WebP via canvas? Safari on iOS cannot, and `canvas.toBlob()`
 * signals that by silently handing back a different format instead of throwing.
 *
 * This matters beyond the file extension: when the fallback is PNG, output is lossless, so
 * `initialQuality` and `maxSizeMB` stop having any effect and a 1600px photo lands at ~3MB.
 * Asking for JPEG instead keeps the encode lossy, so the size target is reachable.
 */
function supportsWebpEncoding(): Promise<boolean> {
    webpEncodingSupport ??= new Promise<boolean>((resolve) => {
        try {
            const canvas = document.createElement('canvas')
            canvas.width = 1
            canvas.height = 1
            canvas.toBlob((blob) => resolve(blob?.type === 'image/webp'), 'image/webp')
        } catch {
            resolve(false)
        }
    })
    return webpEncodingSupport
}

function isAlreadyExists(error: { message: string }): boolean {
    const status = (error as { statusCode?: string | number }).statusCode
    return String(status) === '409' || /already exists|duplicate/i.test(error.message)
}

/**
 * @param filename Storage name without extension (the real extension is appended from what
 *   the browser produced). Pass `imageStem(product.slug, index)` for product photos.
 */
export async function uploadCompressedImage(
    file: File,
    folder: UploadFolder,
    filename?: string
): Promise<string> {
    const supabase = createClient()

    // Step 1: Compress in browser.
    //
    // `alwaysKeepResolution` is what keeps images sharp. Without it the library shrinks the
    // canvas 5% per iteration chasing `maxSizeMB`, and a photo that can't reach the target
    // just keeps shrinking — 10 iterations took a 1200px cap down to ~718px, which is where
    // the blurry uploads came from. With it on, the image is resized once to
    // `maxWidthOrHeight` and everything after that is quality-only.
    //
    // `maxIteration` is capped because at fixed resolution each pass allocates a fresh
    // full-size canvas. Ten of those is heavy enough to fail on iOS Safari's tighter canvas
    // memory ceiling, and the extra passes buy very little once quality starts at 0.92.
    const outputType = (await supportsWebpEncoding()) ? 'image/webp' : 'image/jpeg'

    const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,             // ~400KB; 100KB was unreachable and forced downscaling
        maxWidthOrHeight: 1600,     // preserve aspect ratio, cap at 1600px
        useWebWorker: true,         // non-blocking
        fileType: outputType,       // webp where supported, jpeg on Safari/iOS
        initialQuality: 0.92,
        alwaysKeepResolution: true, // never trade pixels for file size
        maxIteration: 3,
    })

    // Step 2: Generate filename.
    //
    // Name the file after what the browser actually produced, not what we asked for. Storing
    // PNG bytes as `.webp` (with a webp content-type) misrepresents the file to every client
    // that fetches it, which is how 91 earlier uploads ended up mislabelled.
    //
    // NOTE: `getImageUrl()` deliberately leaves URLs inside a `-webp` folder untouched. If
    // that ever changes to rewrite extensions again, every non-webp upload here will 404.
    const ext = MIME_EXT[compressed.type] ?? 'jpg'

    // With a descriptive `filename` (the product slug, see lib/utils/image-filename.ts) the
    // first choice is the bare name, which is what Google Images reads. A clash with an
    // existing file retries once with a timestamp suffix rather than overwriting it.
    const stem = filename || `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const put = (path: string) =>
        supabase.storage.from('product-images').upload(path, compressed, {
            contentType: compressed.type || 'image/jpeg',
            cacheControl: '31536000', // 1 year
            upsert: false,
        })

    // Step 3: Upload to Supabase
    let storagePath = `${folder}/${stem}.${ext}`
    let { error } = await put(storagePath)
    if (error && filename && isAlreadyExists(error)) {
        storagePath = `${folder}/${stem}-${Date.now()}.${ext}`
        ;({ error } = await put(storagePath))
    }

    if (error) throw new Error(`Upload failed: ${error.message}`)

    // Step 4: Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
}
