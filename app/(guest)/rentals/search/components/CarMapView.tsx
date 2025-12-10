// app/(guest)/rentals/search/components/CarMapView.tsx
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  IoCloseOutline,
  IoStarOutline,
  IoFlashOutline,
  IoCarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import Link from 'next/link'

// Initialize Mapbox token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

interface Car {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  location: {
    lat: number
    lng: number
    city?: string
  }
  photos?: Array<{ url: string }>
  rating?: { average: number; count: number }
  instantBook?: boolean
  carType?: string
  seats?: number
}

interface CarMapViewProps {
  cars: Car[]
  selectedCar: Car | null
  onCarSelect: (car: Car | null) => void
  searchLocation: { lat: number; lng: number }
  userLocation?: { lat: number; lng: number } | null
  isLoading?: boolean
}

// Phoenix metro default coordinates for fallback
const PHOENIX_DEFAULT = { lat: 33.4484, lng: -112.0740 }

// City coordinates for fallback based on city name
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Scottsdale': { lat: 33.4942, lng: -111.9261 },
  'Tempe': { lat: 33.4255, lng: -111.9400 },
  'Mesa': { lat: 33.4152, lng: -111.8315 },
  'Chandler': { lat: 33.3062, lng: -111.8413 },
  'Gilbert': { lat: 33.3528, lng: -111.7890 },
  'Glendale': { lat: 33.5387, lng: -112.1860 },
  'Peoria': { lat: 33.5806, lng: -112.2374 },
}

// Privacy-preserving location offset (300-600m from actual location)
// Creates a consistent offset per car so it doesn't jump around
function offsetLocation(lat: number, lng: number, carId: string): { lat: number; lng: number } {
  const seed = carId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const angle = (seed % 360) * (Math.PI / 180)
  // Offset between 0.003 and 0.006 degrees (~300-600m)
  const offset = 0.003 + (seed % 100) / 33333
  return {
    lat: lat + Math.cos(angle) * offset,
    lng: lng + Math.sin(angle) * offset
  }
}

// Get fallback coordinates based on city name
function getFallbackCoords(city?: string): { lat: number; lng: number } {
  if (city) {
    const normalizedCity = city.split(',')[0].trim()
    if (CITY_COORDS[normalizedCity]) {
      return CITY_COORDS[normalizedCity]
    }
  }
  return PHOENIX_DEFAULT
}

