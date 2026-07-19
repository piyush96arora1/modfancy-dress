export function getImageUrl(url: string): string {
    if (!url) return url;
    return url
        .replace('/products/', '/products-webp/')
        .replace('/banners/', '/banners-webp/')
        .replace('/categories/', '/categories-webp/')
        .replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

/** Resolve a display URL for a product's primary image (falls back to the first image). */
export function primaryImageUrl(
    images?: { image_url: string; is_primary?: boolean | null }[] | null
): string | null {
    if (!images || images.length === 0) return null;
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return primary ? getImageUrl(primary.image_url) : null;
}
