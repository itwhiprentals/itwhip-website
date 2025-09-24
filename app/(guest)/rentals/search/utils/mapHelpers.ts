// app/(guest)/rentals/search/utils/mapHelpers.ts
export const PHOENIX_COORDINATES = {
  lat: 33.4484,
  lng: -112.0740
}

export const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Scottsdale, AZ': { lat: 33.4942, lng: -111.9261 },
  'Tempe, AZ': { lat: 33.4255, lng: -111.9400 },
  'Mesa, AZ': { lat: 33.4152, lng: -111.8315 },
  'Chandler, AZ': { lat: 33.3062, lng: -111.8413 },
  'Gilbert, AZ': { lat: 33.3528, lng: -111.7890 },
}

export function getLocationCoordinates(location: string): { lat: number; lng: number } {
  return LOCATION_COORDINATES[location] || PHOENIX_COORDINATES
}

export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  // Validate inputs to prevent NaN
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lon1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lon2)) {
    return 0
  }

  const R = 3959 // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  // Ensure we return a valid number
  return isNaN(distance) ? 0 : Math.round(distance * 10) / 10
}

// Helper function to validate coordinates
function isValidCoordinate(coord: number): boolean {
  return typeof coord === 'number' && 
         !isNaN(coord) && 
         isFinite(coord) && 
         coord !== null && 
         coord !== undefined
}

// Updated formatDistance to handle edge cases better
export function formatDistance(miles: number | null | undefined): string {
  // Handle null, undefined, or NaN values
  if (miles === null || miles === undefined || isNaN(miles)) {
    return ''
  }
  
  // Ensure miles is a valid number
  const validMiles = Number(miles)
  if (!isFinite(validMiles) || validMiles < 0) {
    return ''
  }
  
  // Format based on distance
  if (validMiles < 0.1) return 'Nearby'
  if (validMiles < 0.5) return 'Less than 1 mile'
  if (validMiles < 1) return '1 mile'
  if (validMiles < 2) return `${validMiles.toFixed(1)} mi`
  return `${Math.round(validMiles)} mi`
}

// Utility function to safely calculate distance between two locations
export function safeCalculateDistance(
  from: { lat: number; lng: number } | null | undefined,
  to: { lat: number; lng: number } | null | undefined
): number | null {
  if (!from || !to) return null
  
  try {
    return calculateDistance(from.lat, from.lng, to.lat, to.lng)
  } catch (error) {
    console.warn('Error calculating distance:', error)
    return null
  }
}