// Car Popup Component - Rendered via Portal
function CarPopup({
  car,
  onClose,
  isMobile
}: {
  car: Car
  onClose: () => void
  isMobile: boolean
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const photos = car.photos || []

  const nextImage = () => {
    if (photos.length > 1) {
      setImageIndex(prev => (prev + 1) % photos.length)
    }
  }

  const prevImage = () => {
    if (photos.length > 1) {
      setImageIndex(prev => (prev - 1 + photos.length) % photos.length)
    }
  }

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Mobile: Bottom sheet style
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999]" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Bottom Sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[70vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-lg"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
            {photos[imageIndex] ? (
              <img
                src={photos[imageIndex].url}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoCarOutline className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Image nav buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
                >
                  <IoChevronBackOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
                >
                  <IoChevronForwardOutline className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {car.instantBook && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <IoFlashOutline className="w-3 h-3" /> Instant
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {car.year} {car.make} {car.model}
            </h3>

            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {car.rating && (
                <span className="flex items-center gap-1">
                  <IoStarOutline className="w-4 h-4 text-amber-500" />
                  {car.rating.average?.toFixed(1) || '5.0'} ({car.rating.count || 0})
                </span>
              )}
              <span>{car.location?.city || 'Phoenix'}</span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(car.dailyRate)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/day</span>
              </div>

              <Link
                href={`/rentals/${car.id}`}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Centered modal
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <IoCloseOutline className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative h-56 bg-gray-200 dark:bg-gray-700">
          {photos[imageIndex] ? (
            <img
              src={photos[imageIndex].url}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoCarOutline className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Image nav buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <IoChevronBackOutline className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === imageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {car.instantBook && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" /> Instant
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {car.year} {car.make} {car.model}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            {car.rating && (
              <span className="flex items-center gap-1">
                <IoStarOutline className="w-4 h-4 text-amber-500" />
                {car.rating.average?.toFixed(1) || '5.0'} ({car.rating.count || 0})
              </span>
            )}
            <span>{car.location?.city || 'Phoenix'}</span>
            {car.seats && <span>{car.seats} seats</span>}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${Math.round(car.dailyRate)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">/day</span>
            </div>

            <Link
              href={`/rentals/${car.id}`}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Map Component
export default function CarMapView({
  cars,
  selectedCar,
  onCarSelect,
  searchLocation,
  userLocation,
  isLoading = false
}: CarMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // Set portal container after mount
  useEffect(() => {
    setPortalContainer(document.body)
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Process cars with offset locations - ALL cars get a location (use fallback if needed)
  const processedCars = useMemo(() => {
    return cars.map(car => {
      // Get base coordinates - use actual location or fallback based on city
      let baseLat = car.location?.lat
      let baseLng = car.location?.lng

      // If coordinates are missing or invalid, use fallback
      if (baseLat === undefined || baseLat === null ||
          baseLng === undefined || baseLng === null ||
          !isFinite(baseLat) || !isFinite(baseLng)) {
        const fallback = getFallbackCoords(car.location?.city || car.city)
        baseLat = fallback.lat
        baseLng = fallback.lng
      }

      // Apply privacy offset to all coordinates
      const displayLocation = offsetLocation(baseLat, baseLng, car.id)

      return {
        ...car,
        displayLocation
      }
    })
  }, [cars])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    if (!searchLocation?.lat || !searchLocation?.lng) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setMapError('Map configuration error')
      return
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [searchLocation.lng, searchLocation.lat],
        zoom: 11,
        attributionControl: false
      })

      map.current = newMap

      newMap.on('load', () => {
        setMapLoaded(true)
        setMapError(null)
      })

      newMap.on('error', () => {
        setMapError('Failed to load map')
      })

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

      return () => {
        markers.current.forEach(m => m.remove())
        markers.current.clear()
        newMap.remove()
        map.current = null
      }
    } catch {
      setMapError('Failed to initialize map')
    }
  }, [searchLocation])

  // Add markers (only when cars or map changes, NOT on selection change)
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear old markers
    markers.current.forEach(m => m.remove())
    markers.current.clear()

    // Add markers for each car - ALL cars have displayLocation now
    processedCars.forEach(car => {
      // Create marker container
      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.dataset.carId = car.id
      el.style.cssText = 'position: relative;'

      // Proximity circle (shows approximate area, not exact location)
      const circle = document.createElement('div')
      circle.className = 'proximity-circle'
      circle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(217, 119, 6, 0.1);
        border: 2px dashed rgba(217, 119, 6, 0.3);
        pointer-events: none;
        z-index: 1;
      `
      el.appendChild(circle)

      // Price badge (centered on the circle)
      const badge = document.createElement('div')
      badge.className = 'marker-badge'
      badge.style.cssText = `
        position: relative;
        z-index: 2;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        background: white;
        color: #111;
        border: 2px solid #e5e7eb;
        white-space: nowrap;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      `
      badge.textContent = `$${Math.round(car.dailyRate)}`
      el.appendChild(badge)

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onCarSelect(car)
      })

      // Hover effect
      el.addEventListener('mouseenter', () => {
        badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'
        circle.style.background = 'rgba(217, 119, 6, 0.15)'
        circle.style.borderColor = 'rgba(217, 119, 6, 0.5)'
      })

      el.addEventListener('mouseleave', () => {
        const isSelected = selectedCar?.id === car.id
        if (!isSelected) {
          badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
          circle.style.background = 'rgba(217, 119, 6, 0.1)'
          circle.style.borderColor = 'rgba(217, 119, 6, 0.3)'
        }
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([car.displayLocation.lng, car.displayLocation.lat])
        .addTo(map.current!)

      markers.current.set(car.id, marker)
    })
  }, [processedCars, mapLoaded, onCarSelect, selectedCar])

  // Update marker styles when selection changes (without recreating markers)
  useEffect(() => {
    markers.current.forEach((marker, carId) => {
      const el = marker.getElement()
      const badge = el.querySelector('.marker-badge') as HTMLElement
      const circle = el.querySelector('.proximity-circle') as HTMLElement
      if (!badge) return

      const isSelected = selectedCar?.id === carId

      if (isSelected) {
        badge.style.background = '#d97706'
        badge.style.color = 'white'
        badge.style.borderColor = '#b45309'
        badge.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.4)'
        if (circle) {
          circle.style.background = 'rgba(217, 119, 6, 0.2)'
          circle.style.borderColor = 'rgba(217, 119, 6, 0.6)'
          circle.style.borderStyle = 'solid'
        }
      } else {
        badge.style.background = 'white'
        badge.style.color = '#111'
        badge.style.borderColor = '#e5e7eb'
        badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
        if (circle) {
          circle.style.background = 'rgba(217, 119, 6, 0.1)'
          circle.style.borderColor = 'rgba(217, 119, 6, 0.3)'
          circle.style.borderStyle = 'dashed'
        }
      }
    })
  }, [selectedCar])

  // Pan to selected car
  useEffect(() => {
    if (!map.current || !selectedCar) return

    const car = processedCars.find(c => c.id === selectedCar.id)
    if (car?.displayLocation) {
      map.current.easeTo({
        center: [car.displayLocation.lng, car.displayLocation.lat],
        zoom: 13,
        duration: 500
      })
    }
  }, [selectedCar, processedCars])

  // Error state
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Map Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{mapError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay - shows teaser info */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white font-medium mb-1">
              Finding cars near you...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tap markers to explore available rentals
            </p>
          </div>
        </div>
      )}

      {/* Car count badge - always visible when map loaded */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {processedCars.length} cars
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            in this area
          </span>
        </div>
      )}

      {/* Approximate location notice */}
      {mapLoaded && !isLoading && processedCars.length > 0 && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg text-xs text-white max-w-[200px]">
          Markers show approximate pickup areas for privacy
        </div>
      )}

      {/* Selected car popup - Rendered via Portal to document.body */}
      {selectedCar && portalContainer && createPortal(
        <CarPopup
          car={selectedCar}
          onClose={() => onCarSelect(null)}
          isMobile={isMobile}
        />,
        portalContainer
      )}
    </div>
  )
}
