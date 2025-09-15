// app/(guest)/rentals/search/components/CarMapView.tsx
'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  IoCarOutline, 
  IoLocationOutline, 
  IoStarOutline,
  IoFlashOutline,
  IoCloseOutline,
  IoExpandOutline,
  IoContractOutline,
  IoNavigateOutline,
  IoCarSportOutline,
  IoLayersOutline,
  IoSpeedometerOutline,
  IoWalkOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

// Initialize Mapbox token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

// Types
interface Car {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  location: {
    lat: number
    lng: number
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  photos?: Array<{ url: string; isHero?: boolean }>
  rating?: {
    average: number
    count: number
  }
  instantBook?: boolean
  features?: string[]
  seats?: number
  transmission?: string
  fuelType?: string
  mpgCity?: number
  mpgHighway?: number
  host?: {
    id: string
    name: string
    responseTime?: string
    responseRate?: number
    profileImage?: string
    isSuperHost?: boolean
  }
  carType?: string
  mileage?: number
  deliveryAvailable?: boolean
  minimumRentalDays?: number
  distance?: number | null
  distanceFromUser?: number
}

interface MapViewProps {
  cars: Car[]
  selectedCar: Car | null
  onCarSelect: (car: Car | null) => void
  userLocation?: { lat: number; lng: number } | null
  searchLocation: { lat: number; lng: number }
  filters?: any
  isLoading?: boolean
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void
  onZoomChange?: (zoom: number) => void
}

// Map styles configuration
const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
  dark: 'mapbox://styles/mapbox/dark-v10'
}

// Helper functions
const getMarkerColor = (car: Car): string => {
  if (car.carType === 'luxury' || car.carType === 'exotic') return '#9333ea'
  if (car.instantBook) return '#10b981'
  if (car.fuelType === 'ELECTRIC') return '#3b82f6'
  return '#f59e0b'
}

// Privacy-safe distance formatting
const formatDistance = (distance: number | null | undefined): string => {
  if (distance === null || distance === undefined) return ''
  if (distance < 0.5) return 'Less than 1 mile'
  if (distance < 1) return '1 mile'
  if (distance < 2) return `${distance.toFixed(1)} mi`
  return `${Math.round(distance)} mi`
}

