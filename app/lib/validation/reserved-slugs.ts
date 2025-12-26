// app/lib/validation/reserved-slugs.ts
// Reserved slugs protection to prevent partners from hijacking admin routes

/**
 * Reserved slugs that partners cannot use for their company URL
 * This prevents route hijacking attacks like /rideshare/admin
 */
export const RESERVED_SLUGS = [
  // Admin & Internal Routes
  'admin',
  'fleet',
  'api',
  'system',
  'internal',
  'dashboard',
  'panel',
  'control',
  'manage',
  'management',

  // Auth Routes
  'login',
  'logout',
  'signup',
  'signin',
  'signout',
  'auth',
  'authenticate',
  'register',
  'reset',
  'password',
  'forgot',
  'verify',
  'confirm',
  'oauth',

  // Account Routes
  'account',
  'profile',
  'settings',
  'preferences',
  'my',
  'me',
  'user',
  'users',

  // Financial Routes
  'billing',
  'payment',
  'payments',
  'checkout',
  'invoice',
  'invoices',
  'payout',
  'payouts',
  'stripe',
  'revenue',

  // Support Routes
  'support',
  'help',
  'faq',
  'contact',
  'feedback',
  'report',
  'ticket',
  'tickets',

  // Legal & Info Routes
  'about',
  'terms',
  'privacy',
  'legal',
  'tos',
  'dmca',
  'copyright',

  // Brand Protection
  'itwhip',
  'itwhipapp',
  'it-whip',
  'itwhip-fleet',
  'itwhip-rentals',
  'platform',
  'official',

  // Competitor Names (prevent impersonation)
  'uber',
  'lyft',
  'turo',
  'getaround',
  'hertz',
  'avis',
  'enterprise',
  'budget',
  'national',
  'alamo',
  'sixt',
  'zipcar',
  'hyre',
  'hyrecar',
  'fair',

  // Generic Reserved
  'host',
  'hosts',
  'guest',
  'guests',
  'partner',
  'partners',
  'driver',
  'drivers',
  'car',
  'cars',
  'vehicle',
  'vehicles',
  'rideshare',
  'rental',
  'rentals',
  'booking',
  'bookings',
  'reservation',
  'reservations',

  // Marketing Pages
  'pricing',
  'features',
  'blog',
  'news',
  'press',
  'careers',
  'jobs',
  'investors',

  // Technical
  'cdn',
  'static',
  'assets',
  'images',
  'files',
  'uploads',
  'media',
  'download',
  'downloads',
  'null',
  'undefined',
  'test',
  'testing',
  'dev',
  'development',
  'staging',
  'production',
  'prod',

  // Misc
  'new',
  'create',
  'edit',
  'delete',
  'update',
  'remove',
  'add',
  'view',
  'list',
  'all',
  'search',
  'browse',
  'explore',
] as const

export type ReservedSlug = (typeof RESERVED_SLUGS)[number]

/**
 * Slug validation result
 */
interface SlugValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

/**
 * Validates and sanitizes a partner slug
 *
 * Rules:
 * - 3-50 characters
 * - Lowercase letters, numbers, hyphens only
 * - Cannot start or end with hyphen
 * - No consecutive hyphens
 * - Not in reserved list
 *
 * @param slug - The slug to validate
 * @returns Validation result with sanitized slug if valid
 */
export function validatePartnerSlug(slug: string): SlugValidationResult {
  // Trim and lowercase
  const sanitized = slug.trim().toLowerCase()

  // Check length
  if (sanitized.length < 3) {
    return {
      valid: false,
      error: 'Slug must be at least 3 characters long',
    }
  }

  if (sanitized.length > 50) {
    return {
      valid: false,
      error: 'Slug must be 50 characters or less',
    }
  }

  // Check format: only lowercase letters, numbers, hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugPattern.test(sanitized)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
    }
  }

  // Check for consecutive hyphens
  if (sanitized.includes('--')) {
    return {
      valid: false,
      error: 'Slug cannot contain consecutive hyphens',
    }
  }

  // Check reserved slugs
  if (isReservedSlug(sanitized)) {
    return {
      valid: false,
      error: `"${sanitized}" is a reserved name and cannot be used`,
    }
  }

  return {
    valid: true,
    sanitized,
  }
}

/**
 * Checks if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase().trim()
  return RESERVED_SLUGS.includes(normalized as ReservedSlug)
}

/**
 * Generates a URL-safe slug from a company name
 *
 * @param companyName - The company name to slugify
 * @returns A URL-safe slug
 */
export function generateSlugFromName(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Remove consecutive hyphens
    .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens
    .substring(0, 50)               // Limit length
}

/**
 * Suggests a unique slug by appending a number if the base slug is taken
 *
 * @param baseSlug - The desired slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  const normalizedBase = baseSlug.toLowerCase().trim()

  if (!existingSlugs.includes(normalizedBase) && !isReservedSlug(normalizedBase)) {
    return normalizedBase
  }

  // Append numbers until we find a unique one
  let counter = 2
  let candidate = `${normalizedBase}-${counter}`

  while (existingSlugs.includes(candidate) || isReservedSlug(candidate)) {
    counter++
    candidate = `${normalizedBase}-${counter}`

    // Safety limit
    if (counter > 999) {
      throw new Error('Could not generate unique slug')
    }
  }

  return candidate
}
