// app/(guest)/dashboard/components/RentalContext.tsx
// Rental Context Provider - Manages rental state, location detection, and booking data
// Provides rental-specific functionality throughout the dashboard

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
interface RentalBooking {
  id: string
  hostId: string
  hostName: string
  vehicleId: string
  vehicleName: string
  pickupDate: string
  returnDate: string
  pickupLocation?: string
  vehicleClass?: string
  totalAmount?: number
  status: 'confirmed' | 'pending' | 'active' | 'completed'
}

interface RentalLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

interface VehicleFeatures {
  bluetooth: boolean
  gps: boolean
  backupCamera: boolean
  heatedSeats: boolean
  sunroof: boolean
  appleCarPlay: boolean
  androidAuto: boolean
  childSeat: boolean
  petFriendly: boolean
  unlimitedMiles: boolean
}

interface RentalInventoryItem {
  id: string
  category: 'addon' | 'insurance' | 'service' | 'equipment'
  name: string
  description?: string
  price: number
  available: boolean
  imageUrl?: string
  deliveryTime?: number // in minutes
}

interface RentalContextType {
  // State
  isAtPickupLocation: boolean
  hostId: string | null
  hostName: string | null
  booking: RentalBooking | null
  location: RentalLocation | null
  features: VehicleFeatures | null
  inventory: RentalInventoryItem[]

  // Location
  userLocation: GeolocationCoordinates | null
  locationPermission: 'granted' | 'denied' | 'prompt' | null
  distanceFromPickup: number | null

  // Actions
  checkRentalContext: () => Promise<void>
  updateBooking: (booking: RentalBooking) => void
  loadRentalInventory: (hostId: string) => Promise<void>
  requestLocationPermission: () => Promise<boolean>

  // Utilities
  isWithinGeofence: (radius?: number) => boolean
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
  formatDistance: (meters: number) => string
}

// Create context
const RentalContext = createContext<RentalContextType | undefined>(undefined)

// Default geofence radius in meters (100 meters = typical pickup location)
const DEFAULT_GEOFENCE_RADIUS = 100

// Provider component
export function RentalProvider({ children }: { children: ReactNode }) {
  // State
  const [isAtPickupLocation, setIsAtPickupLocation] = useState(false)
  const [hostId, setHostId] = useState<string | null>(null)
  const [hostName, setHostName] = useState<string | null>(null)
  const [booking, setBooking] = useState<RentalBooking | null>(null)
  const [location, setLocation] = useState<RentalLocation | null>(null)
  const [features, setFeatures] = useState<VehicleFeatures | null>(null)
  const [inventory, setInventory] = useState<RentalInventoryItem[]>([])

  // Location state
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null)
  const [distanceFromPickup, setDistanceFromPickup] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  // Initialize context on mount
  useEffect(() => {
    checkLocationPermission()
    loadBookingData()

    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Watch for location changes when we have a booking
  useEffect(() => {
    if (booking && locationPermission === 'granted') {
      startLocationTracking()
    }
  }, [booking, locationPermission])

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

          // Check if at pickup location
          if (location) {
            const distance = calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              location.latitude,
              location.longitude
            )
            setDistanceFromPickup(distance)
            setIsAtPickupLocation(distance <= DEFAULT_GEOFENCE_RADIUS)
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

  // Load booking data
  const loadBookingData = async () => {
    try {
      const response = await fetch('/api/user/booking')
      if (response.ok) {
        const data = await response.json()
        if (data.booking) {
          setBooking(data.booking)
          setHostId(data.booking.hostId)
          setHostName(data.booking.hostName)

          // Load host/vehicle details
          await loadHostDetails(data.booking.hostId)
        }
      }
    } catch (error) {
      console.error('Failed to load booking:', error)
    }
  }

  // Load host details
  const loadHostDetails = async (hostId: string) => {
    try {
      const response = await fetch(`/api/hosts/${hostId}`)
      if (response.ok) {
        const data = await response.json()
        setLocation(data.location)
        setFeatures(data.vehicleFeatures)
      }
    } catch (error) {
      console.error('Failed to load host details:', error)
    }
  }

  // Load rental inventory
  const loadRentalInventory = async (hostId: string) => {
    try {
      const response = await fetch(`/api/hosts/${hostId}/inventory`)
      if (response.ok) {
        const data = await response.json()
        setInventory(data.items || [])
      }
    } catch (error) {
      console.error('Failed to load rental inventory:', error)
    }
  }

  // Check rental context (called from components)
  const checkRentalContext = async () => {
    await loadBookingData()

    if (locationPermission === 'granted' && !userLocation) {
      await requestLocationPermission()
    }
  }

  // Update booking
  const updateBooking = (newBooking: RentalBooking) => {
    setBooking(newBooking)
    setHostId(newBooking.hostId)
    setHostName(newBooking.hostName)
    loadHostDetails(newBooking.hostId)
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
  const contextValue: RentalContextType = {
    // State
    isAtPickupLocation,
    hostId,
    hostName,
    booking,
    location,
    features,
    inventory,

    // Location
    userLocation,
    locationPermission,
    distanceFromPickup,

    // Actions
    checkRentalContext,
    updateBooking,
    loadRentalInventory,
    requestLocationPermission,

    // Utilities
    isWithinGeofence,
    calculateDistance,
    formatDistance,
  }

  return (
    <RentalContext.Provider value={contextValue}>
      {children}
    </RentalContext.Provider>
  )
}

// Custom hook to use rental context
export function useRental() {
  const context = useContext(RentalContext)

  if (context === undefined) {
    // Return default values when not wrapped in provider
    return {
      isAtPickupLocation: false,
      hostId: null,
      hostName: null,
      booking: null,
      location: null,
      features: null,
      inventory: [],
      userLocation: null,
      locationPermission: null,
      distanceFromPickup: null,
      checkRentalContext: async () => {},
      updateBooking: () => {},
      loadRentalInventory: async () => {},
      requestLocationPermission: async () => false,
      isWithinGeofence: () => false,
      calculateDistance: () => 0,
      formatDistance: () => '',
    }
  }

  return context
}

// Export context for external use
export { RentalContext }
export type { RentalBooking, RentalLocation, VehicleFeatures, RentalInventoryItem }
