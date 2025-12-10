// app/(guest)/rentals/search/components/CarMapView.tsx
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  IoCarOutline, 
  IoStarOutline,
  IoFlashOutline,
  IoCloseOutline,
  IoExpandOutline,
  IoContractOutline,
  IoNavigateOutline,
  IoLayersOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import { calculateDistance, formatDistance, safeCalculateDistance } from '../utils/mapHelpers'

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

interface CarWithDisplay extends Car {
  displayLocation: { lat: number; lng: number }
  calculatedDistance: number | null
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
} as const

type MapStyleKey = keyof typeof MAP_STYLES

// Location obfuscation helper with better randomization
const obfuscateLocation = (lat: number, lng: number, zoom: number, carId: string): { lat: number; lng: number } => {
  // Base offset radius in meters (200-500m depending on zoom)
  const baseRadius = Math.max(200, Math.min(500, (18 - zoom) * 50))
  const radiusInDegrees = baseRadius / 111000 // Rough conversion to degrees
  
  // Generate consistent but randomized offset based on location AND carId for uniqueness
  const seed = Math.abs(Math.sin((lat * lng * 12.9898) + (parseInt(carId.replace(/\D/g, '') || '1') * 0.1)) * 43758.5453)
  const angle = (seed % 1) * 2 * Math.PI
  const distance = Math.sqrt(seed % 1) * radiusInDegrees
  
  return {
    lat: lat + Math.cos(angle) * distance,
    lng: lng + Math.sin(angle) * distance
  }
}

// Helper functions
const getMarkerColor = (car: Car): string => {
  if (car.carType === 'luxury' || car.carType === 'exotic') return '#9333ea'
  if (car.instantBook) return '#10b981'
  if (car.fuelType === 'ELECTRIC') return '#3b82f6'
  return '#f59e0b'
}

