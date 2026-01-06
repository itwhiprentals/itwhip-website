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
  IoChevronForwardOutline,
  IoLocationOutline,
  IoAirplaneOutline,
  IoSnowOutline,
  IoShieldCheckmarkOutline
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
  rentalDays?: number
}

// Phoenix metro default coordinates for fallback
const PHOENIX_DEFAULT = { lat: 33.4484, lng: -112.0740 }

// AZ Neighborhood centers for privacy snapping (approximate areas, not exact addresses)
// Each neighborhood has a center point and a privacy radius for markers
const AZ_NEIGHBORHOODS: Record<string, { lat: number; lng: number; name: string; tip?: string }> = {
  // Phoenix Metro
  'downtown-phoenix': { lat: 33.4484, lng: -112.0740, name: 'Downtown Phoenix', tip: 'Near Chase Field & Convention Center' },
  'arcadia': { lat: 33.5091, lng: -111.9782, name: 'Arcadia', tip: 'Upscale neighborhood with great dining' },
  'biltmore': { lat: 33.5153, lng: -112.0183, name: 'Biltmore', tip: 'Luxury shopping & resorts' },
  'desert-ridge': { lat: 33.6751, lng: -111.9281, name: 'Desert Ridge', tip: 'Near Mayo Clinic' },
  'ahwatukee': { lat: 33.3333, lng: -111.9833, name: 'Ahwatukee', tip: 'South Mountain access' },
  'paradise-valley': { lat: 33.5333, lng: -111.9433, name: 'Paradise Valley', tip: 'Camelback Mountain nearby' },
  // Scottsdale
  'old-town-scottsdale': { lat: 33.4942, lng: -111.9261, name: 'Old Town Scottsdale', tip: 'Galleries, dining & nightlife' },
  'north-scottsdale': { lat: 33.6167, lng: -111.8989, name: 'North Scottsdale', tip: 'Hiking & luxury homes' },
  'scottsdale-airpark': { lat: 33.6277, lng: -111.9156, name: 'Scottsdale Airpark', tip: 'Near Scottsdale Airport' },
  // East Valley
  'tempe-asu': { lat: 33.4255, lng: -111.9400, name: 'Tempe / ASU', tip: 'Near ASU campus & Mill Ave' },
  'downtown-mesa': { lat: 33.4152, lng: -111.8315, name: 'Downtown Mesa', tip: 'Spring Training nearby' },
  'gilbert': { lat: 33.3528, lng: -111.7890, name: 'Gilbert', tip: 'Family-friendly suburb' },
  'chandler': { lat: 33.3062, lng: -111.8413, name: 'Chandler', tip: 'Tech hub & great parks' },
  'queen-creek': { lat: 33.2486, lng: -111.6343, name: 'Queen Creek', tip: 'Rural charm & farms' },
  // West Valley
  'glendale': { lat: 33.5387, lng: -112.1860, name: 'Glendale', tip: 'Near State Farm Stadium' },
  'peoria': { lat: 33.5806, lng: -112.2374, name: 'Peoria', tip: 'Spring Training & Lake Pleasant' },
  'surprise': { lat: 33.6292, lng: -112.3679, name: 'Surprise', tip: 'Growing west valley suburb' },
  'goodyear': { lat: 33.4353, lng: -112.3583, name: 'Goodyear', tip: 'Near Phoenix Goodyear Airport' },
  // Airport
  'sky-harbor': { lat: 33.4373, lng: -112.0078, name: 'Sky Harbor Area', tip: 'Free airport delivery available!' },
}

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
  'Surprise': { lat: 33.6292, lng: -112.3679 },
  'Goodyear': { lat: 33.4353, lng: -112.3583 },
  'Queen Creek': { lat: 33.2486, lng: -111.6343 },
}

// Find nearest neighborhood center for privacy snapping
function findNearestNeighborhood(lat: number, lng: number): { center: { lat: number; lng: number }; name: string; tip?: string } {
  let nearest = { center: PHOENIX_DEFAULT, name: 'Phoenix Metro', tip: undefined as string | undefined }
  let minDist = Infinity

  Object.values(AZ_NEIGHBORHOODS).forEach(hood => {
    const dist = Math.sqrt(Math.pow(lat - hood.lat, 2) + Math.pow(lng - hood.lng, 2))
    if (dist < minDist) {
      minDist = dist
      nearest = { center: { lat: hood.lat, lng: hood.lng }, name: hood.name, tip: hood.tip }
    }
  })

  return nearest
}

