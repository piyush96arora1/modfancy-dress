/**
 * Server-side image validation utility
 * Validates image URLs before rendering to prevent broken images
 */

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
    })
    
    // Check if response is OK and content-type is an image
    const contentType = response.headers.get('content-type')
    const isImage = contentType?.startsWith('image/') ?? false
    
    return response.ok && isImage
  } catch (error) {
    // If fetch fails, assume image is invalid
    return false
  }
}

/**
 * Filter out invalid images from an array
 * Useful for server-side rendering to prevent broken images
 */
export async function filterValidImages<T extends { image_url: string }>(
  images: T[]
): Promise<T[]> {
  const validationResults = await Promise.all(
    images.map(async (img) => ({
      image: img,
      isValid: await validateImageUrl(img.image_url),
    }))
  )

  return validationResults
    .filter((result) => result.isValid)
    .map((result) => result.image)
}

