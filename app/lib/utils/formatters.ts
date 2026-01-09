// app/lib/utils/formatters.ts
// Global formatting utilities for consistent display across the app

/**
 * Brands that should remain in ALL CAPS
 */
const ALL_CAPS_BRANDS = ['BMW', 'GMC', 'RAM']

/**
 * Capitalize car make properly:
 * - BMW, GMC, RAM stay ALL CAPS
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
