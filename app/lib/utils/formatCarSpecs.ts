// app/lib/utils/formatCarSpecs.ts
// Shared utility functions for formatting car specs across the site

/**
 * Format rating without trailing zeros
 * Example: 5.00 → "5", 4.50 → "4.5", 4.75 → "4.8"
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating || rating === 0) return ''
  // Round to one decimal, then remove trailing zeros
  const rounded = Math.round(rating * 10) / 10
  return String(rounded)
}

/**
 * Format transmission type for display
 */
export function formatTransmission(transmission: string | null | undefined): string {
  if (!transmission) return 'Automatic'
  switch (transmission.toUpperCase()) {
    case 'AUTOMATIC': return 'Automatic'
    case 'MANUAL': return 'Manual'
    case 'SEMI_AUTOMATIC': return 'Semi-Auto'
    case 'CVT': return 'CVT'
    default: return transmission.charAt(0).toUpperCase() + transmission.slice(1).toLowerCase()
  }
}

/**
 * Format fuel type for display
 */
export function formatFuelType(fuelType: string | null | undefined): string {
  if (!fuelType) return 'Regular'
  switch (fuelType.toUpperCase()) {
    case 'REGULAR': return 'Regular'
    case 'PREMIUM': return 'Premium'
    case 'ELECTRIC': return 'Electric'
    case 'HYBRID': return 'Hybrid'
    case 'PLUGIN_HYBRID': return 'Plug-in Hybrid'
    case 'DIESEL': return 'Diesel'
    default: return fuelType
  }
}

/**
 * Check if vehicle should show "New Listing" instead of rating
 * Returns true if vehicle has no completed trips
 */
export function isNewListing(totalTrips: number | null | undefined): boolean {
  return !totalTrips || totalTrips === 0
}

/**
 * Get default seats if not specified
 */
export function getSeats(seats: number | null | undefined): number {
  return seats ?? 5
}
