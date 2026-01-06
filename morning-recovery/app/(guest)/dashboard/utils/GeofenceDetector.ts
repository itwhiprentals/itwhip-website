// app/(guest)/dashboard/utils/GeofenceDetector.ts
// Geofence Detection Utility - Handles location detection, geofencing, and proximity calculations
// Provides methods for determining if user is at hotel, restaurant, or other locations

// Types
interface Coordinates {
    latitude: number
    longitude: number
  }
  
  interface GeofenceZone {
    id: string
    name: string
    type: 'hotel' | 'restaurant' | 'airport' | 'venue' | 'custom'
    center: Coordinates
    radius: number // in meters
    metadata?: Record<string, any>
  }
  
  interface LocationResult {
    coords: Coordinates
    accuracy: number
    timestamp: number
    speed: number | null
    heading: number | null
  }
  
  interface ProximityResult {
    zone: GeofenceZone
    distance: number
    isInside: boolean
    direction?: string
    estimatedTimeToArrive?: number // in minutes
  }
  
  // Constants
  const DEFAULT_HOTEL_RADIUS = 100 // meters
  const DEFAULT_RESTAURANT_RADIUS = 50 // meters
  const DEFAULT_AIRPORT_RADIUS = 1000 // meters
  const HIGH_ACCURACY_THRESHOLD = 20 // meters
  const CACHE_DURATION = 30000 // 30 seconds
  const MAX_AGE = 60000 // 1 minute
  
  class GeofenceDetector {
    private watchId: number | null = null
    private lastPosition: LocationResult | null = null
    private lastFetch: number = 0
    private cachedZones: GeofenceZone[] = []
    private subscribers: Map<string, (result: ProximityResult[]) => void> = new Map()
  
    constructor() {
      // Initialize with any stored zones
      this.loadStoredZones()
    }
  
    // Load zones from localStorage or API
    private async loadStoredZones() {
      try {
        // Check localStorage first
        const stored = localStorage.getItem('geofence_zones')
        if (stored) {
          this.cachedZones = JSON.parse(stored)
        }
  
        // Fetch from API if cache is old
        if (Date.now() - this.lastFetch > CACHE_DURATION) {
          await this.fetchZonesFromAPI()
        }
      } catch (error) {
        console.error('Failed to load geofence zones:', error)
      }
    }
  
    // Fetch zones from API
    private async fetchZonesFromAPI() {
      try {
        const response = await fetch('/api/geofence/zones')
        if (response.ok) {
          const data = await response.json()
          this.cachedZones = data.zones || []
          localStorage.setItem('geofence_zones', JSON.stringify(this.cachedZones))
          this.lastFetch = Date.now()
        }
      } catch (error) {
        console.error('Failed to fetch zones from API:', error)
      }
    }
  
    // Get current location
    async getCurrentLocation(): Promise<LocationResult> {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Geolocation not supported'))
          return
        }
  
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const result: LocationResult = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              speed: position.coords.speed,
              heading: position.coords.heading,
            }
            
            this.lastPosition = result
            resolve(result)
          },
          (error) => {
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: MAX_AGE,
          }
        )
      })
    }
  
    // Start watching location
    startWatching(callback: (result: ProximityResult[]) => void, subscriberId: string = 'default') {
      // Store subscriber
      this.subscribers.set(subscriberId, callback)
  
      // Start watching if not already
      if (this.watchId === null && 'geolocation' in navigator) {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const result: LocationResult = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              speed: position.coords.speed,
              heading: position.coords.heading,
            }
            
            this.lastPosition = result
            this.checkAllZones()
          },
          (error) => {
            console.error('Location watch error:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        )
      }
    }
  
    // Stop watching location
    stopWatching(subscriberId: string = 'default') {
      this.subscribers.delete(subscriberId)
  
      // Stop watching if no more subscribers
      if (this.subscribers.size === 0 && this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
      }
    }
  
    // Check all zones for proximity
    private checkAllZones() {
      if (!this.lastPosition) return
  
      const results: ProximityResult[] = []
  
      for (const zone of this.cachedZones) {
        const distance = this.calculateDistance(
          this.lastPosition.coords,
          zone.center
        )
  
        const isInside = distance <= zone.radius
  
        results.push({
          zone,
          distance,
          isInside,
          direction: this.getDirection(this.lastPosition.coords, zone.center),
          estimatedTimeToArrive: this.estimateArrivalTime(distance, this.lastPosition.speed),
        })
      }
  
      // Notify all subscribers
      this.subscribers.forEach(callback => callback(results))
    }
  
    // Calculate distance between two points (Haversine formula)
    calculateDistance(from: Coordinates, to: Coordinates): number {
      const R = 6371e3 // Earth radius in meters
      const φ1 = from.latitude * Math.PI / 180
      const φ2 = to.latitude * Math.PI / 180
      const Δφ = (to.latitude - from.latitude) * Math.PI / 180
      const Δλ = (to.longitude - from.longitude) * Math.PI / 180
  
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
      return R * c // Distance in meters
    }
  
    // Get cardinal direction from one point to another
    private getDirection(from: Coordinates, to: Coordinates): string {
      const bearing = this.calculateBearing(from, to)
      
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
      const index = Math.round(bearing / 45) % 8
      
      return directions[index]
    }
  
    // Calculate bearing between two points
    private calculateBearing(from: Coordinates, to: Coordinates): number {
      const φ1 = from.latitude * Math.PI / 180
      const φ2 = to.latitude * Math.PI / 180
      const Δλ = (to.longitude - from.longitude) * Math.PI / 180
  
      const y = Math.sin(Δλ) * Math.cos(φ2)
      const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  
      const θ = Math.atan2(y, x)
  
      return (θ * 180 / Math.PI + 360) % 360
    }
  
    // Estimate arrival time based on distance and speed
    private estimateArrivalTime(distance: number, speed: number | null): number | undefined {
      if (!speed || speed <= 0) {
        // Assume walking speed of 5 km/h if no speed data
        speed = 5 / 3.6 // Convert to m/s
      }
  
      return Math.round(distance / speed / 60) // Convert to minutes
    }
  
    // Check if at specific hotel
    async isAtHotel(hotelId?: string): Promise<boolean> {
      try {
        const location = await this.getCurrentLocation()
        
        // Find hotel zone
        const hotelZone = this.cachedZones.find(zone => 
          zone.type === 'hotel' && (!hotelId || zone.id === hotelId)
        )
  
        if (!hotelZone) {
          // Try to fetch specific hotel
          if (hotelId) {
            const response = await fetch(`/api/hotels/${hotelId}/location`)
            if (response.ok) {
              const data = await response.json()
              const distance = this.calculateDistance(location.coords, data.coordinates)
              return distance <= DEFAULT_HOTEL_RADIUS
            }
          }
          return false
        }
  
        const distance = this.calculateDistance(location.coords, hotelZone.center)
        return distance <= hotelZone.radius
      } catch (error) {
        console.error('Failed to check hotel location:', error)
        return false
      }
    }
  
    // Add a new geofence zone
    addZone(zone: GeofenceZone) {
      // Check if zone already exists
      const existingIndex = this.cachedZones.findIndex(z => z.id === zone.id)
      
      if (existingIndex >= 0) {
        // Update existing zone
        this.cachedZones[existingIndex] = zone
      } else {
        // Add new zone
        this.cachedZones.push(zone)
      }
  
      // Save to localStorage
      localStorage.setItem('geofence_zones', JSON.stringify(this.cachedZones))
      
      // Check zones immediately
      this.checkAllZones()
    }
  
    // Remove a geofence zone
    removeZone(zoneId: string) {
      this.cachedZones = this.cachedZones.filter(z => z.id !== zoneId)
      localStorage.setItem('geofence_zones', JSON.stringify(this.cachedZones))
    }
  
    // Get all zones
    getZones(): GeofenceZone[] {
      return [...this.cachedZones]
    }
  
    // Get zones by type
    getZonesByType(type: GeofenceZone['type']): GeofenceZone[] {
      return this.cachedZones.filter(z => z.type === type)
    }
  
    // Check if location is accurate enough
    isLocationAccurate(): boolean {
      return this.lastPosition ? this.lastPosition.accuracy <= HIGH_ACCURACY_THRESHOLD : false
    }
  
    // Get last known position
    getLastPosition(): LocationResult | null {
      return this.lastPosition
    }
  
    // Format distance for display
    formatDistance(meters: number): string {
      if (meters < 1000) {
        return `${Math.round(meters)}m`
      } else if (meters < 10000) {
        return `${(meters / 1000).toFixed(1)}km`
      } else {
        return `${Math.round(meters / 1000)}km`
      }
    }
  
    // Check proximity to all zones
    async checkProximity(coords?: Coordinates): Promise<ProximityResult[]> {
      const location = coords || this.lastPosition?.coords
      
      if (!location) {
        const current = await this.getCurrentLocation()
        location = current.coords
      }
  
      const results: ProximityResult[] = []
  
      for (const zone of this.cachedZones) {
        const distance = this.calculateDistance(location, zone.center)
        const isInside = distance <= zone.radius
  
        results.push({
          zone,
          distance,
          isInside,
          direction: this.getDirection(location, zone.center),
          estimatedTimeToArrive: this.estimateArrivalTime(distance, this.lastPosition?.speed || null),
        })
      }
  
      // Sort by distance
      results.sort((a, b) => a.distance - b.distance)
  
      return results
    }
  
    // Find nearest zone of type
    async findNearest(type: GeofenceZone['type']): Promise<ProximityResult | null> {
      const results = await this.checkProximity()
      const filtered = results.filter(r => r.zone.type === type)
      
      return filtered.length > 0 ? filtered[0] : null
    }
  
    // Check if user is moving
    isMoving(threshold: number = 0.5): boolean {
      // Speed in m/s, default threshold is 0.5 m/s (slow walk)
      return this.lastPosition ? (this.lastPosition.speed || 0) > threshold : false
    }
  
    // Get movement status
    getMovementStatus(): string {
      if (!this.lastPosition || this.lastPosition.speed === null) {
        return 'stationary'
      }
  
      const speedKmh = this.lastPosition.speed * 3.6
  
      if (speedKmh < 1) return 'stationary'
      if (speedKmh < 6) return 'walking'
      if (speedKmh < 15) return 'running'
      if (speedKmh < 50) return 'driving_slow'
      if (speedKmh < 100) return 'driving'
      return 'driving_fast'
    }
  }
  
  // Create singleton instance
  const geofenceDetector = new GeofenceDetector()
  
  // Export instance and types
  export default geofenceDetector
  export type { Coordinates, GeofenceZone, LocationResult, ProximityResult }