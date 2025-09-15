// app/sys-2847/fleet/edit/components/LocationPicker.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { geocodeAddress, formatCoordinates, validateCoordinates } from '@/app/lib/geocoding/mapbox'

// Set the Mapbox token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

interface LocationPickerProps {
  address: string
  city: string
  state: string
  latitude?: number | null
  longitude?: number | null
  onCoordinatesChange: (lat: number, lng: number) => void
  readOnly?: boolean
}

export function LocationPicker({
  address,
  city,
  state,
  latitude,
  longitude,
  onCoordinatesChange,
  readOnly = false
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    // Default to Phoenix center if no coordinates
    const initialLng = longitude || -112.0740
    const initialLat = latitude || 33.4484

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 13
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: !readOnly,
      color: '#3B82F6'
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current)

    // Handle marker drag
    if (!readOnly) {
      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat()
        const newLat = parseFloat(lngLat.lat.toFixed(6))
        const newLng = parseFloat(lngLat.lng.toFixed(6))
        
        setCurrentCoords({ lat: newLat, lng: newLng })
        onCoordinatesChange(newLat, newLng)
      })
    }

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update marker when coordinates change
  useEffect(() => {
    if (marker.current && latitude && longitude) {
      marker.current.setLngLat([longitude, latitude])
      map.current?.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1000
      })
      setCurrentCoords({ lat: latitude, lng: longitude })
    }
  }, [latitude, longitude])

  // Geocode address
  const handleGeocode = async () => {
    if (!address || !city || !state) {
      setGeocodeError('Please enter complete address information')
      return
    }

    setIsGeocoding(true)
    setGeocodeError(null)

    try {
      const result = await geocodeAddress(address, city, state)
      
      if (result) {
        const { latitude: lat, longitude: lng } = result
        
        if (validateCoordinates(lat, lng)) {
          // Update marker and map
          marker.current?.setLngLat([lng, lat])
          map.current?.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1000
          })
          
          setCurrentCoords({ lat, lng })
          onCoordinatesChange(lat, lng)
          setGeocodeError(null)
        } else {
          setGeocodeError('Coordinates outside valid range')
        }
      } else {
        setGeocodeError('Could not geocode this address. Please verify and try again.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setGeocodeError('Geocoding service error. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-64 rounded-lg border border-gray-300 dark:border-gray-700"
        />
        
        {/* Coordinates Display */}
        {currentCoords && (
          <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs shadow">
            {formatCoordinates(currentCoords.lat, currentCoords.lng)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleGeocode}
          disabled={isGeocoding || readOnly}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          {isGeocoding ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Geocoding...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Geocode Address
            </>
          )}
        </button>

        {!readOnly && (
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drag the marker to adjust location
          </p>
        )}
      </div>

      {/* Error Message */}
      {geocodeError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {geocodeError}
        </div>
      )}
    </div>
  )
}