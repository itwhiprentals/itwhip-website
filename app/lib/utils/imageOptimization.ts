// app/lib/utils/imageOptimization.ts
// Image optimization utilities for Cloudinary and Unsplash

/**
 * Optimizes Cloudinary URLs with automatic format and quality
 * Transforms: https://res.cloudinary.com/xxx/image/upload/v123/photo.jpg
 * To: https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto,w_800,c_fill/v123/photo.jpg
 *
 * @param url - Original Cloudinary URL
 * @param width - Target width (default 800)
 * @returns Optimized URL with transformations
 */
export function optimizeCloudinaryUrl(url: string, width = 800): string {
  if (!url) return url

  // Skip if not a Cloudinary URL
  if (!url.includes('cloudinary.com')) return url

  // Skip if already has transformations
  if (url.includes('f_auto') || url.includes('q_auto')) return url

  // Insert transformations after /upload/
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_fill/`
  )
}

/**
 * Optimizes Unsplash URLs with WebP format and quality
 * Adds &fm=webp&q=80 to existing URL parameters
 *
 * @param url - Unsplash URL with existing params
 * @returns URL with WebP optimization added
 */
export function optimizeUnsplashUrl(url: string): string {
  if (!url) return url

  // Skip if not an Unsplash URL
  if (!url.includes('unsplash.com')) return url

  // Skip if already has format specified
  if (url.includes('fm=webp')) return url

  // Add WebP format and quality
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}fm=webp&q=80`
}

/**
 * Optimizes any image URL (auto-detects Cloudinary vs Unsplash)
 * Falls back to original URL for other sources
 *
 * @param url - Any image URL
 * @param width - Target width for Cloudinary (default 800)
 * @returns Optimized URL
 */
export function optimizeImageUrl(url: string, width = 800): string {
  if (!url) return url

  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, width)
  }

  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url)
  }

  return url
}