// Car Detail Modal Component
function CarDetailModal({ 
  car, 
  onClose,
  onViewDetails,
  isMobile 
}: { 
  car: Car
  onClose: () => void
  onViewDetails: (carId: string) => void
  isMobile: boolean
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  const nextImage = useCallback(() => {
    if (car.photos && car.photos.length > 1) {
      setImageIndex((prev) => (prev + 1) % car.photos.length)
    }
  }, [car.photos])

  const prevImage = useCallback(() => {
    if (car.photos && car.photos.length > 1) {
      setImageIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length)
    }
  }, [car.photos])

  // Focus management and keyboard navigation
  useEffect(() => {
    const modal = modalRef.current
    if (modal) {
      modal.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowLeft':
          if (car.photos && car.photos.length > 1) {
            e.preventDefault()
            prevImage()
          }
          break
        case 'ArrowRight':
          if (car.photos && car.photos.length > 1) {
            e.preventDefault()
            nextImage()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [car.photos, onClose, prevImage, nextImage])

  // Enhanced event handlers for mobile
  const handleCloseClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }, [onClose])

  const handleViewDetailsClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onViewDetails(car.id)
  }, [onViewDetails, car.id])

  const handleImageNavigation = useCallback((direction: 'prev' | 'next') => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (direction === 'prev') {
        prevImage()
      } else {
        nextImage()
      }
    }
  }, [prevImage, nextImage])

  // Mobile Modal - Centered
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-modal-title"
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {/* Backdrop - Enhanced for mobile */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          style={{ 
            touchAction: 'none',
            WebkitTouchCallout: 'none'
          }}
          onTouchStart={handleCloseClick}
          onTouchEnd={(e) => e.preventDefault()}
          onClick={handleCloseClick}
        />
        
        {/* Modal Content - Enhanced touch handling */}
        <div 
          ref={modalRef}
          className="relative w-full max-w-xs bg-white dark:bg-gray-800 shadow-2xl transform transition-all duration-300 ease-out focus:outline-none"
          style={{ 
            borderRadius: '8px',
            touchAction: 'auto',
            WebkitUserSelect: 'auto',
            userSelect: 'auto',
            zIndex: 10000
          }}
          tabIndex={-1}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - Small size */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onTouchEnd={handleCloseClick}
            onClick={handleCloseClick}
            className="absolute top-2 right-2 z-[10001] p-2 bg-white/95 dark:bg-gray-700/95 shadow-xl backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors active:scale-95"
            style={{ 
              borderRadius: '6px',
              minWidth: '32px',
              minHeight: '32px',
              touchAction: 'manipulation'
            }}
            aria-label="Close modal"
          >
            <IoCloseOutline className="w-4 h-4" />
          </button>
          
          {/* Photo section */}
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden" style={{ borderRadius: '8px 8px 0 0' }}>
            {car.photos && car.photos[imageIndex] ? (
              <>
                <img
                  src={car.photos[imageIndex].url}
                  alt={`${car.make} ${car.model} - Image ${imageIndex + 1} of ${car.photos.length}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                  style={{
                    WebkitUserDrag: 'none',
                    WebkitTouchCallout: 'none',
                    userSelect: 'none'
                  }}
                />
                
                {/* Navigation arrows - Small size and NO DOTS */}
                {car.photos.length > 1 && (
                  <>
                    <button
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={handleImageNavigation('prev')}
                      onClick={handleImageNavigation('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white backdrop-blur-sm hover:bg-black/85 transition-colors active:scale-95"
                      style={{ 
                        borderRadius: '6px',
                        minWidth: '32px',
                        minHeight: '32px',
                        touchAction: 'manipulation'
                      }}
                      aria-label="Previous image"
                    >
                      <IoChevronBackOutline className="w-4 h-4" />
                    </button>
                    <button
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={handleImageNavigation('next')}
                      onClick={handleImageNavigation('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white backdrop-blur-sm hover:bg-black/85 transition-colors active:scale-95"
                      style={{ 
                        borderRadius: '6px',
                        minWidth: '32px',
                        minHeight: '32px',
                        touchAction: 'manipulation'
                      }}
                      aria-label="Next image"
                    >
                      <IoChevronForwardOutline className="w-4 h-4" />
                    </button>
                    
                    {/* Photo indicators REMOVED - No dots */}
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoCarOutline className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges - Only visible element besides buttons */}
            <div className="absolute top-3 left-3 flex gap-2">
              {car.instantBook && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold flex items-center gap-1 shadow-lg" style={{ borderRadius: '8px' }}>
                  <IoFlashOutline className="w-3 h-3" />
                  Instant
                </span>
              )}
            </div>
          </div>
          
          {/* Details section */}
          <div className="p-4">
            {/* Title and price */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h3 
                  id="car-modal-title"
                  className="text-lg font-bold text-gray-900 dark:text-white truncate"
                >
                  {car.year} {car.make} {car.model}
                </h3>
                
                {/* Rating and seats */}
                {car.rating && (
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <IoStarOutline className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
                    <span className="font-medium">{car.rating.average.toFixed(1)}</span>
                    <span className="text-gray-500">({car.rating.count})</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{car.seats || 5} seats</span>
                  </div>
                )}
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(car.dailyRate)}
                </div>
                <div className="text-xs text-gray-500">/day</div>
              </div>
            </div>
            
            {/* Action button - Enhanced for mobile */}
            <button
              onTouchStart={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              onTouchEnd={handleViewDetailsClick}
              onClick={handleViewDetailsClick}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-300 text-white font-semibold transition-colors shadow-lg active:scale-95"
              style={{ 
                borderRadius: '8px',
                minHeight: '48px',
                touchAction: 'manipulation'
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Modal - Centered, Medium Size
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="car-modal-title"
    >
      {/* Backdrop - prevent click issues */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onTouchStart={(e) => e.stopPropagation()}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-hidden focus:outline-none"
        style={{ borderRadius: '8px' }}
        tabIndex={-1}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onTouchStart={(e) => e.stopPropagation()}
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-700/90 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500"
          style={{ borderRadius: '8px' }}
          aria-label="Close modal"
        >
          <IoCloseOutline className="w-4 h-4" />
        </button>
        
        {/* Photo section */}
        <div className="relative h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden group">
          {car.photos && car.photos[imageIndex] ? (
            <>
              <img
                src={car.photos[imageIndex].url}
                alt={`${car.make} ${car.model} - Image ${imageIndex + 1} of ${car.photos.length}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {car.photos.length > 1 && (
                <>
                  <button
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm hover:bg-black/70 focus:ring-2 focus:ring-white"
                    style={{ borderRadius: '8px' }}
                    aria-label="Previous image"
                  >
                    <IoChevronBackOutline className="w-4 h-4" />
                  </button>
                  <button
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm hover:bg-black/70 focus:ring-2 focus:ring-white"
                    style={{ borderRadius: '8px' }}
                    aria-label="Next image"
                  >
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoCarOutline className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {car.instantBook && (
              <span className="px-2.5 py-1.5 bg-green-600 text-white text-xs font-semibold flex items-center gap-1 shadow-lg" style={{ borderRadius: '8px' }}>
                <IoFlashOutline className="w-3 h-3" />
                Instant
              </span>
            )}
          </div>
        </div>
        
        {/* Details section */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-4">
              <h3 
                id="car-modal-title"
                className="text-xl font-bold text-gray-900 dark:text-white truncate"
              >
                {car.year} {car.make} {car.model}
              </h3>
              
              {/* Rating and seats */}
              {car.rating && (
                <div className="flex items-center gap-1 mt-1.5">
                  <IoStarOutline className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">{car.rating.average.toFixed(1)}</span>
                  <span className="text-gray-500">({car.rating.count})</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-gray-600 dark:text-gray-400">{car.seats || 5} seats</span>
                </div>
              )}
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${Math.round(car.dailyRate)}
              </div>
              <div className="text-sm text-gray-500">/day</div>
            </div>
          </div>
          
          {/* Action button */}
          <button
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => onViewDetails(car.id)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-300 text-white font-semibold transition-colors shadow-lg"
            style={{ borderRadius: '8px' }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Map Controls Component
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
  onChangeStyle: (style: MapStyleKey) => void
  isFullscreen: boolean
  currentStyle: MapStyleKey
  isMobile: boolean
}) {
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const styleMenuRef = useRef<HTMLDivElement>(null)

  // Close style menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(event.target as Node)) {
        setShowStyleMenu(false)
      }
    }

    if (showStyleMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStyleMenu])

  // Handle escape key for style menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showStyleMenu) {
        setShowStyleMenu(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showStyleMenu])

  if (isMobile) {
    return (
      <>
        {/* Recenter button */}
        <button
          onClick={onRecenter}
          className="absolute top-4 right-4 p-3 bg-white dark:bg-gray-800 shadow-lg z-40 hover:shadow-xl transition-shadow focus:ring-2 focus:ring-blue-500"
          style={{ borderRadius: '8px' }}
          aria-label="Recenter map"
        >
          <IoNavigateOutline className="w-5 h-5" />
        </button>
        
        {/* Style switcher */}
        <div className="absolute top-4 left-4 z-40" ref={styleMenuRef}>
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="p-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow focus:ring-2 focus:ring-blue-500"
            style={{ borderRadius: '8px' }}
            aria-label="Change map style"
            aria-expanded={showStyleMenu}
          >
            <IoLayersOutline className="w-5 h-5" />
          </button>
          
          {showStyleMenu && (
            <div className="absolute left-0 top-16 bg-white dark:bg-gray-800 shadow-xl p-2 min-w-[120px]" style={{ borderRadius: '8px' }}>
              <button
                onClick={() => {
                  onChangeStyle('streets')
                  setShowStyleMenu(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  currentStyle === 'streets' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ borderRadius: '8px' }}
              >
                Map
              </button>
              <button
                onClick={() => {
                  onChangeStyle('satellite')
                  setShowStyleMenu(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  currentStyle === 'satellite' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ borderRadius: '8px' }}
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
    <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
      <button
        onClick={onToggleFullscreen}
        className="p-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500"
        style={{ borderRadius: '8px' }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <IoContractOutline className="w-5 h-5" />
        ) : (
          <IoExpandOutline className="w-5 h-5" />
        )}
      </button>
      
      <div className="relative" ref={styleMenuRef}>
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="p-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500"
          style={{ borderRadius: '8px' }}
          aria-label="Change map style"
          aria-expanded={showStyleMenu}
        >
          <IoLayersOutline className="w-5 h-5" />
        </button>
        {showStyleMenu && (
          <div className="absolute right-16 top-0 bg-white dark:bg-gray-800 shadow-xl p-2 min-w-[140px]" style={{ borderRadius: '8px' }}>
            {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((style) => (
              <button
                key={style}
                onClick={() => {
                  onChangeStyle(style)
                  setShowStyleMenu(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors capitalize ${
                  currentStyle === style 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ borderRadius: '8px' }}
              >
                {style}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={onRecenter}
        className="p-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500"
        style={{ borderRadius: '8px' }}
        aria-label="Recenter map"
      >
        <IoNavigateOutline className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-lg overflow-hidden" style={{ borderRadius: '8px' }}>
        <button
          onClick={onZoomIn}
          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition-colors focus:ring-2 focus:ring-blue-500"
          aria-label="Zoom in"
        >
          <span className="text-lg font-semibold">+</span>
        </button>
        <button
          onClick={onZoomOut}
          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500"
          aria-label="Zoom out"
        >
          <span className="text-lg font-semibold">−</span>
        </button>
      </div>
    </div>
  )
}

// Map Legend Component
function MapLegend({ carCount, isMobile }: { carCount: number; isMobile: boolean }) {
  if (isMobile) return null

  return (
    <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-800 shadow-lg p-4 z-30" style={{ borderRadius: '8px' }}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {carCount} Available Cars
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 flex items-center justify-center shadow-sm" style={{ borderRadius: '8px' }}>
            <span className="text-white text-xs font-bold">$</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Standard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 flex items-center justify-center shadow-sm" style={{ borderRadius: '8px' }}>
            <IoFlashOutline className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Instant Book</span>
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
  const searchMarker = useRef<mapboxgl.Marker | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>('streets')
  const [isMobile, setIsMobile] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(12)

  // Detect mobile and orientation changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    
    const handleResize = () => {
      checkMobile()
      // Resize map after layout change
      setTimeout(() => {
        map.current?.resize()
      }, 100)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Handle fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])
  
  // Calculate distances for cars with memoization
  const carsWithObfuscatedLocations = useMemo(() => {
    if (!cars.length) return []

    return cars.map(car => {
      let calculatedDistance = car.distance
      
      // Calculate distance if not provided
      if (calculatedDistance === null || calculatedDistance === undefined) {
        if (userLocation && car.location?.lat && car.location?.lng) {
          calculatedDistance = safeCalculateDistance(searchLocation, car.location)
        }
      }
      
      // Obfuscate the location for privacy - use proper null checks (not falsy check since 0 is valid)
      const hasValidLocation = car.location?.lat !== undefined && car.location?.lat !== null &&
                               car.location?.lng !== undefined && car.location?.lng !== null
      const displayLocation = hasValidLocation
        ? obfuscateLocation(car.location.lat, car.location.lng, currentZoom, car.id)
        : null
      
      return { 
        ...car, 
        calculatedDistance,
        displayLocation
      } as CarWithDisplay
    }).sort((a, b) => {
      // Sort by distance, nulls last
      if (a.calculatedDistance === null || a.calculatedDistance === undefined) return 1
      if (b.calculatedDistance === null || b.calculatedDistance === undefined) return -1
      return a.calculatedDistance - b.calculatedDistance
    })
  }, [cars, userLocation, searchLocation, currentZoom])
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !searchLocation?.lat || !searchLocation?.lng) return
    
    // Check for Mapbox token
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setMapError('Mapbox token is not configured')
      return
    }
    
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
        maxZoom: 15, // Restrict maximum zoom for privacy
        minZoom: 8,
        attributionControl: false
      })
      
      map.current = newMap
      setCurrentZoom(newMap.getZoom())
      setMapError(null)
      
      // Add controls
      if (!isMobile) {
        newMap.addControl(new mapboxgl.NavigationControl({ 
          showCompass: false, 
          showZoom: false 
        }), 'top-left')
      }
      
      newMap.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 
        'bottom-right'
      )
      
      // Map loaded event
      newMap.on('load', () => {
        setMapLoaded(true)
        
        // Add search location marker
        if (searchLocation?.lat && searchLocation?.lng) {
          const searchEl = document.createElement('div')
          searchEl.className = 'w-6 h-6 bg-red-600 border-4 border-white shadow-lg'
          searchEl.style.borderRadius = '50%'
          searchEl.setAttribute('aria-label', 'Search location')
          
          searchMarker.current = new mapboxgl.Marker({ element: searchEl, anchor: 'center' })
            .setLngLat([searchLocation.lng, searchLocation.lat])
            .addTo(newMap)
        }
        
        // Add user location marker (if available)
        if (userLocation?.lat && userLocation?.lng) {
          const userEl = document.createElement('div')
          userEl.className = 'w-5 h-5 bg-blue-600 border-3 border-white shadow-lg'
          userEl.style.borderRadius = '50%'
          userEl.setAttribute('aria-label', 'Your location')
          
          userMarker.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(newMap)
        }
      })
      
      // Error handling
      newMap.on('error', (e) => {
        console.error('Map error:', e)
        setMapError('Failed to load map')
      })
      
      newMap.on('styleerror', (e) => {
        console.error('Map style error:', e)
        setMapError('Failed to load map style')
      })
      
      // Event listeners
      newMap.on('zoom', () => {
        const zoom = newMap.getZoom()
        setCurrentZoom(zoom)
        onZoomChange?.(zoom)
      })
      
      newMap.on('moveend', () => {
        try {
          onBoundsChange?.(newMap.getBounds())
        } catch (error) {
          console.error('Error getting map bounds:', error)
        }
      })
      
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Failed to initialize map')
    }
    
    return () => {
      try {
        // Clean up markers
        markers.current.forEach(marker => marker.remove())
        markers.current.clear()
        searchMarker.current?.remove()
        userMarker.current?.remove()
        
        // Remove map
        if (map.current) {
          map.current.remove()
          map.current = null
          setMapLoaded(false)
        }
      } catch (error) {
        console.error('Error during map cleanup:', error)
      }
    }
  }, [searchLocation.lng, searchLocation.lat, userLocation, isMobile, onBoundsChange, onZoomChange])
  
  // Update map style
  useEffect(() => {
    if (map.current && mapLoaded) {
      try {
        map.current.setStyle(MAP_STYLES[currentStyle])
      } catch (error) {
        console.error('Error changing map style:', error)
      }
    }
  }, [currentStyle, mapLoaded])
  
  // Add car markers with enhanced obfuscation
  useEffect(() => {
    if (!map.current || !mapLoaded || !carsWithObfuscatedLocations.length) return

    try {
      // Clear existing markers
      markers.current.forEach(marker => {
        try {
          marker.remove()
        } catch (error) {
          console.warn('Error removing marker:', error)
        }
      })
      markers.current.clear()
      
      // Add new markers with obfuscated locations
      carsWithObfuscatedLocations.forEach(car => {
        // Skip cars without valid display location (use null check, not falsy check)
        if (car.displayLocation === null || car.displayLocation === undefined) return
        
        try {
          const el = document.createElement('div')
          const color = getMarkerColor(car)
          const isSelected = selectedCar?.id === car.id
          const size = isMobile ? 32 : 36
          const selectedSize = isMobile ? 36 : 42
          
          const displayText = `${Math.round(car.dailyRate)}`
          
          // Create heat/blur effect container
          const heatContainer = document.createElement('div')
          heatContainer.style.position = 'relative'
          heatContainer.style.width = isSelected ? `${selectedSize}px` : `${size}px`
          heatContainer.style.height = isSelected ? `${selectedSize}px` : `${size}px`
          heatContainer.setAttribute('role', 'button')
          heatContainer.setAttribute('aria-label', `${car.year} ${car.make} ${car.model} - ${Math.round(car.dailyRate)} per day`)
          heatContainer.setAttribute('tabindex', '0')
          
          // Heat glow background (privacy layer)
          const glowEl = document.createElement('div')
          glowEl.style.position = 'absolute'
          glowEl.style.top = '0'
          glowEl.style.left = '0'
          glowEl.style.right = '0'
          glowEl.style.bottom = '0'
          glowEl.style.background = `radial-gradient(circle, ${color}40 0%, ${color}20 50%, transparent 100%)`
          glowEl.style.borderRadius = '50%'
          glowEl.style.transform = `scale(${currentZoom > 13 ? 2.5 : 2})` // Increase blur at higher zoom
          glowEl.style.animation = 'pulse 3s infinite'
          glowEl.style.pointerEvents = 'none'
          
          // Main marker element
          el.className = `
            relative cursor-pointer flex items-center justify-center
            text-xs font-bold shadow-lg transition-all duration-200 hover:scale-110 focus:scale-110
            ${isSelected ? 'ring-4 ring-white z-50' : 'z-10'}
          `.trim()
          
          el.style.width = isSelected ? `${selectedSize}px` : `${size}px`
          el.style.height = isSelected ? `${selectedSize}px` : `${size}px`
          el.style.backgroundColor = car.instantBook || car.carType === 'luxury' ? color : 'white'
          el.style.border = `2px solid ${isSelected ? 'white' : color}`
          el.style.borderRadius = '50%'
          el.style.color = car.instantBook || car.carType === 'luxury' ? 'white' : '#374151'
          el.style.fontSize = isMobile ? '9px' : '10px'
          el.style.boxShadow = isSelected ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.3)'
          el.style.backdropFilter = 'blur(2px)'
          el.style.outline = 'none'
          
          el.textContent = displayText
          
          // Assemble the heat marker
          heatContainer.appendChild(glowEl)
          heatContainer.appendChild(el)
          
          // Click handler
          const handleClick = (e: Event) => {
            e.stopPropagation()
            onCarSelect(car)
          }
          
          // Keyboard handler
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onCarSelect(car)
            }
          }
          
          heatContainer.addEventListener('click', handleClick)
          heatContainer.addEventListener('keydown', handleKeyDown)
          
          // Create marker with obfuscated location
          const marker = new mapboxgl.Marker({ 
            element: heatContainer,
            anchor: 'center'
          })
            .setLngLat([car.displayLocation.lng, car.displayLocation.lat])
            .addTo(map.current!)
          
          // Store cleanup function
          const originalRemove = marker.remove.bind(marker)
          marker.remove = () => {
            heatContainer.removeEventListener('click', handleClick)
            heatContainer.removeEventListener('keydown', handleKeyDown)
            return originalRemove()
          }
          
          markers.current.set(car.id, marker)
        } catch (error) {
          console.warn('Error creating marker for car:', car.id, error)
        }
      })
    } catch (error) {
      console.error('Error updating car markers:', error)
    }
  }, [carsWithObfuscatedLocations, mapLoaded, selectedCar, isMobile, onCarSelect, currentZoom])
  
  // ENHANCED: Disable map interactions completely when modal is open
  useEffect(() => {
    if (selectedCar && map.current) {
      // Disable ALL map interactions
      map.current.dragPan.disable()
      map.current.scrollZoom.disable()
      map.current.doubleClickZoom.disable()
      map.current.touchZoomRotate.disable()
      map.current.boxZoom.disable()
      map.current.keyboard.disable()
      
      // Disable pointer events and interaction on the entire map container
      if (mapContainer.current) {
        mapContainer.current.style.pointerEvents = 'none'
        mapContainer.current.style.touchAction = 'none'
        mapContainer.current.style.userSelect = 'none'
        mapContainer.current.style.webkitUserSelect = 'none'
        // Stop all animations and transitions
        map.current.stop()
      }
    } else if (map.current) {
      // Re-enable map interactions
      map.current.dragPan.enable()
      map.current.scrollZoom.enable()
      map.current.doubleClickZoom.enable()
      map.current.touchZoomRotate.enable()
      map.current.boxZoom.enable()
      map.current.keyboard.enable()
      
      // Re-enable pointer events
      if (mapContainer.current) {
        mapContainer.current.style.pointerEvents = 'auto'
        mapContainer.current.style.touchAction = 'auto'
        mapContainer.current.style.userSelect = 'auto'
        mapContainer.current.style.webkitUserSelect = 'auto'
      }
    }
  }, [selectedCar])

  // ENHANCED: Stop map animations when modal opens (prevent map movement behind modal)
  useEffect(() => {
    if (selectedCar && map.current && mapLoaded) {
      // Stop any ongoing map animations/transitions immediately
      map.current.stop()
      
      const selectedCarWithLocation = carsWithObfuscatedLocations.find(c => c.id === selectedCar.id)
      if (selectedCarWithLocation?.displayLocation?.lng && selectedCarWithLocation?.displayLocation?.lat) {
        try {
          // Use easeTo instead of flyTo to prevent animation conflicts
          map.current.easeTo({
            center: [selectedCarWithLocation.displayLocation.lng, selectedCarWithLocation.displayLocation.lat],
            zoom: Math.min(currentZoom + 1, 15),
            duration: 0, // No animation to prevent conflicts
            easing: (t) => t // Linear easing
          })
        } catch (error) {
          console.error('Error moving to selected car:', error)
        }
      }
    }
  }, [selectedCar, carsWithObfuscatedLocations, currentZoom, mapLoaded])
  
  // Control handlers
  const handleZoomIn = useCallback(() => {
    if (map.current && currentZoom < 15) {
      try {
        map.current.zoomIn({ duration: 300 })
      } catch (error) {
        console.error('Error zooming in:', error)
      }
    }
  }, [currentZoom])
  
  const handleZoomOut = useCallback(() => {
    if (map.current) {
      try {
        map.current.zoomOut({ duration: 300 })
      } catch (error) {
        console.error('Error zooming out:', error)
      }
    }
  }, [])
  
  const handleRecenter = useCallback(() => {
    if (map.current && searchLocation?.lat && searchLocation?.lng) {
      try {
        map.current.flyTo({
          center: [searchLocation.lng, searchLocation.lat],
          zoom: isMobile ? 11 : 12,
          duration: 1000,
          curve: 1.42
        })
      } catch (error) {
        console.error('Error recentering map:', error)
      }
    }
  }, [searchLocation, isMobile])
  
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
    setTimeout(() => {
      try {
        map.current?.resize()
      } catch (error) {
        console.error('Error resizing map:', error)
      }
    }, 100)
  }, [])
  
  const handleViewDetails = useCallback((carId: string) => {
    try {
      window.location.href = `/rentals/${carId}`
    } catch (error) {
      console.error('Error navigating to car details:', error)
    }
  }, [])
  
  const handleChangeStyle = useCallback((style: MapStyleKey) => {
    setCurrentStyle(style)
  }, [])

  // Handle fullscreen resize
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])
  
  // Error state
  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Map Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {mapError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            style={{ borderRadius: '8px' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-50 dark:bg-gray-900 overflow-hidden`}>
      {/* Map container - ENHANCED freeze when modal is open */}
      <div 
        ref={mapContainer} 
        className={`w-full h-full transition-all duration-200 ${
          selectedCar 
            ? 'pointer-events-none touch-none select-none scale-[0.99]' 
            : ''
        }`}
        role="application"
        aria-label="Interactive map showing available rental cars"
        style={selectedCar ? { 
          filter: 'blur(2px) brightness(0.8)', 
          opacity: '0.6',
          transform: 'scale(0.99)',
          transformOrigin: 'center'
        } : {}}
      />
      
      {/* Map controls - Hidden when modal is open on mobile */}
      {!selectedCar && (
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
      )}
      
      {/* Legend - desktop only, hidden when modal is open */}
      {!selectedCar && mapLoaded && (
        <MapLegend carCount={cars.length} isMobile={isMobile} />
      )}
      
      {/* Selected car detail modal - Enhanced z-index and isolation */}
      {selectedCar && (
        <div style={{ isolation: 'isolate' }}>
          <CarDetailModal
            car={selectedCar}
            onClose={() => onCarSelect(null)}
            onViewDetails={handleViewDetails}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <div 
              className="animate-spin h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4" 
              style={{ borderRadius: '50%' }}
              aria-label="Loading"
            ></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading cars...</p>
          </div>
        </div>
      )}
      
      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedCar && `Selected ${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
        {isLoading && 'Loading available cars'}
        {mapError && `Map error: ${mapError}`}
      </div>
      
      {/* Global styles - Enhanced for mobile interaction */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1.8); 
          }
          50% { 
            opacity: 0.2; 
            transform: scale(2.2); 
          }
        }
        
        .mapboxgl-popup-content {
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .mapboxgl-ctrl-group {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .mapboxgl-ctrl-group button {
          width: 40px;
          height: 40px;
          border-radius: 6px;
        }
        
        .mapboxgl-ctrl-scale {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px);
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        /* Enhanced privacy and security */
        .mapboxgl-marker {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          pointer-events: auto;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .mapboxgl-marker:hover {
          z-index: 100 !important;
        }
        
        .mapboxgl-marker:focus-within {
          z-index: 100 !important;
        }
        
        /* Prevent context menu on markers */
        .mapboxgl-marker * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          context-menu: none;
        }
        
        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Focus styles for better accessibility */
        .mapboxgl-marker [role="button"]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Enhanced mobile modal styles */
        @media (max-width: 768px) {
          .mapboxgl-ctrl-attrib {
            display: none;
          }
          .mapboxgl-ctrl-scale {
            font-size: 11px;
          }
          
          /* Enhanced touch targets */
          .mapboxgl-marker {
            min-width: 44px;
            min-height: 44px;
          }
          
          /* Modal specific mobile enhancements */
          [role="dialog"] {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          [role="dialog"] button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            tap-highlight-color: rgba(0, 0, 0, 0.1);
          }
          
          /* Prevent scrolling when modal is open */
          body:has([role="dialog"]) {
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        }
        
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          .mapboxgl-popup-content {
            background: #374151;
            color: white;
          }
          .mapboxgl-ctrl-group {
            background: #374151;
          }
          .mapboxgl-ctrl-scale {
            background: rgba(55, 65, 81, 0.9);
            color: white;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mapboxgl-marker {
            animation: none !important;
          }
          
          .mapboxgl-marker * {
            animation: none !important;
            transition: none !important;
          }
          
          [role="dialog"] {
            transition: none !important;
            animation: none !important;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .mapboxgl-marker {
            border-width: 3px !important;
          }
          
          [role="dialog"] {
            border: 3px solid currentColor !important;
          }
        }
        
        /* Additional mobile touch enhancements */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  )
}