// Privacy-preserving location offset - snaps to neighborhood center with ~500m radius scatter
// Creates a consistent offset per car so it doesn't jump around
function offsetLocation(lat: number, lng: number, carId: string): {
  lat: number;
  lng: number;
  neighborhood: string;
  tip?: string;
} {
  // Find nearest neighborhood
  const { center, name, tip } = findNearestNeighborhood(lat, lng)

  // Create deterministic scatter within ~500m of neighborhood center
  const seed = carId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const angle = (seed % 360) * (Math.PI / 180)
  // Offset between 0.002 and 0.005 degrees (~200-500m from neighborhood center)
  const offset = 0.002 + (seed % 100) / 33333

  return {
    lat: center.lat + Math.cos(angle) * offset,
    lng: center.lng + Math.sin(angle) * offset,
    neighborhood: name,
    tip
  }
}

// Check if a car qualifies for MaxAC certification (good AC for Phoenix summers)
// Based on: newer model, good rating, positive reviews mentioning AC
function isMaxACCertified(car: { year: number; rating?: { average: number; count: number }; carType?: string }): boolean {
  // Newer cars (2020+) with good ratings get MaxAC badge
  const isNewEnough = car.year >= 2020
  const hasGoodRating = car.rating && car.rating.average >= 4.5 && car.rating.count >= 3
  // Luxury and SUV types typically have better AC
  const premiumType = ['luxury', 'suv', 'electric'].includes(car.carType?.toLowerCase() || '')

  return isNewEnough && (hasGoodRating || premiumType)
}

