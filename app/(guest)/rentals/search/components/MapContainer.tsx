// app/(guest)/rentals/search/components/MapContainer.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapSidebar } from './MapSidebar'
import { 
  IoListOutline, 
  IoMapOutline
} from 'react-icons/io5'

// Dynamically import map to avoid SSR issues with Mapbox
const CarMapView = dynamic(() => import('./CarMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  )
})

interface MapContainerProps {
  cars: any[]
  searchLocation?: { lat: number; lng: number }
  userLocation?: { lat: number; lng: number } | null
  rentalDays: number
  isLoading?: boolean
}

export function MapContainer({ 
  cars, 
  searchLocation = { lat: 33.4484, lng: -112.0740 }, // Phoenix default
  userLocation,
  rentalDays,
  isLoading = false 
}: MapContainerProps) {
  const [selectedCar, setSelectedCar] = useState<any | null>(null)
  const [hoveredCar, setHoveredCar] = useState<any | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Always show sidebar on desktop, hide on mobile
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      } else {
        setShowSidebar(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Transform cars to ensure proper location structure and preserve distance
  const carsWithLocation = cars.map(car => ({
    ...car,
    location: {
      ...car.location,
      lat: car.location?.lat || searchLocation.lat,
      lng: car.location?.lng || searchLocation.lng,
      city: car.location?.city || car.city || 'Phoenix',
      state: car.location?.state || car.state || 'AZ',
      address: car.location?.address || car.address
    },
    // PRESERVE the distance that was calculated in parent
    distance: car.distance || null
  }))
  
  // Mobile layout - Just the map, no bottom sheet
  if (isMobile) {
    return (
      <div className="relative h-[calc(100vh-120px)]">
        <CarMapView
          cars={carsWithLocation}
          selectedCar={selectedCar}
          onCarSelect={setSelectedCar}
          searchLocation={searchLocation}
          userLocation={userLocation}
          isLoading={isLoading}
        />
      </div>
    )
  }
  
  // Desktop layout - Map with sidebar
  return (
    <div className="flex h-[calc(100vh-200px)] relative">
      {/* Sidebar - Desktop only */}
      {showSidebar && (
        <div className="w-[420px] border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
          <MapSidebar
            cars={carsWithLocation}
            selectedCar={selectedCar}
            onCarSelect={setSelectedCar}
            onCarHover={setHoveredCar}
            rentalDays={rentalDays}
            isLoading={isLoading}
            userLocation={userLocation}
          />
        </div>
      )}
      
      {/* Map */}
      <div className="flex-1 relative">
        <CarMapView
          cars={carsWithLocation}
          selectedCar={selectedCar}
          onCarSelect={setSelectedCar}
          searchLocation={searchLocation}
          userLocation={userLocation}
          isLoading={isLoading}
        />
        
        {/* Toggle sidebar button - Desktop only */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {showSidebar ? (
            <IoListOutline className="w-5 h-5" />
          ) : (
            <IoMapOutline className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}