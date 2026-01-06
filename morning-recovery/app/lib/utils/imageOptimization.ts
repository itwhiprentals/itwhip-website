// app/lib/utils/imageOptimization.ts
// Image optimization utilities for Cloudinary and Unsplash

interface CloudinaryOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number
  dpr?: 'auto' | number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop'
  gravity?: 'auto' | 'center' | 'face' | 'faces'
}

/**
 * Optimizes Cloudinary URLs with automatic format, quality, and sizing
 * Transforms: https://res.cloudinary.com/xxx/image/upload/v123/photo.jpg
 * To: https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto:good,w_400,h_300,c_fill,dpr_auto/v123/photo.jpg
 *
 * @param url - Original Cloudinary URL
 * @param widthOrOptions - Target width (default 800) or full options object
 * @returns Optimized URL with transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  widthOrOptions: number | CloudinaryOptions = 800
): string {
  if (!url) return url

  // Skip if not a Cloudinary URL
  if (!url.includes('cloudinary.com')) return url

  // Skip if already has transformations (avoid double-optimizing)
  if (url.includes('f_auto') || url.includes('q_auto')) return url

  // Parse options
  const options: CloudinaryOptions = typeof widthOrOptions === 'number'
    ? { width: widthOrOptions }
    : widthOrOptions

  const {
    width = 800,
    height,
    quality = 'auto:good',
    dpr = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options

  // Build transformation string
  const transforms = [
    'f_auto',                           // Auto format (WebP/AVIF for modern browsers)
    `q_${quality}`,                     // Quality optimization
    `w_${width}`,                       // Width
    height ? `h_${height}` : null,      // Height (optional)
    `c_${crop}`,                        // Crop mode
    `g_${gravity}`,                     // Gravity/focus point
    `dpr_${dpr}`                        // Device pixel ratio for retina
  ].filter(Boolean).join(',')

  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transforms}/`)
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
 * @param widthOrOptions - Target width for Cloudinary (default 800) or full options
 * @returns Optimized URL
 */
export function optimizeImageUrl(
  url: string,
  widthOrOptions: number | CloudinaryOptions = 800
): string {
  if (!url) return url

  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, widthOrOptions)
  }

  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url)
  }

  return url
}

// Export types for consumers
export type { CloudinaryOptions }