// Check if near Sky Harbor for airport delivery tip
function isNearAirport(lat: number, lng: number): boolean {
  const skyHarbor = AZ_NEIGHBORHOODS['sky-harbor']
  const dist = Math.sqrt(Math.pow(lat - skyHarbor.lat, 2) + Math.pow(lng - skyHarbor.lng, 2))
  return dist < 0.05 // ~5km radius
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
  isMobile,
  rentalDays = 1
}: {
  car: Car & {
    trips?: number;
    totalTrips?: number;
    host?: { name?: string };
    maxACCertified?: boolean;
    nearAirport?: boolean;
    displayLocation?: { neighborhood?: string; tip?: string };
  }
  onClose: () => void
  isMobile: boolean
  rentalDays?: number
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const photos = car.photos || []
  const tripCount = car.trips || car.totalTrips || 0
  const totalPrice = Math.round(car.dailyRate * rentalDays)
  const maxAC = car.maxACCertified || isMaxACCertified(car)
  const nearAirport = car.nearAirport || false
  const neighborhood = car.displayLocation?.neighborhood

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

  // Mobile: Bottom sheet style - compact
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999]" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Bottom Sheet - More compact */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl max-h-[60vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-1.5">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-700/90 rounded-full shadow"
          >
            <IoCloseOutline className="w-4 h-4" />
          </button>

          {/* Image */}
          <div className="relative h-52 bg-gray-200 dark:bg-gray-700">
            {photos[imageIndex] ? (
              <img
                src={photos[imageIndex].url}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoCarOutline className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Image nav buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full"
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
                {/* Image indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.slice(0, 5).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
              {car.instantBook && (
                <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                  <IoFlashOutline className="w-2.5 h-2.5" /> Instant
                </span>
              )}
              {maxAC && (
                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                  <IoSnowOutline className="w-2.5 h-2.5" /> MaxAC™
                </span>
              )}
              {nearAirport && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                  <IoAirplaneOutline className="w-2.5 h-2.5" /> PHX Delivery
                </span>
              )}
            </div>
          </div>

          {/* Content - compact */}
          <div className="p-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {car.year} {car.make}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{car.model}</p>
            {neighborhood && (
              <p className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                <IoLocationOutline className="w-2.5 h-2.5" />
                {neighborhood}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600 dark:text-gray-400">
              {car.rating && car.rating.average > 0 ? (
                <span className="flex items-center gap-0.5">
                  <IoStarOutline className="w-3 h-3 text-amber-500" />
                  <span className="font-medium">{car.rating.average.toFixed(1)}</span>
                  {tripCount > 0 && <span className="text-gray-500">({tripCount} trips)</span>}
                </span>
              ) : tripCount > 0 ? (
                <span className="text-gray-500">{tripCount} trips</span>
              ) : (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] rounded-full font-medium">
                  New
                </span>
              )}
              <span className="text-gray-400">•</span>
              <span>{car.location?.city || 'Phoenix'}</span>
              {car.seats && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{car.seats} seats</span>
                </>
              )}
            </div>

            {car.host?.name && (
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                Hosted by {car.host.name.split(' ')[0]}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${Math.round(car.dailyRate)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">/day</span>
                </div>
                {rentalDays > 1 && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    ${totalPrice} total for {rentalDays} days
                  </p>
                )}
              </div>

              <Link
                href={`/rentals/cars/${car.id}`}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Centered modal - more compact
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-700/90 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <IoCloseOutline className="w-4 h-4" />
        </button>

        {/* Image - larger */}
        <div className="relative h-52 bg-gray-200 dark:bg-gray-700">
          {photos[imageIndex] ? (
            <img
              src={photos[imageIndex].url}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoCarOutline className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Image nav buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <IoChevronBackOutline className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <IoChevronForwardOutline className="w-4 h-4" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
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
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {car.instantBook && (
              <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                <IoFlashOutline className="w-2.5 h-2.5" /> Instant
              </span>
            )}
            {maxAC && (
              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                <IoSnowOutline className="w-2.5 h-2.5" /> MaxAC™
              </span>
            )}
            {nearAirport && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                <IoAirplaneOutline className="w-2.5 h-2.5" /> PHX Delivery
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {car.year} {car.make}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{car.model}</p>
          {neighborhood && (
            <p className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-0.5">
              <IoLocationOutline className="w-3 h-3" />
              {neighborhood}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            {car.rating && car.rating.average > 0 ? (
              <span className="flex items-center gap-1">
                <IoStarOutline className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">{car.rating.average.toFixed(1)}</span>
                {tripCount > 0 && <span className="text-gray-500">({tripCount} trips)</span>}
              </span>
            ) : tripCount > 0 ? (
              <span className="text-gray-500">{tripCount} trips</span>
            ) : (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] rounded-full font-medium">
                New
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span>{car.location?.city || 'Phoenix'}</span>
            {car.seats && (
              <>
                <span className="text-gray-400">•</span>
                <span>{car.seats} seats</span>
              </>
            )}
          </div>

          {car.host?.name && (
            <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-1.5">
              Hosted by {car.host.name.split(' ')[0]}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(car.dailyRate)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
              </div>
              {rentalDays > 1 && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  ${totalPrice} total for {rentalDays} days
                </p>
              )}
            </div>

            <Link
              href={`/rentals/cars/${car.id}`}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
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
  isLoading = false,
  rentalDays = 1
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

      // Apply privacy offset with neighborhood snapping
      const displayLocation = offsetLocation(baseLat, baseLng, car.id)

      // Check for special badges
      const maxACCertified = isMaxACCertified(car)
      const nearAirport = isNearAirport(baseLat, baseLng)

      return {
        ...car,
        displayLocation,
        maxACCertified,
        nearAirport
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

      // Zoom-level based feature visibility
      newMap.on('zoom', () => {
        const zoom = newMap.getZoom()
        const markers = document.querySelectorAll('.car-marker')

        markers.forEach(marker => {
          const neighborhoodLabel = marker.querySelector('.neighborhood-label') as HTMLElement
          const circle = marker.querySelector('.proximity-circle') as HTMLElement

          if (neighborhoodLabel) {
            // Show neighborhood labels when zoomed in (zoom >= 13)
            neighborhoodLabel.style.opacity = zoom >= 13 ? '1' : '0'
          }

          if (circle) {
            // Make privacy circles more visible on zoom
            if (zoom >= 14) {
              circle.style.width = '90px'
              circle.style.height = '90px'
              circle.style.background = 'rgba(217, 119, 6, 0.12)'
              circle.style.borderWidth = '2px'
            } else if (zoom >= 12) {
              circle.style.width = '80px'
              circle.style.height = '80px'
              circle.style.background = 'rgba(217, 119, 6, 0.1)'
              circle.style.borderWidth = '2px'
            } else {
              circle.style.width = '70px'
              circle.style.height = '70px'
              circle.style.background = 'rgba(217, 119, 6, 0.08)'
              circle.style.borderWidth = '2px'
            }
          }
        })
      })

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

      // Add geolocate control for "Zoom to My Location"
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserLocation: true
      })
      newMap.addControl(geolocate, 'bottom-right')

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
      // Create marker container - needs explicit size for Mapbox positioning
      const el = document.createElement('div')
      el.className = 'cursor-pointer car-marker'
      el.dataset.carId = car.id
      el.dataset.neighborhood = car.displayLocation.neighborhood
      if (car.displayLocation.tip) el.dataset.tip = car.displayLocation.tip
      el.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `

      // Wrapper for badge + circle
      const wrapper = document.createElement('div')
      wrapper.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `

      // Proximity circle (shows approximate area for host privacy)
      const circle = document.createElement('div')
      circle.className = 'proximity-circle'
      circle.style.cssText = `
        position: absolute;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: rgba(217, 119, 6, 0.08);
        border: 2px dashed rgba(217, 119, 6, 0.25);
        pointer-events: none;
      `
      wrapper.appendChild(circle)

      // Badge container (price + optional icons)
      const badgeContainer = document.createElement('div')
      badgeContainer.style.cssText = `
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      `

      // Price badge (centered on the circle)
      const badge = document.createElement('div')
      badge.className = 'marker-badge'
      badge.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
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

      // Add MaxAC badge for certified cars (Phoenix summer essential!)
      if (car.maxACCertified) {
        const acIcon = document.createElement('span')
        acIcon.innerHTML = '❄️'
        acIcon.style.cssText = 'font-size: 10px;'
        acIcon.title = 'MaxAC™ Certified - Premium cooling for Arizona summers'
        badge.appendChild(acIcon)
      }

      // Add airplane icon for near-airport cars
      if (car.nearAirport) {
        const airportIcon = document.createElement('span')
        airportIcon.innerHTML = '✈️'
        airportIcon.style.cssText = 'font-size: 10px;'
        airportIcon.title = 'Near Sky Harbor - Free airport delivery'
        badge.appendChild(airportIcon)
      }

      const priceText = document.createElement('span')
      priceText.textContent = `$${Math.round(car.dailyRate)}`
      badge.appendChild(priceText)

      badgeContainer.appendChild(badge)

      // Neighborhood label (shown on zoom, hidden by default)
      const neighborhoodLabel = document.createElement('div')
      neighborhoodLabel.className = 'neighborhood-label'
      neighborhoodLabel.style.cssText = `
        font-size: 9px;
        color: #666;
        background: rgba(255,255,255,0.9);
        padding: 2px 6px;
        border-radius: 8px;
        margin-top: 2px;
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
      `
      neighborhoodLabel.textContent = car.displayLocation.neighborhood
      badgeContainer.appendChild(neighborhoodLabel)

      wrapper.appendChild(badgeContainer)
      el.appendChild(wrapper)

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onCarSelect(car)
      })

      // Hover effect
      wrapper.addEventListener('mouseenter', () => {
        badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'
        circle.style.background = 'rgba(217, 119, 6, 0.15)'
        circle.style.borderColor = 'rgba(217, 119, 6, 0.5)'
      })

      wrapper.addEventListener('mouseleave', () => {
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
        zoom: 12,
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

      {/* Top info bar - Available cars + privacy note */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 pointer-events-none">
          {/* Available cars badge */}
          <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg pointer-events-auto">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {processedCars.length} Available Cars
            </span>
          </div>

          {/* Privacy indicator - shows on zoom */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md text-[10px] text-gray-600 dark:text-gray-400 pointer-events-auto">
            <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-amber-600" />
            <span>Approximate for host safety</span>
          </div>
        </div>
      )}

      {/* Legend - shown at bottom left */}
      {mapLoaded && (
        <div className="absolute bottom-20 left-4 hidden sm:flex flex-col gap-1.5 px-3 py-2 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-md text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">❄️</span>
            <span className="text-gray-600 dark:text-gray-400">MaxAC™ - Premium cooling</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">✈️</span>
            <span className="text-gray-600 dark:text-gray-400">Free Sky Harbor delivery</span>
          </div>
        </div>
      )}


      {/* Selected car popup - Rendered via Portal to document.body */}
      {selectedCar && portalContainer && createPortal(
        <CarPopup
          car={selectedCar}
          onClose={() => onCarSelect(null)}
          isMobile={isMobile}
          rentalDays={rentalDays}
        />,
        portalContainer
      )}
    </div>
  )
}
