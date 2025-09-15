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
    const R = 3959 // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  export function formatDistance(miles: number): string {
    if (miles < 0.1) return 'Nearby'
    if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`
    return `${miles.toFixed(1)} mi`
  }