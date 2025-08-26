// app/(guest)/rentals/search/page.tsx
// Search results page for car rentals

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  IoCarOutline, 
  IoLocationOutline, 
  IoCalendarOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoStarOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoMapOutline,
  IoListOutline,
  IoSwapVerticalOutline,
  IoCheckmarkOutline,
  IoPersonOutline,
  IoSparklesOutline,
  IoPricetagOutline,
  IoTimeOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { format, parseISO } from 'date-fns'
import RentalSearchWidget from '@/app/(guest)/components/hero/RentalSearchWidget'

// Loading skeleton component
function CarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse">
      <div className="aspect-w-16 aspect-h-10 bg-gray-300 dark:bg-gray-700 rounded-t-xl h-48"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    carType: [] as string[],
    minPrice: 0,
    maxPrice: 500,
    features: [] as string[],
    instantBook: false,
    transmission: 'all',
    seats: 'all'
  })
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [availableFilters, setAvailableFilters] = useState<any>({})
  const [totalCount, setTotalCount] = useState(0)

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

  // Fetch cars - FIXED VERSION
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
        ...filters.maxPrice < 500 && { maxPrice: filters.maxPrice.toString() },
        ...filters.features.length > 0 && { features: filters.features.join(',') },
        ...filters.instantBook && { instantBook: 'true' },
        ...filters.transmission !== 'all' && { transmission: filters.transmission },
        ...filters.seats !== 'all' && { seats: filters.seats }
      })

      const response = await fetch(`/api/rentals/search?${params.toString()}`)
      const data = await response.json()
      
      // FIXED: Updated to match actual API response structure
      if (data.success) {
        setCars(data.results || [])  // Changed from data.data.cars
        setTotalCount(data.total || 0)  // Changed from data.data.totalCount
        setAvailableFilters(data.filters || {})  // Changed from data.data.filters
      } else {
        // Handle error case
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

  // Car types for filter
  const carTypes = [
    { value: 'economy', label: 'Economy', icon: '🚗' },
    { value: 'compact', label: 'Compact', icon: '🚗' },
    { value: 'midsize', label: 'Midsize', icon: '🚙' },
    { value: 'fullsize', label: 'Full Size', icon: '🚙' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'luxury', label: 'Luxury', icon: '🏎️' },
    { value: 'convertible', label: 'Convertible', icon: '🚘' },
    { value: 'minivan', label: 'Minivan', icon: '🚐' }
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
    'Leather Seats'
  ]

  // Sort options
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
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

  const clearFilters = () => {
    setFilters({
      carType: [],
      minPrice: 0,
      maxPrice: 500,
      features: [],
      instantBook: false,
      transmission: 'all',
      seats: 'all'
    })
  }

  const activeFilterCount = 
    filters.carType.length + 
    filters.features.length + 
    (filters.instantBook ? 1 : 0) +
    (filters.transmission !== 'all' ? 1 : 0) +
    (filters.seats !== 'all' ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 500 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Summary */}
            <div className="flex items-center gap-4">
              <Link
                href="/rentals"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <IoCarOutline className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {location}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(parseISO(pickupDate), 'MMM d')} - {format(parseISO(returnDate), 'MMM d')} • {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
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

              {/* Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <IoFilterOutline className="w-5 h-5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-white text-amber-600 text-xs font-semibold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Filter content here - simplified for mobile */}
              <div className="space-y-4">
                {/* Quick filters */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.instantBook}
                      onChange={(e) => setFilters(prev => ({ ...prev, instantBook: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">Instant Book</span>
                  </label>
                </div>

                {/* Car Type */}
                <div>
                  <h3 className="font-medium mb-2">Car Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {carTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleCarTypeFilter(type.value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.carType.includes(type.value)
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Instant Book */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.instantBook}
                    onChange={(e) => setFilters(prev => ({ ...prev, instantBook: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IoFlashOutline className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Instant Book</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Book without waiting for approval
                    </p>
                  </div>
                </label>
              </div>

              {/* Price Range */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Price per day
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice === 500 ? '' : filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 500 }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Car Type */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Car Type
                </h3>
                <div className="space-y-2">
                  {carTypes.map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.carType.includes(type.value)}
                        onChange={() => handleCarTypeFilter(type.value)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm">{type.icon} {type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Transmission
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transmission"
                      value="all"
                      checked={filters.transmission === 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transmission"
                      value="automatic"
                      checked={filters.transmission === 'automatic'}
                      onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">Automatic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transmission"
                      value="manual"
                      checked={filters.transmission === 'manual'}
                      onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">Manual</span>
                  </label>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Features
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {featureOptions.map(feature => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureFilter(feature)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>
                    {totalCount} car{totalCount !== 1 ? 's' : ''} available
                  </>
                )}
              </p>
            </div>

            {/* Car Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : cars.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cars.map((car) => (
                  <Link
                    key={car.id || car.externalId}
                    href={`/rentals/${car.id || car.externalId}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {/* Car Image */}
                    <div className="relative aspect-w-16 aspect-h-10 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
                      {car.photos && car.photos[0] ? (
                        <img
                          src={car.photos[0].url || car.photos[0]}
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
                        {car.source === 'p2p' && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                            Local Host
                          </span>
                        )}
                        {car.instantBook && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <IoFlashOutline className="w-3 h-3" />
                            Instant
                          </span>
                        )}
                        {car.provider_type === 'traditional' && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            {car.provider}
                          </span>
                        )}
                      </div>

                      {/* Distance Badge */}
                      {car.distance && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                            {car.distance} mi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {car.year} {car.make} {car.model}
                      </h3>

                      {/* Car Info */}
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>{car.seats} seats</span>
                        <span>•</span>
                        <span>{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                        {car.mpg && (
                          <>
                            <span>•</span>
                            <span>{car.mpg.combined || car.mpg.city || '—'} mpg</span>
                          </>
                        )}
                      </div>

                      {/* Host/Rating */}
                      {car.host ? (
                        <div className="flex items-center gap-3 mb-3">
                          {car.host.avatar ? (
                            <img
                              src={car.host.avatar}
                              alt={car.host.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <IoPersonOutline className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {car.host.name}
                              </span>
                              {car.host.verified && (
                                <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600" title="Verified" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              {car.rating && (
                                <>
                                  <div className="flex items-center gap-0.5">
                                    <IoStarOutline className="w-3 h-3 text-amber-500 fill-current" />
                                    <span>{car.rating.average || car.rating}</span>
                                  </div>
                                  <span>•</span>
                                </>
                              )}
                              <span>{car.host.totalTrips || car.trips || 0} trips</span>
                              {car.host.responseTime && (
                                <>
                                  <span>•</span>
                                  <span>~{car.host.responseTime}min</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : car.provider ? (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
                          <IoShieldCheckmarkOutline className="w-4 h-4" />
                          <span>{car.provider}</span>
                        </div>
                      ) : null}

                      {/* Features */}
                      {car.features && car.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {car.features.slice(0, 3).map((feature: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {car.features.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                              +{car.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${Math.round(car.dailyRate || car.totalDaily || 0)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">/day</span>
                          </div>
                          {car.originalRate && car.originalRate > car.dailyRate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              ${car.originalRate}/day
                            </div>
                          )}
                        </div>
                        {(car.totalPrice || (car.dailyRate && rentalDays)) && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {rentalDays} days
                            </div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              ${Math.round(car.totalPrice || (car.dailyRate * rentalDays))} total
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More */}
            {!isLoading && cars.length > 0 && cars.length < totalCount && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Load More Cars
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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