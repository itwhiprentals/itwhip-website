// app/lib/utils/urls.ts

/**
 * Generate SEO-friendly slug from car data
 * Example: { year: 2017, make: "Lamborghini", model: "LP 580-2" } => "2017-lamborghini-lp-580-2-phoenix"
 */
export function generateCarSlug(car: {
    make: string
    model: string
    year: number
    city: string
  }): string {
    return `${car.year}-${car.make}-${car.model}-${car.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
  }
  
  /**
   * Extract car ID from URL slug
   * Handles both old format (just ID) and new SEO format (slug-id)
   * Examples:
   * - "cmfj1b3c80001do5t47rignri" => "cmfj1b3c80001do5t47rignri"
   * - "2017-lamborghini-lp-580-phoenix-cmfj1b3c80001do5t47rignri" => "cmfj1b3c80001do5t47rignri"
   */
  export function extractCarId(slug: string): string {
    // Check if it's already just an ID (old format)
    // Prisma CUID format starts with 'c' followed by lowercase letters and numbers
    if (slug.match(/^c[a-z0-9]{20,30}$/)) {
      return slug
    }

    // Check if it's a bare UUID (e.g. "89fd408e-87e6-4ec9-b379-2142fca6cca7")
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      return slug
    }

    // Extract CUID from end of SEO URL (after last hyphen)
    // Look for pattern: -c[alphanumeric]{20+} at the end
    const cuidMatch = slug.match(/-(c[a-z0-9]{20,30})$/)
    if (cuidMatch && cuidMatch[1]) {
      return cuidMatch[1]
    }

    // Extract UUID from end of SEO URL
    // Look for pattern: -[8hex]-[4hex]-[4hex]-[4hex]-[12hex] at the end
    const uuidMatch = slug.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/)
    if (uuidMatch && uuidMatch[1]) {
      return uuidMatch[1]
    }

    // Fallback: return the original slug if no ID pattern found
    // This prevents crashes but might cause 404s - better than breaking
    console.warn(`Could not extract car ID from slug: ${slug}`)
    return slug
  }
  
  /**
   * Generate full SEO-friendly URL for a car
   * Example: "/rentals/2017-lamborghini-lp-580-phoenix-cmfj1b3c80001do5t47rignri"
   */
  export function generateCarUrl(car: {
    id: string
    make: string
    model: string
    year: number
    city: string
  }): string {
    const slug = generateCarSlug(car)
    return `/rentals/${slug}-${car.id}`
  }
  
  /**
   * Generate absolute URL for sharing/SEO
   */
  export function generateCarAbsoluteUrl(car: {
    id: string
    make: string
    model: string
    year: number
    city: string
  }, baseUrl: string = 'https://itwhip.com'): string {
    const slug = generateCarSlug(car)
    return `${baseUrl}/rentals/${slug}-${car.id}`
  }
  
  /**
   * Check if a URL is using the old format
   */
  export function isOldUrlFormat(slug: string): boolean {
    return /^c[a-z0-9]{20,30}$/.test(slug) ||
           /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(slug)
  }
  
  /**
   * Generate redirect URL from old to new format
   * Used for 301 redirects to preserve SEO
   */
  export function generateRedirectUrl(
    oldId: string,
    car: {
      make: string
      model: string
      year: number
      city: string
    }
  ): string {
    if (!isOldUrlFormat(oldId)) {
      // Already in new format, no redirect needed
      return ''
    }
    
    const slug = generateCarSlug(car)
    return `/rentals/${slug}-${oldId}`
  }