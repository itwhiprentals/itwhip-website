// app/lib/utils/imageOptimization.ts
// Image optimization — CloudFront (S3) + Cloudinary (legacy) + Unsplash

const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || 'photos.itwhip.com'

interface ImageOptions {
  width?: number
  height?: number
  quality?: string | number
}

/**
 * Optimizes any image URL
 * - CloudFront/S3: returns as-is (CDN handles caching/compression)
 * - Cloudinary (legacy): applies f_auto,q_auto transformations
 * - Unsplash: adds fm=webp&q=80
 */
export function optimizeImageUrl(
  url: string,
  widthOrOptions: number | ImageOptions = 800
): string {
  if (!url) return url

  // CloudFront URLs — already optimized via CDN, pass through
  if (url.includes(CLOUDFRONT_DOMAIN) || url.includes('cloudfront.net')) {
    return url
  }

  // Legacy Cloudinary URLs — apply transformations
  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, widthOrOptions)
  }

  // Unsplash
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url)
  }

  return url
}

export function optimizeCloudinaryUrl(
  url: string,
  widthOrOptions: number | ImageOptions = 800
): string {
  if (!url || !url.includes('cloudinary.com')) return url
  if (url.includes('f_auto') || url.includes('q_auto')) return url

  const width = typeof widthOrOptions === 'number' ? widthOrOptions : (widthOrOptions.width || 800)
  const height = typeof widthOrOptions === 'number' ? undefined : widthOrOptions.height

  const transforms = [
    'f_auto', 'q_auto:good', `w_${width}`,
    height ? `h_${height}` : null,
    'c_fill', 'g_auto', 'dpr_auto'
  ].filter(Boolean).join(',')

  return url.replace('/upload/', `/upload/${transforms}/`)
}

export function optimizeUnsplashUrl(url: string): string {
  if (!url || !url.includes('unsplash.com')) return url
  if (url.includes('fm=webp')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}fm=webp&q=80`
}

export type { ImageOptions as CloudinaryOptions }
