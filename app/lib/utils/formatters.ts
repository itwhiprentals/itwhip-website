// app/lib/utils/formatters.ts
// Global formatting utilities for consistent display across the app

/**
 * Brands that should remain in ALL CAPS
 */
const ALL_CAPS_BRANDS = ['BMW', 'GMC', 'RAM', 'MINI']

/**
 * Brands with special capitalization (case-insensitive lookup)
 */
const SPECIAL_CAPS_BRANDS: Record<string, string> = {
  'MCLAREN': 'McLaren',
  'MASERATI': 'Maserati',
}

/**
 * Capitalize car make properly:
 * - BMW, GMC, RAM, MINI stay ALL CAPS
 * - McLaren has special internal capitalization
 * - Other makes capitalize each word AND hyphenated parts
 *   (LAND ROVER → Land Rover, MERCEDES-BENZ → Mercedes-Benz)
 *
 * @param make - The car make string (e.g., "TOYOTA", "BMW", "MERCEDES-BENZ")
 * @returns Properly capitalized make
 */
export function capitalizeCarMake(make: string | null | undefined): string {
  if (!make) return ''

  const trimmed = make.trim().toUpperCase()

  // Check if it's a brand that stays ALL CAPS
  if (ALL_CAPS_BRANDS.includes(trimmed)) {
    return trimmed
  }

  // Check if it's a brand with special capitalization
  if (SPECIAL_CAPS_BRANDS[trimmed]) {
    return SPECIAL_CAPS_BRANDS[trimmed]
  }

  // Capitalize each word AND each hyphenated part
  // "MERCEDES-BENZ" → "Mercedes-Benz"
  // "LAND ROVER" → "Land Rover"
  // "ALFA-ROMEO" → "Alfa-Romeo"
  return trimmed
    .split(' ')
    .map(word =>
      word.split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ')
}

/**
 * Format a price with proper currency display
 *
 * @param amount - The numeric amount
 * @param showCents - Whether to show cents (default: false for whole numbers)
 * @returns Formatted price string (e.g., "$55" or "$55.00")
 */
export function formatPrice(amount: number, showCents: boolean = false): string {
  if (showCents) {
    return `$${amount.toFixed(2)}`
  }
  return `$${Math.round(amount)}`
}

/**
 * Format trip duration in a human-readable way
 *
 * @param days - Number of days
 * @returns Formatted string (e.g., "3 days", "1 week", "2 weeks")
 */
export function formatTripDuration(days: number): string {
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  if (days === 7) return '1 week'
  if (days === 14) return '2 weeks'
  if (days < 30) return `${days} days`
  if (days === 30) return '1 month'
  return `${days} days`
}

/**
 * Mercedes class prefixes that need a space before the number
 * e.g., S550 → S 550, GLC300 → GLC 300
 */
const MERCEDES_CLASS_PREFIXES = [
  'AMG GT', 'GLS', 'GLE', 'GLC', 'GLB', 'GLA', 'CLS', 'CLA',
  'S', 'E', 'C', 'A', 'G', 'SL', 'SLC', 'EQS', 'EQE', 'EQB', 'EQA'
]

/**
 * Normalize model names for consistent display
 * Handles variations like "S550" → "S 550" for Mercedes-Benz
 *
 * @param model - The car model string (e.g., "S550", "330i", "Camry")
 * @param make - Optional make to apply brand-specific rules
 * @returns Normalized model name
 */
export function normalizeModelName(model: string | null | undefined, make?: string | null): string {
  if (!model) return ''

  let normalized = model.trim()

  // Mercedes-Benz specific: Add space before numbers
  // S550 → S 550, GLC300 → GLC 300, E350 → E 350
  if (make?.toUpperCase().includes('MERCEDES')) {
    // Sort by length descending to match longer prefixes first (GLC before G)
    const sortedPrefixes = [...MERCEDES_CLASS_PREFIXES].sort((a, b) => b.length - a.length)

    for (const prefix of sortedPrefixes) {
      // Pattern: prefix immediately followed by numbers (no space)
      // e.g., "S550" matches, "S 550" doesn't
      const pattern = new RegExp(`^${prefix}(\\d+)`, 'i')
      const match = normalized.match(pattern)

      if (match) {
        // Insert space between class and number
        normalized = `${prefix} ${match[1]}${normalized.slice(match[0].length)}`
        break
      }
    }
  }

  return normalized
}

/**
 * Format car name (make + model) for display
 * Applies proper capitalization and model normalization
 *
 * @param make - The car make
 * @param model - The car model
 * @param year - Optional year to prepend
 * @returns Formatted car name (e.g., "2024 Mercedes-Benz S 550")
 */
export function formatCarName(
  make: string | null | undefined,
  model: string | null | undefined,
  year?: number | string | null
): string {
  const formattedMake = capitalizeCarMake(make)
  const formattedModel = normalizeModelName(model, make)

  const name = [formattedMake, formattedModel].filter(Boolean).join(' ')

  if (year) {
    return `${year} ${name}`
  }

  return name
}
