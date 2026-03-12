export function getImageUrl(url: string): string {
    if (!url) return url;
    return url
        .replace('/products/', '/products-webp/')
        .replace('/banners/', '/banners-webp/')
        .replace('/categories/', '/categories-webp/')
        .replace(/\.(png|jpg|jpeg)$/i, '.webp');
}
