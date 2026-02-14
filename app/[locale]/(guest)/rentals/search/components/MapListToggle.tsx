// app/(guest)/rentals/search/components/MapListToggle.tsx
'use client'

import { IoListOutline, IoMapOutline } from 'react-icons/io5'
import { useTranslations } from 'next-intl'

interface MapListToggleProps {
  view: 'map' | 'list'
  onViewChange: (view: 'map' | 'list') => void
}

export function MapListToggle({ view, onViewChange }: MapListToggleProps) {
  const t = useTranslations('SearchResults')
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded transition-all ${
          view === 'list'
            ? 'bg-white dark:bg-gray-800 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
        title={t('listView')}
        aria-label={t('switchToListView')}
      >
        <IoListOutline className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={`p-2 rounded transition-all ${
          view === 'map'
            ? 'bg-white dark:bg-gray-800 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
        title={t('mapView')}
        aria-label={t('switchToMapView')}
      >
        <IoMapOutline className="w-5 h-5" />
      </button>
    </div>
  )
}

// app/(guest)/rentals/search/components/MapSidebar.tsx
'use client'

import { useState as useStateSidebar } from 'react'
import { Link } from '@/i18n/navigation'
import { 
  IoCarOutline, 
  IoLocationOutline, 
  IoStarOutline,
  IoFlashOutline,
  IoChevronForwardOutline,
  IoFilterOutline
} from 'react-icons/io5'

interface MapSidebarProps {
  cars: any[]
  selectedCar: any | null
  onCarSelect: (car: any) => void
  onCarHover: (car: any | null) => void
  rentalDays: number
  isLoading?: boolean
}

export function MapSidebar({ 
  cars, 
  selectedCar, 
  onCarSelect, 
  onCarHover,
  rentalDays,
  isLoading = false 
}: MapSidebarProps) {
  const [sortBy, setSortBy] = useStateSidebar('distance')
  
  // Sort cars based on selection
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.dailyRate - b.dailyRate
      case 'price_high':
        return b.dailyRate - a.dailyRate
      case 'rating':
        return (b.rating?.average || 0) - (a.rating?.average || 0)
      case 'distance':
      default:
        // This would need actual distance calculation
        return 0
    }
  })
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cars.length} cars available
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <option value="distance">Nearest</option>
            <option value="price_low">Price: Low</option>
            <option value="price_high">Price: High</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      
      {/* Car list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCars.map((car) => (
              <div
                key={car.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  selectedCar?.id === car.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                }`}
                onClick={() => onCarSelect(car)}
                onMouseEnter={() => onCarHover(car)}
                onMouseLeave={() => onCarHover(null)}
              >
                <div className="flex gap-3">
                  {/* Car image */}
                  <div className="flex-shrink-0 w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {car.photos && car.photos[0] ? (
                      <img
                        src={car.photos[0].url}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Car details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {car.year} {car.make} {car.model}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          {car.rating && (
                            <div className="flex items-center gap-0.5">
                              <IoStarOutline className="w-3 h-3 text-amber-500 fill-current" />
                              <span>{car.rating.average}</span>
                            </div>
                          )}
                          <span>{car.seats} seats</span>
                          {car.instantBook && (
                            <span className="flex items-center gap-0.5 text-green-600">
                              <IoFlashOutline className="w-3 h-3" />
                              Instant
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ${Math.round(car.dailyRate)}
                        </div>
                        <div className="text-xs text-gray-500">/day</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <IoLocationOutline className="w-3 h-3" />
                        <span>0.5 mi</span>
                      </div>
                      <Link
                        href={`/rentals/${car.id}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                        <IoChevronForwardOutline className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with total */}
      {!isLoading && cars.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedCars.length} of {cars.length} cars
          </div>
        </div>
      )}
    </div>
  )
}

// app/(guest)/rentals/search/components/MapContainer.tsx
'use client'

import { useState as useStateContainer } from 'react'
import dynamic from 'next/dynamic'
import { MapSidebar as MapSidebarComponent } from './MapSidebar'

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
  rentalDays: number
  isLoading?: boolean
}

export function MapContainer({ 
  cars, 
  searchLocation = { lat: 33.4484, lng: -112.0740 }, // Phoenix default
  rentalDays,
  isLoading = false 
}: MapContainerProps) {
  const [selectedCar, setSelectedCar] = useStateContainer<any | null>(null)
  const [hoveredCar, setHoveredCar] = useStateContainer<any | null>(null)
  const [showSidebar, setShowSidebar] = useStateContainer(true)
  
  // Transform cars to have location data (you'll need to add this to your actual data)
  const carsWithLocation = cars.map(car => ({
    ...car,
    location: {
      ...car.location,
      // These would come from your actual data
      lat: searchLocation.lat + (Math.random() - 0.5) * 0.1,
      lng: searchLocation.lng + (Math.random() - 0.5) * 0.1,
    }
  }))
  
  return (
    <div className="flex h-[calc(100vh-200px)] relative">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-full md:w-96 lg:w-[420px] border-r border-gray-200 dark:border-gray-700">
          <MapSidebarComponent
            cars={carsWithLocation}
            selectedCar={selectedCar}
            onCarSelect={setSelectedCar}
            onCarHover={setHoveredCar}
            rentalDays={rentalDays}
            isLoading={isLoading}
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
          isLoading={isLoading}
        />
        
        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 md:hidden"
        >
          {showSidebar ? '←' : '→'}
        </button>
      </div>
    </div>
  )
}

// app/(guest)/rentals/search/utils/mapHelpers.ts
export const PHOENIX_COORDINATES = {
  lat: 33.4484,
  lng: -112.0740
}

export const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Scottsdale, AZ': { lat: 33.4942, lng: -111.9261 },
  'Tempe, AZ': { lat: 33.4255, lng: -111.9400 },
  'Mesa, AZ': { lat: 33.4152, lng: -111.8315 },
  'Chandler, AZ': { lat: 33.3062, lng: -111.8413 },
  'Gilbert, AZ': { lat: 33.3528, lng: -111.7890 },
}

export function getLocationCoordinates(location: string): { lat: number; lng: number } {
  return LOCATION_COORDINATES[location] || PHOENIX_COORDINATES
}

export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959 // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'Nearby'
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`
  return `${miles.toFixed(1)} mi`
}