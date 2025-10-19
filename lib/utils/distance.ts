// lib/utils/distance.ts
// Haversine formula implementation for calculating distances between coordinates
// Used for radius-based car search and distance display

export interface Coordinates {
    latitude: number
    longitude: number
  }
  
  export interface CoordinatesAlt {
    lat: number
    lng: number
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in miles
   * 
   * @param point1 - First coordinate point
   * @param point2 - Second coordinate point
   * @returns Distance in miles
   */
  export function calculateDistance(
    point1: Coordinates | CoordinatesAlt,
    point2: Coordinates | CoordinatesAlt
  ): number {
    // Normalize coordinate property names
    const lat1 = 'latitude' in point1 ? point1.latitude : point1.lat
    const lon1 = 'longitude' in point1 ? point1.longitude : point1.lng
    const lat2 = 'latitude' in point2 ? point2.latitude : point2.lat
    const lon2 = 'longitude' in point2 ? point2.longitude : point2.lng
  
    // Earth's radius in miles
    const R = 3959
  
    // Convert degrees to radians
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
    const distance = R * c
  
    return distance
  }
  
  /**
   * Convert degrees to radians
   */
  function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
  
  /**
   * Format distance for display
   * Returns human-readable string like "5.2 miles away" or "12 miles away"
   * 
   * @param distance - Distance in miles
   * @param includeText - Whether to include "away" text
   * @returns Formatted distance string
   */
  export function formatDistance(distance: number, includeText: boolean = true): string {
    // Round to 1 decimal place
    const rounded = Math.round(distance * 10) / 10
  
    if (includeText) {
      return `${rounded} mile${rounded !== 1 ? 's' : ''} away`
    }
  
    return `${rounded} mi`
  }
  
  /**
   * Check if a point is within a given radius of another point
   * 
   * @param center - Center point coordinates
   * @param target - Target point to check
   * @param radiusMiles - Radius in miles
   * @returns True if target is within radius of center
   */
  export function isWithinRadius(
    center: Coordinates | CoordinatesAlt,
    target: Coordinates | CoordinatesAlt,
    radiusMiles: number
  ): boolean {
    const distance = calculateDistance(center, target)
    return distance <= radiusMiles
  }
  
  /**
   * Filter array of items with coordinates by radius
   * Returns items within specified radius, sorted by distance
   * 
   * @param center - Center point coordinates
   * @param items - Array of items with coordinate properties
   * @param radiusMiles - Radius in miles
   * @param getCoordinates - Function to extract coordinates from item
   * @returns Filtered and sorted array with distance property added
   */
  export function filterByRadius<T>(
    center: Coordinates | CoordinatesAlt,
    items: T[],
    radiusMiles: number,
    getCoordinates: (item: T) => (Coordinates | CoordinatesAlt | null)
  ): (T & { distance: number; distanceFormatted: string })[] {
    return items
      .map(item => {
        const coords = getCoordinates(item)
        if (!coords) return null
  
        const distance = calculateDistance(center, coords)
  
        return {
          ...item,
          distance,
          distanceFormatted: formatDistance(distance)
        }
      })
      .filter((item): item is NonNullable<typeof item> => 
        item !== null && item.distance <= radiusMiles
      )
      .sort((a, b) => a.distance - b.distance)
  }
  
  /**
   * Sort items by distance from a center point
   * Does not filter, just sorts by distance
   * 
   * @param center - Center point coordinates
   * @param items - Array of items with coordinate properties
   * @param getCoordinates - Function to extract coordinates from item
   * @returns Sorted array with distance property added
   */
  export function sortByDistance<T>(
    center: Coordinates | CoordinatesAlt,
    items: T[],
    getCoordinates: (item: T) => (Coordinates | CoordinatesAlt | null)
  ): (T & { distance: number; distanceFormatted: string })[] {
    return items
      .map(item => {
        const coords = getCoordinates(item)
        
        // If no coordinates, put at end with max distance
        if (!coords) {
          return {
            ...item,
            distance: 9999,
            distanceFormatted: 'Location unavailable'
          }
        }
  
        const distance = calculateDistance(center, coords)
  
        return {
          ...item,
          distance,
          distanceFormatted: formatDistance(distance)
        }
      })
      .sort((a, b) => a.distance - b.distance)
  }
  
  /**
   * Get the closest item from an array based on coordinates
   * 
   * @param center - Center point coordinates
   * @param items - Array of items with coordinate properties
   * @param getCoordinates - Function to extract coordinates from item
   * @returns Closest item with distance, or null if no valid items
   */
  export function getClosest<T>(
    center: Coordinates | CoordinatesAlt,
    items: T[],
    getCoordinates: (item: T) => (Coordinates | CoordinatesAlt | null)
  ): (T & { distance: number; distanceFormatted: string }) | null {
    const sorted = sortByDistance(center, items, getCoordinates)
    return sorted.length > 0 && sorted[0].distance !== 9999 ? sorted[0] : null
  }
  
  /**
   * Calculate bounding box for a radius search
   * Useful for database queries to pre-filter before exact distance calculation
   * 
   * @param center - Center point coordinates
   * @param radiusMiles - Radius in miles
   * @returns Bounding box with min/max latitude and longitude
   */
  export function getBoundingBox(
    center: Coordinates | CoordinatesAlt,
    radiusMiles: number
  ): {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
  } {
    const lat = 'latitude' in center ? center.latitude : center.lat
    const lng = 'longitude' in center ? center.longitude : center.lng
  
    // Approximate degrees per mile (varies by latitude)
    const latDegreesPerMile = 1 / 69
    const lngDegreesPerMile = 1 / (69 * Math.cos(toRadians(lat)))
  
    const latDelta = radiusMiles * latDegreesPerMile
    const lngDelta = radiusMiles * lngDegreesPerMile
  
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta
    }
  }
  
  /**
   * Privacy-protected distance calculation
   * Never shows distances less than 1 mile for host privacy
   * Uses consistent randomization based on item ID
   * 
   * @param distance - Actual calculated distance
   * @param itemId - Unique ID for consistent randomization
   * @returns Privacy-protected distance
   */
  export function privacyProtectedDistance(distance: number, itemId: string): number {
    if (distance >= 1.0) {
      return distance
    }
  
    // Generate consistent random value based on ID
    const seed = itemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = (seed % 9) / 10 // Gives 0.0 to 0.8
    
    return 1.1 + random // Range: 1.1 to 1.9 miles
  }
  
  /**
   * Format distance with privacy protection
   * 
   * @param distance - Actual distance in miles
   * @param itemId - Unique ID for consistent randomization
   * @param includeText - Whether to include "away" text
   * @returns Privacy-protected formatted distance
   */
  export function formatDistanceWithPrivacy(
    distance: number,
    itemId: string,
    includeText: boolean = true
  ): string {
    const protectedDistance = privacyProtectedDistance(distance, itemId)
    return formatDistance(protectedDistance, includeText)
  }
  
  /**
   * Group items by distance ranges
   * Useful for creating "Nearby", "< 10 miles", etc. groups
   * 
   * @param center - Center point coordinates
   * @param items - Array of items with coordinate properties
   * @param getCoordinates - Function to extract coordinates from item
   * @returns Object with items grouped by distance range
   */
  export function groupByDistanceRange<T>(
    center: Coordinates | CoordinatesAlt,
    items: T[],
    getCoordinates: (item: T) => (Coordinates | CoordinatesAlt | null)
  ): {
    nearby: T[] // < 5 miles
    close: T[] // 5-10 miles
    moderate: T[] // 10-25 miles
    far: T[] // > 25 miles
  } {
    const withDistance = sortByDistance(center, items, getCoordinates)
  
    return {
      nearby: withDistance.filter(item => item.distance < 5).map(({ distance, distanceFormatted, ...item }) => item as T),
      close: withDistance.filter(item => item.distance >= 5 && item.distance < 10).map(({ distance, distanceFormatted, ...item }) => item as T),
      moderate: withDistance.filter(item => item.distance >= 10 && item.distance <= 25).map(({ distance, distanceFormatted, ...item }) => item as T),
      far: withDistance.filter(item => item.distance > 25).map(({ distance, distanceFormatted, ...item }) => item as T)
    }
  }
  
  /**
   * Calculate center point (centroid) from multiple coordinates
   * Useful for finding center of multiple car locations
   * 
   * @param points - Array of coordinate points
   * @returns Center point coordinates
   */
  export function calculateCentroid(
    points: (Coordinates | CoordinatesAlt)[]
  ): Coordinates {
    if (points.length === 0) {
      throw new Error('Cannot calculate centroid of empty array')
    }
  
    let totalLat = 0
    let totalLng = 0
  
    points.forEach(point => {
      const lat = 'latitude' in point ? point.latitude : point.lat
      const lng = 'longitude' in point ? point.longitude : point.lng
      totalLat += lat
      totalLng += lng
    })
  
    return {
      latitude: totalLat / points.length,
      longitude: totalLng / points.length
    }
  }