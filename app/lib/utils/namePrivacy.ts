// app/lib/utils/namePrivacy.ts
// Centralized name privacy utility for protecting last names across the application

// ============================================
// TYPES
// ============================================

export type ViewerRole = 'visitor' | 'guest' | 'host' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

export interface NamePrivacyContext {
  viewerRole: ViewerRole
  hasBookingWith?: boolean
  bookingStatus?: BookingStatus
}

// ============================================
// COMPANY DETECTION
// ============================================

/**
 * Keywords that indicate a name is a company, not an individual
 * Includes business suffixes, automotive terms, and service descriptors
 */
const COMPANY_KEYWORDS = [
  // Business entity suffixes
  'LLC', 'Inc', 'Corp', 'Corporation', 'Co.', 'Co', 'Ltd', 'LP', 'LLP', 'PLLC',
  // Automotive & rental industry
  'Motors', 'Motor', 'Rentals', 'Rental', 'Auto', 'Autos', 'Car', 'Cars', 'Vehicle', 'Vehicles',
  'Fleet', 'Fleets', 'Luxury', 'Exotic', 'Exotics', 'Premium', 'Classic', 'Classics',
  // Business descriptors
  'Group', 'Services', 'Service', 'Enterprise', 'Enterprises', 'Company',
  'Transportation', 'Transport', 'Leasing', 'Lease', 'Holdings', 'Holding',
  'International', 'Global', 'National', 'Partners', 'Partnership', 'Associates',
  // Common fleet/rental business terms
  'Mobility', 'Drive', 'Rides', 'Wheels', 'Speed', 'Performance'
]

/**
 * Detects if a name is a company based on keywords
 * Handles cases like "Smith Jones Auto Group LLC" where personal names appear with company terms
 *
 * @param name - The name to check
 * @returns true if the name appears to be a company
 */
export function isCompanyName(name: string): boolean {
  if (!name) return false

  const upperName = name.toUpperCase()
  const words = name.trim().split(/\s+/)

  // Check for company keywords (case-insensitive)
  for (const keyword of COMPANY_KEYWORDS) {
    // Match whole words or words with punctuation (like "Inc." or "LLC")
    const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i')
    if (regex.test(name)) {
      return true
    }
  }

  // If name has more than 4 words, likely a company
  // e.g., "Phoenix Valley Luxury Auto Rentals"
  if (words.length > 4) {
    return true
  }

  // If any single word is very long (> 15 chars), might be a company name
  // e.g., "PRESTIGEMOTORSPHX" or "LUXURYRENTALSAZ"
  if (words.some(word => word.length > 15)) {
    return true
  }

  return false
}

// ============================================
// NAME FORMATTING FUNCTIONS
// ============================================

/**
 * Returns just the first name from a full name
 * NO last initial - just the first word
 *
 * @param fullName - The full name to extract first name from
 * @returns First name only, or 'Host' if no name provided
 *
 * @example
 * getFirstNameOnly("Jenny Wilson") // "Jenny"
 * getFirstNameOnly("John") // "John"
 * getFirstNameOnly("") // "Host"
 */
export function getFirstNameOnly(fullName: string | null | undefined): string {
  if (!fullName || !fullName.trim()) return 'Host'
  return fullName.trim().split(/\s+/)[0]
}

/**
 * Formats a name with privacy rules for reviewers/guests in public contexts
 * Always returns first name only for individuals, full name for companies
 *
 * @param fullName - The full name to format
 * @param isCompany - Optional flag if we know this is a company
 * @returns Formatted name appropriate for public display
 */
export function formatReviewerName(
  fullName: string | null | undefined,
  isCompany?: boolean
): string {
  if (!fullName || !fullName.trim()) return 'Guest'

  // Companies always show full name
  if (isCompany || isCompanyName(fullName)) {
    return fullName
  }

  // Individuals show first name only
  return getFirstNameOnly(fullName)
}

