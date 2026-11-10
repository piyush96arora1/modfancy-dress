// Public Supabase Storage objects are served through a Cloudflare Worker
// (workers/img-cache) that caches them at the edge, so repeat views of a photo don't count
// against Supabase egress. Only the host/prefix changes; the bucket path is kept, so every
// other rewrite here (legacy folders, w400/w800/w1600 variants) works unchanged.
const SUPABASE_PUBLIC_RE = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//i;
const IMAGE_CDN = 'https://img.modfancydress.com/';

/** Swap a public Supabase Storage URL for its edge-cached img.modfancydress.com URL. */
export function cdnUrl(url: string): string {
    return url ? url.replace(SUPABASE_PUBLIC_RE, IMAGE_CDN) : url;
}

export function getImageUrl(url: string): string {
    if (!url) return url;

    // Already in a converted folder: the stored filename is authoritative, so return it
    // untouched. Uploads are not always WebP — Safari/iOS cannot encode it via
    // canvas.toBlob and falls back to another format, and the uploader names the file after
    // what was actually produced. Rewriting the extension here would request a file that
    // was never written and 404.
    if (/\/(products|banners|categories)-webp\//.test(url)) return cdnUrl(url);

    // Legacy paths only: rows still pointing at the original upload folder are mapped onto
    // the pre-generated WebP variants.
    return cdnUrl(
        url
            .replace('/products/', '/products-webp/')
            .replace('/banners/', '/banners-webp/')
            .replace('/categories/', '/categories-webp/')
            .replace(/\.(png|jpg|jpeg)$/i, '.webp')
    );
}

/** Resolve a display URL for a product's primary image (falls back to the first image). */
export function primaryImageUrl(
    images?: { image_url: string; is_primary?: boolean | null }[] | null
): string | null {
    if (!images || images.length === 0) return null;
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return primary ? getImageUrl(primary.image_url) : null;
}