// Fixed Mobile Car Detail Card
function CarDetailCard({ 
  car, 
  onClose,
  onViewDetails,
  userLocation,
  isMobile 
}: { 
  car: Car
  onClose: () => void
  onViewDetails: (carId: string) => void
  userLocation?: { lat: number; lng: number } | null
  isMobile: boolean
}) {
  const [imageIndex, setImageIndex] = useState(0)
  
  // Use the distance from the car object, don't recalculate
  const distance = car.distance

  const nextImage = () => {
    if (car.photos && car.photos.length > 1) {
      setImageIndex((prev) => (prev + 1) % car.photos.length)
    }
  }

  const prevImage = () => {
    if (car.photos && car.photos.length > 1) {
      setImageIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length)
    }
  }

  // Mobile layout - Compact square floating card
  if (isMobile) {
    return (
      <>
        {/* Backdrop for tap-to-close */}
        <div 
          className="fixed inset-0 z-[59]" 
          onClick={onClose}
        />
        
        {/* Floating square card - compact size */}
        <div className="fixed left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[60]" 
             style={{ 
               bottom: '20px',
               maxWidth: '320px',
               margin: '0 auto',
               left: '16px',
               right: '16px'
             }}>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
          
          {/* Photo section - smaller square */}
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
            {car.photos && car.photos[imageIndex] ? (
              <>
                <img
                  src={car.photos[imageIndex].url}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows for multiple photos */}
                {car.photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white"
                    >
                      <IoChevronBackOutline className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white"
                    >
                      <IoChevronForwardOutline className="w-4 h-4" />
                    </button>
                    
                    {/* Photo dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {car.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx === imageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoCarOutline className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            {car.instantBook && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" />
                Instant
              </span>
            )}
          </div>
          
          {/* Details section - compact */}
          <div className="p-3">
            {/* Title and price row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {car.year} {car.make} {car.model}
                </h3>
                {car.rating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <IoStarOutline className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-xs">{car.rating.average.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({car.rating.count})</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(car.dailyRate)}
                </div>
                <div className="text-xs text-gray-500">/day</div>
              </div>
            </div>
            
            {/* Location and specs */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
              <span>{car.seats || 5} seats</span>
              <span>•</span>
              <span>{car.transmission || 'Auto'}</span>
              {distance !== null && distance !== undefined && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {formatDistance(distance)}
                  </span>
                </>
              )}
            </div>
            
            {/* Action button */}
            <button
              onClick={() => onViewDetails(car.id)}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </>
    )
  }

  // Desktop layout remains the same
  return (
    <div className="absolute bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700"
        >
          <IoCloseOutline className="w-5 h-5" />
        </button>
        
        <div className="relative h-56 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden group">
          {car.photos && car.photos[imageIndex] ? (
            <>
              <img
                src={car.photos[imageIndex].url}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
              {car.photos.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoChevronBackOutline className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoChevronForwardOutline className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoCarOutline className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            {car.instantBook && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" />
                Instant
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {car.year} {car.make} {car.model}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{car.location.address || `${car.location.city || 'Phoenix'}, ${car.location.state || 'AZ'}`}</span>
              </div>
              {distance !== null && distance !== undefined && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mt-1">
                  <IoWalkOutline className="w-4 h-4" />
                  <span>{formatDistance(distance)}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${Math.round(car.dailyRate)}
              </div>
              <div className="text-xs text-gray-500">/day</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {car.rating && (
              <div className="flex items-center gap-1">
                <IoStarOutline className="w-4 h-4 text-amber-500 fill-current" />
                <span>{car.rating.average.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <IoCarOutline className="w-4 h-4" />
              <span>{car.seats || 5} seats</span>
            </div>
            <div className="flex items-center gap-1">
              <IoSpeedometerOutline className="w-4 h-4" />
              <span>{car.transmission || 'Auto'}</span>
            </div>
          </div>
          
          <button
            onClick={() => onViewDetails(car.id)}
            className="w-full px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Fixed Mobile Map Controls
function MapControls({ 
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleFullscreen,
  onChangeStyle,
  isFullscreen,
  currentStyle,
  isMobile
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onRecenter: () => void
  onToggleFullscreen: () => void
  onChangeStyle: (style: string) => void
  isFullscreen: boolean
  currentStyle: string
  isMobile: boolean
}) {
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  if (isMobile) {
    return (
      <>
        {/* Recenter button - top right for mobile */}
        <button
          onClick={onRecenter}
          className="absolute top-4 right-4 p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg z-40"
        >
          <IoNavigateOutline className="w-4 h-4" />
        </button>
        
        {/* Style switcher - top left for mobile */}
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg"
          >
            <IoLayersOutline className="w-4 h-4" />
          </button>
          
          {showStyleMenu && (
            <div className="absolute left-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
              <button
                onClick={() => {
                  onChangeStyle('streets')
                  setShowStyleMenu(false)
                }}
                className={`block w-full text-left px-3 py-1.5 text-xs rounded ${
                  currentStyle === 'streets' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                Map
              </button>
              <button
                onClick={() => {
                  onChangeStyle('satellite')
                  setShowStyleMenu(false)
                }}
                className={`block w-full text-left px-3 py-1.5 text-xs rounded ${
                  currentStyle === 'satellite' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                Satellite
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  // Desktop controls
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
      <button
        onClick={onToggleFullscreen}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {isFullscreen ? (
          <IoContractOutline className="w-5 h-5" />
        ) : (
          <IoExpandOutline className="w-5 h-5" />
        )}
      </button>
      
      <div className="relative">
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <IoLayersOutline className="w-5 h-5" />
        </button>
        {showStyleMenu && (
          <div className="absolute right-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <button
              onClick={() => {
                onChangeStyle('streets')
                setShowStyleMenu(false)
              }}
              className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentStyle === 'streets' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              Map
            </button>
            <button
              onClick={() => {
                onChangeStyle('satellite')
                setShowStyleMenu(false)
              }}
              className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentStyle === 'satellite' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => {
                onChangeStyle('dark')
                setShowStyleMenu(false)
              }}
              className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentStyle === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              Dark
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={onRecenter}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <IoNavigateOutline className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-700"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
        >
          −
        </button>
      </div>
    </div>
  )
}

// Simple legend for mobile
function MapLegend({ carCount, isMobile }: { carCount: number; isMobile: boolean }) {
  if (isMobile) {
    return null // No legend on mobile to save space
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-30">
      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
        {carCount} Available Cars
      </h4>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">$</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <IoFlashOutline className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Instant Book</span>
        </div>
      </div>
    </div>
  )
}

// Main Map Component - Fixed
export default function CarMapView({
  cars,
  selectedCar,
  onCarSelect,
  userLocation,
  searchLocation,
  filters,
  isLoading = false,
  onBoundsChange,
  onZoomChange
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentStyle, setCurrentStyle] = useState('streets')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Use distance that's already calculated - don't recalculate
  const carsWithDistance = useMemo(() => {
    return cars.map(car => ({
      ...car,
      distance: car.distance // Use existing distance, don't recalculate
    })).sort((a, b) => {
      if (a.distance === null || a.distance === undefined) return 1
      if (b.distance === null || b.distance === undefined) return -1
      return a.distance - b.distance
    })
  }, [cars])
  
  // Initialize map - FIXED
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    // Initialize immediately, no timeout
    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[currentStyle],
        center: [searchLocation.lng, searchLocation.lat],
        zoom: isMobile ? 11 : 12,
        pitch: 0,
        bearing: 0,
        interactive: true,
        trackResize: true,
        maxZoom: 18,
        minZoom: 9,
        attributionControl: false
      })
      
      map.current = newMap
      
      // Add controls after map is created
      if (!isMobile) {
        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left')
      }
      
      newMap.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'imperial' }), 
        'bottom-right'
      )
      
      // Map loaded event
      newMap.on('load', () => {
        setMapLoaded(true)
        
        // Add search location marker (red pin)
        const searchEl = document.createElement('div')
        searchEl.style.width = '20px'
        searchEl.style.height = '20px'
        searchEl.style.backgroundColor = '#dc2626'
        searchEl.style.border = '3px solid white'
        searchEl.style.borderRadius = '50%'
        searchEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        
        new mapboxgl.Marker({ element: searchEl, anchor: 'center' })
          .setLngLat([searchLocation.lng, searchLocation.lat])
          .addTo(newMap)
        
        // Add user location marker if available (blue pin)
        if (userLocation) {
          const userEl = document.createElement('div')
          userEl.style.width = '16px'
          userEl.style.height = '16px'
          userEl.style.backgroundColor = '#3b82f6'
          userEl.style.border = '3px solid white'
          userEl.style.borderRadius = '50%'
          userEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
          
          new mapboxgl.Marker({ element: userEl, anchor: 'center' })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(newMap)
        }
      })
      
      // Handle zoom changes
      newMap.on('zoom', () => {
        onZoomChange?.(newMap.getZoom())
      })
      
      // Handle bounds changes
      newMap.on('moveend', () => {
        onBoundsChange?.(newMap.getBounds())
      })
      
    } catch (error) {
      console.error('Error initializing map:', error)
    }
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
    }
  }, []) // Only run once on mount
  
  // Update map style
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(MAP_STYLES[currentStyle as keyof typeof MAP_STYLES])
    }
  }, [currentStyle, mapLoaded])
  
  // Add car markers - FIXED to only show price
  useEffect(() => {
    if (!map.current || !mapLoaded || !cars.length) return
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current.clear()
    
    // Add new markers for each car
    carsWithDistance.forEach(car => {
      if (!car.location?.lat || !car.location?.lng) return
      
      const el = document.createElement('div')
      const color = getMarkerColor(car)
      const isSelected = selectedCar?.id === car.id
      const size = isMobile ? 36 : 40
      const selectedSize = isMobile ? 42 : 48
      
      // ALWAYS show price only in green circles
      const displayText = `$${Math.round(car.dailyRate)}`
      
      // FIXED: Removed all problematic styles
      el.style.width = `${isSelected ? selectedSize : size}px`
      el.style.height = `${isSelected ? selectedSize : size}px`
      el.style.backgroundColor = car.instantBook || car.carType === 'luxury' ? color : 'white'
      el.style.border = `2px solid ${isSelected ? 'white' : color}`
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = isMobile ? '9px' : '10px'
      el.style.fontWeight = 'bold'
      el.style.color = car.instantBook || car.carType === 'luxury' ? 'white' : '#1f2937'
      el.style.boxShadow = isSelected ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)'
      el.style.zIndex = isSelected ? '1000' : '1'
      // REMOVED: transition, transform, position:relative - these cause drift
      
      el.textContent = displayText
      
      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onCarSelect(car)
      })
      
      // Create and add marker with proper anchoring
      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat([car.location.lng, car.location.lat])
        .addTo(map.current!)
      
      markers.current.set(car.id, marker)
    })
  }, [carsWithDistance, mapLoaded, selectedCar, isMobile, onCarSelect])
  
  // Fly to selected car
  useEffect(() => {
    if (selectedCar && map.current && selectedCar.location?.lng && selectedCar.location?.lat) {
      map.current.flyTo({
        center: [selectedCar.location.lng, selectedCar.location.lat],
        zoom: isMobile ? 14 : 15,
        duration: 1000
      })
    }
  }, [selectedCar, isMobile])
  
  // Control handlers
  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleRecenter = () => {
    map.current?.flyTo({
      center: [searchLocation.lng, searchLocation.lat],
      zoom: isMobile ? 11 : 12,
      duration: 1000
    })
  }
  
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      map.current?.resize()
    }, 100)
  }
  
  const handleViewDetails = (carId: string) => {
    window.location.href = `/rentals/${carId}`
  }
  
  const handleChangeStyle = (style: string) => {
    setCurrentStyle(style)
  }
  
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-100`}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onToggleFullscreen={handleToggleFullscreen}
        onChangeStyle={handleChangeStyle}
        isFullscreen={isFullscreen}
        currentStyle={currentStyle}
        isMobile={isMobile}
      />
      
      {/* Legend - desktop only */}
      {!selectedCar && !isMobile && (
        <MapLegend carCount={cars.length} isMobile={isMobile} />
      )}
      
      {/* Selected car detail card */}
      {selectedCar && (
        <CarDetailCard
          car={selectedCar}
          onClose={() => onCarSelect(null)}
          onViewDetails={handleViewDetails}
          userLocation={userLocation}
          isMobile={isMobile}
        />
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-gray-900/75 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
          </div>
        </div>
      )}
      
      {/* Global styles */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .mapboxgl-ctrl-group {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .mapboxgl-ctrl-group button {
          width: 36px;
          height: 36px;
        }
        
        @media (max-width: 768px) {
          .mapboxgl-ctrl-attrib {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}