/**
 * Main privacy-aware name formatting function
 * Applies context-based visibility rules for names
 *
 * Rules:
 * - Companies: ALWAYS show full name
 * - Admin viewer: ALWAYS see full name
 * - Confirmed booking relationship: Show full name
 * - Default (visitors, unconfirmed): First name only
 *
 * @param fullName - The full name to format
 * @param isCompany - Optional flag if we know this is a company
 * @param context - Optional privacy context with viewer role and booking status
 * @returns Appropriately formatted name based on privacy rules
 *
 * @example
 * // Visitor viewing a host
 * formatPrivateName("Jenny Wilson") // "Jenny"
 *
 * // Guest with confirmed booking viewing host
 * formatPrivateName("Jenny Wilson", false, {
 *   viewerRole: 'guest',
 *   hasBookingWith: true,
 *   bookingStatus: 'confirmed'
 * }) // "Jenny Wilson"
 *
 * // Company name always shown in full
 * formatPrivateName("Phoenix Motors LLC") // "Phoenix Motors LLC"
 */
export function formatPrivateName(
  fullName: string | null | undefined,
  isCompany?: boolean,
  context?: NamePrivacyContext
): string {
  if (!fullName || !fullName.trim()) return 'Host'

  // Companies ALWAYS show full name regardless of context
  if (isCompany || isCompanyName(fullName)) {
    return fullName
  }

  // Admin viewers always see full names
  if (context?.viewerRole === 'admin') {
    return fullName
  }

  // Users with confirmed/active/completed booking relationship see full names
  if (context?.hasBookingWith) {
    const confirmedStatuses: BookingStatus[] = ['confirmed', 'active', 'completed']
    if (context.bookingStatus && confirmedStatuses.includes(context.bookingStatus)) {
      return fullName
    }
  }

  // Default: First name ONLY (no initial) for privacy
  return getFirstNameOnly(fullName)
}

/**
 * Format host name for display based on isDraft state
 * Used specifically in RentalAgreementModal
 *
 * @param hostName - The host's full name
 * @param isCompany - Whether the host is a company
 * @param isDraft - Whether this is a draft/preview state
 * @returns Formatted name based on draft state
 */
export function formatHostNameForAgreement(
  hostName: string | null | undefined,
  isCompany?: boolean,
  isDraft?: boolean
): string {
  if (!hostName || !hostName.trim()) return 'Host'

  // Companies always show full name
  if (isCompany || isCompanyName(hostName)) {
    return hostName
  }

  // Draft mode: first name only
  if (isDraft) {
    return getFirstNameOnly(hostName)
  }

  // Confirmed mode: full name
  return hostName
}

/**
 * Format guest name for display in rental agreement
 * In draft mode, shows first name with explanation if logged in
 * In confirmed mode, shows full name
 *
 * @param guestName - The guest's full name
 * @param isDraft - Whether this is a draft/preview state
 * @returns Formatted name or placeholder text
 */
export function formatGuestNameForAgreement(
  guestName: string | null | undefined,
  isDraft?: boolean
): string {
  // Draft mode: show first name with explanation if logged in
  if (isDraft) {
    if (guestName && guestName.trim()) {
      const firstName = getFirstNameOnly(guestName)
      return `${firstName} (Your full name will appear after confirmation)`
    }
    return 'Your name will appear after confirmation'
  }

  // Confirmed mode: show full name
  if (!guestName || !guestName.trim()) return 'Guest'
  return guestName
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * @deprecated Use formatPrivateName() instead
 * Format display name with last initial - DEPRECATED
 * This function exists for backwards compatibility during migration
 * The new standard is first name only, no initial
 */
export function formatWithLastInitial(fullName: string | null | undefined, isCompany?: boolean): string {
  if (!fullName || !fullName.trim()) return 'Host'

  // Companies show full name
  if (isCompany || isCompanyName(fullName)) {
    return fullName
  }

  // NEW BEHAVIOR: Just return first name, no initial
  // Previously this would return "Jenny W." but that's deprecated
  return getFirstNameOnly(fullName)
}
