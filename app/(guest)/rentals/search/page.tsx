// app/(guest)/rentals/search/page.tsx
'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoCarOutline, 
  IoLocationOutline, 
  IoCalendarOutline,
  IoFilterOutline,
  IoStarOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoMapOutline,
  IoListOutline,
  IoSearchOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoCarSportOutline,
  IoAirplaneOutline,
  IoBusinessOutline
} from 'react-icons/io5'
import { format, parseISO } from 'date-fns'
import { MapContainer } from './components/MapContainer'
import { getLocationCoordinates } from './utils/mapHelpers'
import Footer from '@/app/components/Footer'
import RentalSearchCard from '@/app/(guest)/components/hero/RentalSearchWidget'

// Loading skeleton component
function CarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div className="aspect-w-16 aspect-h-10 bg-gray-300 dark:bg-gray-700 rounded-t-lg h-48 animate-pulse"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Check for view parameter from URL
  const viewParam = searchParams.get('view')
  
  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const [totalCount, setTotalCount] = useState(0)
  const [searchMetadata, setSearchMetadata] = useState<any>(null)

  // Parse search params
  const location = searchParams.get('location') || 'Phoenix, AZ'
  const pickupDate = searchParams.get('pickupDate') || format(new Date(), 'yyyy-MM-dd')
  const returnDate = searchParams.get('returnDate') || format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  const pickupTime = searchParams.get('pickupTime') || '10:00'
  const returnTime = searchParams.get('returnTime') || '10:00'

  // Calculate rental days
  const rentalDays = Math.ceil(
    (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) 
    / (1000 * 60 * 60 * 24)
  )

  // Fetch cars
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

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

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
    const searchParams = new URLSearchParams({
      location: params.location || location,
      pickupDate: params.pickupDate || pickupDate,
      returnDate: params.returnDate || returnDate,
      pickupTime: params.pickupTime || pickupTime,
      returnTime: params.returnTime || returnTime,
    })
    router.push(`/rentals/search?${searchParams.toString()}`)
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

  // Get availability badge
  const getAvailabilityBadge = (car: any) => {
    if (!car.availability) return null

    if (car.availability.isFullyAvailable) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
          <IoCheckmarkCircleOutline className="w-3 h-3" />
          Available
        </span>
      )
    }

    if (car.availability.isCompletelyUnavailable) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-full flex items-center gap-1">
          <IoCloseOutline className="w-3 h-3" />
          Unavailable
        </span>
      )
    }

    if (car.availability.isPartiallyAvailable) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-1">
          <IoWarningOutline className="w-3 h-3" />
          Partial
        </span>
      )
    }

    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Search Widget - Sticky on mobile/desktop */}
        <div className="bg-white dark:bg-gray-800 sticky top-0 md:top-16 z-40 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RentalSearchCard onSearch={handleSearchUpdate} variant="compact" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 sticky top-[88px] md:top-[152px] z-30 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto">
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

            {/* Results Summary */}
            <div className="px-4 sm:px-6 lg:px-8 py-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Conditionally render Map or Grid view */}
          {showMap ? (
            <MapContainer
              cars={filteredCars}
              searchLocation={searchMetadata?.searchCoordinates || { latitude: 33.4484, longitude: -112.0740 }}
              userLocation={searchMetadata?.searchCoordinates}
              rentalDays={rentalDays}
              isLoading={isLoading}
            />
          ) : (
            <>
              {/* Car Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCars.map((car) => (
                    <Link
                      key={car.id}
                      href={`/rentals/${car.id}`}
                      className="group bg-white dark:bg-gray-800 rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Car Image */}
                      <div className="relative aspect-w-16 aspect-h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                        {car.photos && car.photos[0] ? (
                          <img
                            src={car.photos[0].url}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center">
                            <IoCarOutline className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {car.instantBook && (
                            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <IoFlashOutline className="w-3 h-3" />
                              INSTANT BOOK
                            </span>
                          )}
                          {getAvailabilityBadge(car)}
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3">
                          <div className="px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ${Math.round(car.dailyRate || 0)}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">/day</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Car Details */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {car.year} {car.make} {car.model}
                        </h3>

                        {/* Rating and Trips Row */}
                        <div className="flex items-center gap-3 text-sm mb-3">
                          {/* Rating */}
                          {car.rating && car.rating.count > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <IoStarOutline
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.floor(car.rating.average || 0)
                                        ? 'text-amber-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {typeof car.rating.average === 'number' 
                                  ? car.rating.average.toFixed(1) 
                                  : car.rating.average}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <IoStarOutline key={i} className="w-3.5 h-3.5 text-gray-300" />
                                ))}
                              </div>
                              <span className="text-gray-500">New</span>
                            </div>
                          )}
                          
                          {/* Trip Count */}
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <IoCarSportOutline className="w-3.5 h-3.5" />
                            {car.trips || 0 > 0 ? (
                              <>{car.trips || 0} trips</>
                            ) : (
                              <>New listing</>
                            )}
                          </span>
                        </div>

                        {/* Availability Info (for partial) */}
                        {car.availability?.isPartiallyAvailable && (
                          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-800 dark:text-yellow-400 font-medium">
                              {car.availability.label}
                            </p>
                          </div>
                        )}

                        {/* Location with Distance - Bottom section */}
                        <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 font-medium">
                              <IoLocationOutline className="w-3.5 h-3.5" />
                              <span>
                                {car.location?.distanceText || `${car.location?.city || 'Phoenix'} area`}
                              </span>
                            </div>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              View →
                            </span>
                          </div>
                          
                          {/* Free Delivery Badge */}
                          {car.location?.withinFreeDelivery && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                              <span>Free delivery available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Add Footer */}
      <Footer />
    </>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}