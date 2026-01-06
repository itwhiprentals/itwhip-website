// app/(guest)/dashboard/components/HotelContext.tsx
// Hotel Context Provider - Manages hotel state, location detection, and reservation data
// Provides hotel-specific functionality throughout the dashboard

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
interface HotelReservation {
  id: string
  hotelId: string
  hotelName: string
  checkIn: string
  checkOut: string
  roomNumber?: string
  roomType?: string
  guestCount?: number
  totalAmount?: number
  status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out'
}

interface HotelLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

interface HotelAmenities {
  wifi: boolean
  parking: boolean
  pool: boolean
  gym: boolean
  spa: boolean
  restaurant: boolean
  roomService: boolean
  businessCenter: boolean
  petFriendly: boolean
  airportShuttle: boolean
}

interface HotelInventoryItem {
  id: string
  category: 'amenity' | 'food' | 'service' | 'rental'
  name: string
  description?: string
  price: number
  available: boolean
  imageUrl?: string
  deliveryTime?: number // in minutes
}

interface HotelContextType {
  // State
  isAtHotel: boolean
  hotelId: string | null
  hotelName: string | null
  reservation: HotelReservation | null
  location: HotelLocation | null
  amenities: HotelAmenities | null
  inventory: HotelInventoryItem[]
  
  // Location
  userLocation: GeolocationCoordinates | null
  locationPermission: 'granted' | 'denied' | 'prompt' | null
  distanceFromHotel: number | null
  
  // Actions
  checkHotelContext: () => Promise<void>
  updateReservation: (reservation: HotelReservation) => void
  loadHotelInventory: (hotelId: string) => Promise<void>
  requestLocationPermission: () => Promise<boolean>
  
  // Utilities
  isWithinGeofence: (radius?: number) => boolean
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
  formatDistance: (meters: number) => string
}

// Create context
const HotelContext = createContext<HotelContextType | undefined>(undefined)

// Default geofence radius in meters (100 meters = typical hotel property)
const DEFAULT_GEOFENCE_RADIUS = 100

// Provider component
export function HotelProvider({ children }: { children: ReactNode }) {
  // State
  const [isAtHotel, setIsAtHotel] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [hotelName, setHotelName] = useState<string | null>(null)
  const [reservation, setReservation] = useState<HotelReservation | null>(null)
  const [location, setLocation] = useState<HotelLocation | null>(null)
  const [amenities, setAmenities] = useState<HotelAmenities | null>(null)
  const [inventory, setInventory] = useState<HotelInventoryItem[]>([])
  
  // Location state
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null)
  const [distanceFromHotel, setDistanceFromHotel] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  // Initialize context on mount
  useEffect(() => {
    checkLocationPermission()
    loadReservationData()
    
    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Watch for location changes when we have a reservation
  useEffect(() => {
    if (reservation && locationPermission === 'granted') {
      startLocationTracking()
    }
  }, [reservation, locationPermission])

  // Check location permission status
  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        setLocationPermission(permission.state)
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state)
        })
      } catch (error) {
        console.error('Error checking location permission:', error)
      }
    }
  }

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation(position.coords)
            setLocationPermission('granted')
            resolve(true)
          },
          (error) => {
            console.error('Location permission denied:', error)
            setLocationPermission('denied')
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        )
      } else {
        resolve(false)
      }
    })
  }

  // Start tracking user location
  const startLocationTracking = () => {
    if ('geolocation' in navigator && !watchId) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation(position.coords)
          
          // Check if at hotel
          if (location) {
            const distance = calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              location.latitude,
              location.longitude
            )
            setDistanceFromHotel(distance)
            setIsAtHotel(distance <= DEFAULT_GEOFENCE_RADIUS)
          }
        },
        (error) => {
          console.error('Location tracking error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
      setWatchId(id)
    }
  }

  // Load reservation data
  const loadReservationData = async () => {
    try {
      const response = await fetch('/api/user/reservation')
      if (response.ok) {
        const data = await response.json()
        if (data.reservation) {
          setReservation(data.reservation)
          setHotelId(data.reservation.hotelId)
          setHotelName(data.reservation.hotelName)
          
          // Load hotel details
          await loadHotelDetails(data.reservation.hotelId)
        }
      }
    } catch (error) {
      console.error('Failed to load reservation:', error)
    }
  }

  // Load hotel details
  const loadHotelDetails = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}`)
      if (response.ok) {
        const data = await response.json()
        setLocation(data.location)
        setAmenities(data.amenities)
      }
    } catch (error) {
      console.error('Failed to load hotel details:', error)
    }
  }

  // Load hotel inventory
  const loadHotelInventory = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}/inventory`)
      if (response.ok) {
        const data = await response.json()
        setInventory(data.items || [])
      }
    } catch (error) {
      console.error('Failed to load hotel inventory:', error)
    }
  }

  // Check hotel context (called from components)
  const checkHotelContext = async () => {
    await loadReservationData()
    
    if (locationPermission === 'granted' && !userLocation) {
      await requestLocationPermission()
    }
  }

  // Update reservation
  const updateReservation = (newReservation: HotelReservation) => {
    setReservation(newReservation)
    setHotelId(newReservation.hotelId)
    setHotelName(newReservation.hotelName)
    loadHotelDetails(newReservation.hotelId)
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  // Check if within geofence
  const isWithinGeofence = (radius: number = DEFAULT_GEOFENCE_RADIUS): boolean => {
    if (!userLocation || !location) return false
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    )
    
    return distance <= radius
  }

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  // Context value
  const contextValue: HotelContextType = {
    // State
    isAtHotel,
    hotelId,
    hotelName,
    reservation,
    location,
    amenities,
    inventory,
    
    // Location
    userLocation,
    locationPermission,
    distanceFromHotel,
    
    // Actions
    checkHotelContext,
    updateReservation,
    loadHotelInventory,
    requestLocationPermission,
    
    // Utilities
    isWithinGeofence,
    calculateDistance,
    formatDistance,
  }

  return (
    <HotelContext.Provider value={contextValue}>
      {children}
    </HotelContext.Provider>
  )
}

// Custom hook to use hotel context
export function useHotel() {
  const context = useContext(HotelContext)
  
  if (context === undefined) {
    // Return default values when not wrapped in provider
    return {
      isAtHotel: false,
      hotelId: null,
      hotelName: null,
      reservation: null,
      location: null,
      amenities: null,
      inventory: [],
      userLocation: null,
      locationPermission: null,
      distanceFromHotel: null,
      checkHotelContext: async () => {},
      updateReservation: () => {},
      loadHotelInventory: async () => {},
      requestLocationPermission: async () => false,
      isWithinGeofence: () => false,
      calculateDistance: () => 0,
      formatDistance: () => '',
    }
  }
  
  return context
}

// Export context for external use
export { HotelContext }
export type { HotelReservation, HotelLocation, HotelAmenities, HotelInventoryItem }