// hooks/useUserLocation.ts
// Client-side hook for detecting user's location via browser geolocation
// Caches result in localStorage for faster subsequent loads

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getLocationFromCoordinates,
  DEFAULT_LOCATION
} from '@/lib/data/arizona-locations'

// ============================================================================
// TYPES
// ============================================================================

export interface UserLocation {
  city: string
  state: string
  displayName: string
  latitude: number | null
  longitude: number | null
  isArizona: boolean
  source: 'browser' | 'cached' | 'default'
}

export interface UseUserLocationReturn {
  location: UserLocation
  loading: boolean
  error: string | null
  refresh: () => void
  hasPermission: boolean | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'itwhip_user_location'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CachedLocation extends UserLocation {
  timestamp: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultLocation(): UserLocation {
  return {
    city: DEFAULT_LOCATION.city,
    state: DEFAULT_LOCATION.state,
    displayName: DEFAULT_LOCATION.displayName,
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    isArizona: true,
    source: 'default'
  }
}

function getCachedLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (!cached) return null

    const parsed: CachedLocation = JSON.parse(cached)

    // Check if cache is still valid
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      ...parsed,
      source: 'cached'
    }
  } catch {
    return null
  }
}

function setCachedLocation(location: UserLocation): void {
  if (typeof window === 'undefined') return

  try {
    const cached: CachedLocation = {
      ...location,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<UserLocation>(getDefaultLocation)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const detectLocation = useCallback(async (skipCache: boolean = false) => {
    setLoading(true)
    setError(null)

    // Check cache first (unless skipping)
    if (!skipCache) {
      const cached = getCachedLocation()
      if (cached) {
        setLocation(cached)
        setLoading(false)
        setHasPermission(true) // Assume permission was granted if we have cached data
        return
      }
    }

    // Check if geolocation is supported
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocation(getDefaultLocation())
      setLoading(false)
      setError('Geolocation not supported')
      return
    }

    // Request location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Faster, less battery
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      const locationInfo = getLocationFromCoordinates(latitude, longitude)

      const newLocation: UserLocation = {
        city: locationInfo.city,
        state: locationInfo.state,
        displayName: locationInfo.displayName,
        latitude,
        longitude,
        isArizona: locationInfo.isArizona,
        source: 'browser'
      }

      setLocation(newLocation)
      setCachedLocation(newLocation)
      setHasPermission(true)
    } catch (err) {
      const geoError = err as GeolocationPositionError

      // Handle specific error cases
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setError('Location permission denied')
        setHasPermission(false)
      } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
        setError('Location unavailable')
      } else if (geoError.code === geoError.TIMEOUT) {
        setError('Location request timed out')
      } else {
        setError('Failed to get location')
      }

      // Fall back to default
      setLocation(getDefaultLocation())
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial check on mount - only load cached location, don't request permission
  useEffect(() => {
    // 1. Check cache immediately to populate state without asking permission
    const cached = getCachedLocation()
    if (cached) {
      setLocation(cached)
      // Assume if we have cached location, treat as "permission granted" for UI purposes
      setHasPermission(true)
    }

    // 2. Stop the loading state immediately
    setLoading(false)

    // CRITICAL FIX: We successfully REMOVED the auto-call to detectLocation()
    // This ensures navigator.geolocation.getCurrentPosition is NEVER called on mount
  }, [])

  // Refresh function (skips cache)
  const refresh = useCallback(() => {
    detectLocation(true)
  }, [detectLocation])

  return {
    location,
    loading,
    error,
    refresh,
    hasPermission
  }
}

// ============================================================================
// UTILITY: Get location without hook (for one-time use)
// ============================================================================

export async function getUserLocationOnce(): Promise<UserLocation> {
  // Check cache first
  const cached = getCachedLocation()
  if (cached) return cached

  // Check if geolocation available
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return getDefaultLocation()
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      })
    })

    const { latitude, longitude } = position.coords
    const locationInfo = getLocationFromCoordinates(latitude, longitude)

    const newLocation: UserLocation = {
      city: locationInfo.city,
      state: locationInfo.state,
      displayName: locationInfo.displayName,
      latitude,
      longitude,
      isArizona: locationInfo.isArizona,
      source: 'browser'
    }

    setCachedLocation(newLocation)
    return newLocation
  } catch {
    return getDefaultLocation()
  }
}

export default useUserLocation
