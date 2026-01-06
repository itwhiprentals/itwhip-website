// app/lib/geocoding/mapbox.ts

interface GeocodeResult {
    latitude: number
    longitude: number
    formattedAddress: string
    confidence: 'high' | 'medium' | 'low'
  }
  
  interface MapboxFeature {
    center: [number, number] // [lng, lat]
    place_name: string
    relevance: number
    properties: {
      accuracy?: string
    }
  }
  
  interface MapboxResponse {
    features: MapboxFeature[]
  }
  
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  
  /**
   * Geocode an address using Mapbox Geocoding API
   * @param address Full address string
   * @param city City name
   * @param state State code (e.g., "AZ")
   * @returns Coordinates and formatted address
   */
  export async function geocodeAddress(
    address: string,
    city: string,
    state: string
  ): Promise<GeocodeResult | null> {
    try {
      // Build the full address query
      const query = `${address}, ${city}, ${state}`.trim()
      
      // Encode for URL
      const encodedQuery = encodeURIComponent(query)
      
      // Mapbox Geocoding API endpoint
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&country=US&limit=1`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('Mapbox API error:', response.status, response.statusText)
        return null
      }
      
      const data: MapboxResponse = await response.json()
      
      if (!data.features || data.features.length === 0) {
        console.warn('No results found for address:', query)
        return null
      }
      
      const feature = data.features[0]
      const [lng, lat] = feature.center
      
      // Determine confidence based on relevance score
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (feature.relevance > 0.9) confidence = 'high'
      else if (feature.relevance > 0.7) confidence = 'medium'
      
      return {
        latitude: lat,
        longitude: lng,
        formattedAddress: feature.place_name,
        confidence
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }
  
  /**
   * Batch geocode multiple addresses
   * @param addresses Array of address objects
   * @returns Array of geocoded results
   */
  export async function batchGeocode(
    addresses: Array<{ id: string; address: string; city: string; state: string }>
  ): Promise<Array<{ id: string; result: GeocodeResult | null }>> {
    const results = []
    
    for (const addr of addresses) {
      // Add delay to respect rate limits (Mapbox allows 600 requests/minute)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await geocodeAddress(addr.address, addr.city, addr.state)
      results.push({ id: addr.id, result })
    }
    
    return results
  }
  
  /**
   * Validate coordinates are within reasonable bounds
   * @param lat Latitude
   * @param lng Longitude
   * @returns True if coordinates are valid
   */
  export function validateCoordinates(lat: number, lng: number): boolean {
    // Check if coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) return false
    
    // Check latitude bounds (-90 to 90)
    if (lat < -90 || lat > 90) return false
    
    // Check longitude bounds (-180 to 180)
    if (lng < -180 || lng > 180) return false
    
    // Check if coordinates are in Arizona region (rough bounds)
    // Arizona approximately: 31-37°N, 109-115°W
    const isInArizona = lat >= 31 && lat <= 37 && lng >= -115 && lng <= -109
    
    if (!isInArizona) {
      console.warn('Coordinates outside Arizona:', lat, lng)
    }
    
    return true
  }
  
  /**
   * Get city center coordinates as fallback
   * @param city City name
   * @returns Default coordinates for the city
   */
  export function getCityFallbackCoordinates(city: string): { lat: number; lng: number } {
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'Phoenix': { lat: 33.4484, lng: -112.0740 },
      'Scottsdale': { lat: 33.4942, lng: -111.9261 },
      'Tempe': { lat: 33.4255, lng: -111.9400 },
      'Mesa': { lat: 33.4152, lng: -111.8315 },
      'Chandler': { lat: 33.3062, lng: -111.8413 },
      'Gilbert': { lat: 33.3528, lng: -111.7890 },
      'Glendale': { lat: 33.5387, lng: -112.1860 },
      'Peoria': { lat: 33.5806, lng: -112.2374 },
      'Surprise': { lat: 33.6292, lng: -112.3679 },
      'Paradise Valley': { lat: 33.5310, lng: -111.9426 },
      'Cave Creek': { lat: 33.8333, lng: -111.9508 },
      'Fountain Hills': { lat: 33.6117, lng: -111.7173 }
    }
    
    return cityCoordinates[city] || cityCoordinates['Phoenix']
  }
  
  /**
   * Format coordinates for display
   * @param lat Latitude
   * @param lng Longitude
   * @returns Formatted string
   */
  export function formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
  
  export default {
    geocodeAddress,
    batchGeocode,
    validateCoordinates,
    getCityFallbackCoordinates,
    formatCoordinates
  }