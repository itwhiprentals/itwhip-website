// app/(guest)/rentals/search/SearchResultsClient.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  IoCarOutline,
  IoLocationOutline,
  IoFilterOutline,
  IoFlashOutline,
  IoMapOutline,
  IoListOutline,
  IoCloseOutline,
  IoSwapVerticalOutline,
  IoAirplaneOutline,
  IoBusinessOutline
} from 'react-icons/io5'
import { format, parseISO } from 'date-fns'
import { MapContainer } from './components/MapContainer'
import RentalSearchCard from '@/app/(guest)/components/hero/RentalSearchWidget'
import CompactCarCard from '@/app/components/cards/CompactCarCard'

// Loading skeleton component - compact style
function CarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  )
}

interface SearchResultsClientProps {
  initialCars: any[]
  initialTotal: number
  initialMetadata: any
  initialLocation: string
  initialPickupDate: string
  initialReturnDate: string
  initialPickupTime: string
  initialReturnTime: string
}

export default function SearchResultsClient({
  initialCars,
  initialTotal,
  initialMetadata,
  initialLocation,
  initialPickupDate,
  initialReturnDate,
  initialPickupTime,
  initialReturnTime
}: SearchResultsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check for view parameter from URL
  const viewParam = searchParams.get('view')

  const [cars, setCars] = useState<any[]>(initialCars)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    carType: [] as string[],
    minPrice: 0,
    maxPrice: 1000,
    features: [] as string[],
    instantBook: false,
    transmission: 'all',
    seats: 'all',
    delivery: [] as string[],
    availability: 'all' // all, available, partial
  })
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(viewParam === 'map')
  const [totalCount, setTotalCount] = useState(initialTotal)
  const [searchMetadata, setSearchMetadata] = useState<any>(initialMetadata)

  // Parse search params - use initial values as defaults
  const location = searchParams.get('location') || initialLocation
  const pickupDate = searchParams.get('pickupDate') || initialPickupDate
  const returnDate = searchParams.get('returnDate') || initialReturnDate
  const pickupTime = searchParams.get('pickupTime') || initialPickupTime
  const returnTime = searchParams.get('returnTime') || initialReturnTime

  // Calculate rental days
  const rentalDays = Math.ceil(
    (new Date(returnDate).getTime() - new Date(pickupDate).getTime())
    / (1000 * 60 * 60 * 24)
  )

  // Fetch cars (only when params change from initial)
  const fetchCars = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        location,
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
        sortBy,
        ...filters.carType.length > 0 && { carType: filters.carType.join(',') },
        ...filters.minPrice > 0 && { minPrice: filters.minPrice.toString() },
        ...filters.maxPrice < 1000 && { maxPrice: filters.maxPrice.toString() },
        ...filters.features.length > 0 && { features: filters.features.join(',') },
        ...filters.instantBook && { instantBook: 'true' },
        ...filters.transmission !== 'all' && { transmission: filters.transmission },
        ...filters.seats !== 'all' && { seats: filters.seats },
        ...filters.delivery.length > 0 && { delivery: filters.delivery.join(',') }
      })

      const response = await fetch(`/api/rentals/search?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCars(data.results || [])
        setTotalCount(data.total || 0)
        setSearchMetadata(data.metadata || null)
      } else {
        console.error('Search failed:', data.error)
        setCars([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      setCars([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [location, pickupDate, returnDate, pickupTime, returnTime, sortBy, filters])

  // Only fetch when filters/sort change (initial data is from server)
  useEffect(() => {
    // Skip initial render - we already have server data
    const hasFilterChanges =
      filters.carType.length > 0 ||
      filters.minPrice > 0 ||
      filters.maxPrice < 1000 ||
      filters.features.length > 0 ||
      filters.instantBook ||
      filters.transmission !== 'all' ||
      filters.seats !== 'all' ||
      filters.delivery.length > 0 ||
      sortBy !== 'recommended'

    if (hasFilterChanges) {
      fetchCars()
    }
  }, [sortBy, filters, fetchCars])

  // Re-fetch when search params change
  useEffect(() => {
    const urlLocation = searchParams.get('location')
    const urlPickupDate = searchParams.get('pickupDate')
    const urlReturnDate = searchParams.get('returnDate')

    // Only fetch if URL params are different from initial
    if (
      (urlLocation && urlLocation !== initialLocation) ||
      (urlPickupDate && urlPickupDate !== initialPickupDate) ||
      (urlReturnDate && urlReturnDate !== initialReturnDate)
    ) {
      fetchCars()
    }
  }, [searchParams, initialLocation, initialPickupDate, initialReturnDate, fetchCars])

  // Filter cars by availability filter
  const filteredCars = useMemo(() => {
    if (filters.availability === 'all') return cars

    return cars.filter(car => {
      if (filters.availability === 'available') {
        return car.availability?.isFullyAvailable
      }
      if (filters.availability === 'partial') {
        return car.availability?.isPartiallyAvailable
      }
      return true
    })
  }, [cars, filters.availability])

  // Handle search update
  const handleSearchUpdate = (params: any) => {
    const newSearchParams = new URLSearchParams({
      location: params.location || location,
      pickupDate: params.pickupDate || pickupDate,
      returnDate: params.returnDate || returnDate,
      pickupTime: params.pickupTime || pickupTime,
      returnTime: params.returnTime || returnTime,
    })
    router.push(`/rentals/search?${newSearchParams.toString()}`)
  }

  // Car types for filter
  const carTypes = [
    { value: 'sedan', label: 'Sedan', icon: IoCarOutline },
    { value: 'suv', label: 'SUV', icon: IoCarOutline },
    { value: 'truck', label: 'Truck', icon: IoCarOutline },
    { value: 'van', label: 'Van', icon: IoCarOutline },
    { value: 'luxury', label: 'Luxury', icon: IoCarOutline },
    { value: 'sports', label: 'Sports', icon: IoCarOutline },
    { value: 'convertible', label: 'Convertible', icon: IoCarOutline },
    { value: 'electric', label: 'Electric', icon: IoCarOutline }
  ]

  // Features for filter
  const featureOptions = [
    'Bluetooth',
    'Apple CarPlay',
    'Android Auto',
    'Backup Camera',
    'GPS Navigation',
    'Heated Seats',
    'Sunroof',
    'AWD',
    'USB Charger',
    'Leather Seats',
    'Cruise Control',
    'Keyless Entry'
  ]

  // Delivery options
  const deliveryOptions = [
    { value: 'airport', label: 'Airport Pickup', icon: IoAirplaneOutline },
    { value: 'hotel', label: 'Hotel Delivery', icon: IoBusinessOutline },
    { value: 'home', label: 'Home Delivery', icon: IoLocationOutline }
  ]

  // Sort options
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Distance: Nearest' }
  ]

  // Handle filter changes
  const handleCarTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      carType: prev.carType.includes(type)
        ? prev.carType.filter(t => t !== type)
        : [...prev.carType, type]
    }))
  }

  const handleFeatureFilter = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleDeliveryFilter = (delivery: string) => {
    setFilters(prev => ({
      ...prev,
      delivery: prev.delivery.includes(delivery)
        ? prev.delivery.filter(d => d !== delivery)
        : [...prev.delivery, delivery]
    }))
  }

  const clearFilters = () => {
    setFilters({
      carType: [],
      minPrice: 0,
      maxPrice: 1000,
      features: [],
      instantBook: false,
      transmission: 'all',
      seats: 'all',
      delivery: [],
      availability: 'all'
    })
  }

  const activeFilterCount =
    filters.carType.length +
    filters.features.length +
    filters.delivery.length +
    (filters.instantBook ? 1 : 0) +
    (filters.transmission !== 'all' ? 1 : 0) +
    (filters.seats !== 'all' ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 1000 ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Widget - Hidden on map view for more space */}
      {!showMap && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <RentalSearchCard
              onSearch={handleSearchUpdate}
              variant="compact"
              initialLocation={location}
              initialPickupDate={pickupDate}
              initialReturnDate={returnDate}
              initialPickupTime={pickupTime}
              initialReturnTime={returnTime}
            />
          </div>
        </div>
      )}

      {/* Filter Bar - Sticky below header */}
      <div className={`bg-white dark:bg-gray-800 sticky top-[60px] md:top-16 z-40 border-b border-gray-200 dark:border-gray-700 ${showMap ? 'shadow-md' : ''}`}>
        <div className={showMap ? 'w-full' : 'max-w-7xl mx-auto'}>
          {/* Results Summary - Compact on map view */}
          <div className={`px-4 sm:px-6 lg:px-8 py-2 text-sm text-gray-600 dark:text-gray-400 ${showMap ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}>
            {!isLoading && (
              <>
                <span className="font-medium text-gray-900 dark:text-white">{filteredCars.length}</span> car{filteredCars.length !== 1 ? 's' : ''}
                {searchMetadata && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 dark:text-green-400">{searchMetadata.fullyAvailable || 0} fully available</span>
                    {searchMetadata.partiallyAvailable > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-yellow-600 dark:text-yellow-400">{searchMetadata.partiallyAvailable} partial</span>
                      </>
                    )}
                  </>
                )}
                <span className="mx-2">•</span>
                {format(parseISO(pickupDate), 'MMM d')} - {format(parseISO(returnDate), 'MMM d')}
                <span className="mx-2">•</span>
                {rentalDays} day{rentalDays !== 1 ? 's' : ''}
              </>
            )}
          </div>

          {/* Scrollable filter container */}
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 min-w-max">
              {/* Availability Filter */}
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="h-10 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Cars</option>
                <option value="available">Fully Available</option>
                <option value="partial">Partial Availability</option>
              </select>

              {/* Car Type Quick Filter */}
              {carTypes.slice(0, 4).map(type => (
                <button
                  key={type.value}
                  onClick={() => handleCarTypeFilter(type.value)}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filters.carType.includes(type.value)
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}

              {/* Instant Book Toggle */}
              <button
                onClick={() => setFilters(prev => ({ ...prev, instantBook: !prev.instantBook }))}
                className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  filters.instantBook
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <IoFlashOutline className="w-4 h-4" />
                Instant Book
              </button>

              {/* More Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 px-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <IoFilterOutline className="w-4 h-4" />
                More Filters
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer min-w-[160px]"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <IoSwapVerticalOutline className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setShowMap(false)}
                  className={`p-2 rounded ${!showMap ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                  title="List view"
                >
                  <IoListOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`p-2 rounded ${showMap ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                  title="Map view"
                >
                  <IoMapOutline className="w-5 h-5" />
                </button>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="h-10 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <IoCloseOutline className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {showMap ? (
        /* Map view - no z-index to avoid creating stacking context that traps modal */
        <div className="relative">
          <MapContainer
            cars={filteredCars}
            searchLocation={searchMetadata?.searchCoordinates ? { lat: searchMetadata.searchCoordinates.latitude, lng: searchMetadata.searchCoordinates.longitude } : { lat: 33.4484, lng: -112.0740 }}
            userLocation={searchMetadata?.searchCoordinates ? { lat: searchMetadata.searchCoordinates.latitude, lng: searchMetadata.searchCoordinates.longitude } : null}
            rentalDays={rentalDays}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <>
            {/* Car Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-12">
                <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No cars found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or search dates
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredCars.map((car) => (
                  <CompactCarCard
                    key={car.id}
                    car={{
                      id: car.id,
                      make: car.make,
                      model: car.model,
                      year: car.year,
                      dailyRate: Number(car.dailyRate),
                      carType: car.type || car.carType,
                      seats: car.seats,
                      city: car.location?.city || 'Phoenix',
                      rating: car.rating?.average ?? car.rating ?? null,
                      totalTrips: car.trips || car.totalTrips,
                      instantBook: car.instantBook,
                      photos: car.photos,
                      host: car.host ? {
                        name: car.host.name,
                        profilePhoto: car.host.avatar || car.host.profilePhoto
                      } : null
                    }}
                  />
                ))}
              </div>
            )}
          </>
        </div>
      )}
    </div>
  )
}
