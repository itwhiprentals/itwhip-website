// app/(guest)/rentals/components/details/SimilarCars.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoCarOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoStarOutline,
  IoFlashOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoSparklesOutline
} from 'react-icons/io5'

import { formatPrivateName, isCompanyName } from '@/app/lib/utils/namePrivacy'
import { capitalizeCarMake } from '@/app/lib/utils/formatters'

interface SimilarCar {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType?: string
  city: string
  state: string
  rating?: number
  totalTrips?: number
  instantBook?: boolean
  photos?: any[]
  features?: string | string[]
  seats?: number
  transmission?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
  }
  distance?: number
  similarityScore?: number
  hostId?: string
}

interface SimilarCarsProps {
  currentCarId: string
  hostId?: string
  hostName?: string
  hostProfilePhoto?: string
  isCompany?: boolean
  carType?: string
  city: string
  dailyRate: number
  features?: string[]
  instantBook?: boolean
  location?: {
    lat?: number
    lng?: number
  }
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const actualDistance = R * c
  
  // Generate a random minimum between 1.0 and 1.9 miles
  // Use coordinates as seed for consistent randomization per car
  const seed = Math.abs(lat2 + lon2) * 10000
  const randomFactor = (seed % 10) / 10 // Gives 0.0 to 0.9
  const minDistance = 1.0 + randomFactor // Range: 1.0 to 1.9
  
  // Return the greater of actual distance or randomized minimum
  return Math.max(minDistance, actualDistance)
}

// Calculate similarity score
function calculateSimilarityScore(
  car: SimilarCar, 
  targetType?: string,
  targetPrice?: number,
  targetFeatures?: string[],
  targetInstantBook?: boolean,
  distance?: number
): number {
  let score = 0
  
  // Car type match (highest weight)
  if (targetType && car.carType?.toLowerCase() === targetType.toLowerCase()) {
    score += 30
  }
  
  // Price similarity (within 20% range)
  if (targetPrice && car.dailyRate) {
    const priceDiff = Math.abs(car.dailyRate - targetPrice)
    const pricePercent = priceDiff / targetPrice
    if (pricePercent <= 0.1) {
      score += 25 // Within 10%
    } else if (pricePercent <= 0.2) {
      score += 15 // Within 20%
    } else if (pricePercent <= 0.3) {
      score += 5 // Within 30%
    }
  }
  
  // Distance proximity (used internally for scoring, not displayed)
  if (distance !== undefined) {
    if (distance < 0.5) {
      score += 25 // Very close
    } else if (distance < 1) {
      score += 20 // Walking distance
    } else if (distance < 2) {
      score += 15 // Very nearby
    } else if (distance < 5) {
      score += 10 // Nearby
    } else if (distance < 10) {
      score += 5 // Same area
    }
  }
  
  // Instant book match
  if (targetInstantBook && car.instantBook) {
    score += 10
  }
  
  // Feature matching
  if (targetFeatures && car.features) {
    const carFeatures = Array.isArray(car.features) ? car.features : []
    const matchingFeatures = targetFeatures.filter(f => 
      carFeatures.some(cf => cf.toLowerCase().includes(f.toLowerCase()))
    )
    score += matchingFeatures.length * 2 // 2 points per matching feature
  }
  
  // Rating boost (slight preference for well-rated cars)
  if (car.rating && car.rating >= 4.5) {
    score += 5
  }
  
  return score
}

// Carousel Component that can be reused
function CarCarousel({ 
  cars, 
  scrollId,
  dailyRate,
  currentLocation
}: { 
  cars: SimilarCar[]
  scrollId: string
  dailyRate: number
  currentLocation?: { lat?: number; lng?: number }
}) {
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(scrollId)
    if (container) {
      const scrollAmount = 320 // Width of one card plus gap
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      setScrollPosition(newPosition)
    }
  }
  
  return (
    <>
      {/* Scroll controls for desktop */}
      <div className="hidden lg:flex items-center gap-2 mb-4 justify-end">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          disabled={scrollPosition === 0}
        >
          <IoChevronBackOutline className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      </div>
      
      {/* Cars carousel */}
      <div 
        id={scrollId}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {cars.map((car) => {
          // Calculate distance for this car if we have locations
          let displayDistance: number | undefined
          if (currentLocation?.lat && currentLocation?.lng && car.location?.lat && car.location?.lng) {
            displayDistance = calculateDistance(
              currentLocation.lat,
              currentLocation.lng,
              car.location.lat,
              car.location.lng
            )
          }
          
          return (
            <Link
              key={car.id}
              href={`/rentals/${car.id}`}
              className="flex-shrink-0 w-72 group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                {/* Car image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {car.photos && car.photos[0] ? (
                    <img
                      src={car.photos[0].url || car.photos[0]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoCarOutline className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                    {(car as any).vehicleType?.toUpperCase() === 'RIDESHARE' ? (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                        <IoCarSportOutline className="w-3 h-3" />
                        Rideshare
                      </span>
                    ) : car.instantBook && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                        <IoFlashOutline className="w-3 h-3" />
                        Instant
                      </span>
                    )}
                    {car.similarityScore && car.similarityScore >= 70 && (
                      <span className="px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        Best Match
                      </span>
                    )}
                  </div>
                  
                  {/* Bottom location badges */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    {/* Distance badge on left */}
                    {displayDistance && (
                      <div className="px-2 py-1 bg-amber-600/90 backdrop-blur text-white text-xs font-semibold rounded-full shadow-lg">
                        {displayDistance.toFixed(1)} mi
                      </div>
                    )}
                    
                    {/* City badge on right */}
                    <div className="px-2 py-1 bg-black/80 backdrop-blur text-white text-xs rounded-full flex items-center gap-1 shadow-lg ml-auto">
                      <IoLocationOutline className="w-3 h-3" />
                      {car.city}
                    </div>
                  </div>
                </div>
                
                {/* Car details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {car.year} {capitalizeCarMake(car.make)} {car.model}
                  </h3>
                  
                  {/* New clean display structure */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 -ml-2">
                    {car.rating && car.rating > 0 && car.totalTrips && car.totalTrips > 0 ? (
                      <div className="flex items-center gap-2 ml-2">
                        <div className="flex items-center gap-1">
                          <IoStarOutline className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          <span className="font-medium">{car.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({car.totalTrips} trips)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                          <span className="font-medium text-green-700 dark:text-green-300">New listing</span>
                          <span className="text-xs text-green-600 dark:text-green-400">• Book and save 5%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${Math.round(car.dailyRate)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        /day
                      </span>
                    </div>
                    
                    {/* Show price difference */}
                    {Math.abs(car.dailyRate - dailyRate) > 5 && (
                      <span className={`text-xs font-medium ${
                        car.dailyRate < dailyRate 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {car.dailyRate < dailyRate 
                          ? `$${Math.round(dailyRate - car.dailyRate)} less` 
                          : `$${Math.round(car.dailyRate - dailyRate)} more`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default function SimilarCars({ 
  currentCarId, 
  hostId,
  hostName,
  hostProfilePhoto,
  isCompany,
  carType, 
  city, 
  dailyRate,
  features = [],
  instantBook,
  location
}: SimilarCarsProps) {
  const [hostCars, setHostCars] = useState<SimilarCar[]>([])
  const [similarCars, setSimilarCars] = useState<SimilarCar[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHost, setLoadingHost] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Format the display name using privacy rules
  const displayName = formatPrivateName(hostName || 'Host', isCompany)
  const isCompanyHost = isCompany || isCompanyName(hostName || '')

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Default to Phoenix center if location denied
          setUserLocation({
            lat: 33.4484,
            lng: -112.0740
          })
        }
      )
    }
  }, [])

  // Fetch host's other cars
  useEffect(() => {
    if (hostId) {
      fetchHostCars()
    } else {
      setLoadingHost(false)
    }
  }, [hostId, currentCarId])

  // Fetch similar cars
  useEffect(() => {
    fetchSimilarCars()
  }, [currentCarId, carType, city])

  const fetchHostCars = async () => {
    if (!hostId) {
      setLoadingHost(false)
      return
    }
    
    try {
      setLoadingHost(true)
      
      // Build query params for host's other cars
      const params = new URLSearchParams({
        hostId: hostId,
        exclude: currentCarId, // Exclude the current car
        limit: '10' // Get up to 10 cars from the same host
      })
      
      console.log('Fetching host cars with params:', params.toString())
      
      const response = await fetch(`/api/rentals/host-cars?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Host cars API response:', data)
        
        // The API returns { cars: [...], count: X }
        if (data && data.cars && Array.isArray(data.cars)) {
          console.log('Host has', data.cars.length, 'other cars')
          
          // Sort host cars by price similarity to current car
          const sortedHostCars = data.cars.sort((a: SimilarCar, b: SimilarCar) => {
            const aDiff = Math.abs(a.dailyRate - dailyRate)
            const bDiff = Math.abs(b.dailyRate - dailyRate)
            return aDiff - bDiff
          })
          
          setHostCars(sortedHostCars)
        } else {
          console.log('No cars array in response or empty')
          setHostCars([])
        }
      } else {
        console.log('Failed to fetch host cars:', response.status)
        setHostCars([])
      }
    } catch (error) {
      console.error('Error fetching host cars:', error)
      setHostCars([])
    } finally {
      setLoadingHost(false)
    }
  }

  const fetchSimilarCars = async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams({
        exclude: currentCarId,
        city: city,
        limit: '12' // Get more to filter down to best matches
      })
      
      // Add optional filters
      if (carType) params.append('carType', carType)
      // If we have a hostId, exclude all cars from this host from similar cars
      if (hostId) params.append('excludeHost', hostId)
      
      console.log('Fetching similar cars with params:', params.toString())
      
      const response = await fetch(`/api/rentals/similar?${params.toString()}`)
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const cars = await response.json()
        
        console.log('Received cars from API:', cars.length, cars)
        
        // Calculate distances and similarity scores
        const carsWithScores = cars.map((car: SimilarCar) => {
          let distance: number | undefined
          
          // Calculate distance if we have coordinates
          if (location?.lat && location?.lng && car.location?.lat && car.location?.lng) {
            distance = calculateDistance(
              location.lat,
              location.lng,
              car.location.lat,
              car.location.lng
            )
          } else if (userLocation && car.location?.lat && car.location?.lng) {
            // Fallback to user location
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              car.location.lat,
              car.location.lng
            )
          }
          
          const similarityScore = calculateSimilarityScore(
            car,
            carType,
            dailyRate,
            features,
            instantBook,
            distance
          )
          
          return {
            ...car,
            distance,
            similarityScore
          }
        })
        
        // Sort by similarity score and take top 8
        const sortedCars = carsWithScores
          .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
          .slice(0, 8)
        
        setSimilarCars(sortedCars)
      }
    } catch (error) {
      console.error('Error fetching similar cars:', error)
      setSimilarCars([])
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  )

  // Don't render anything if no cars to show
  if (!loadingHost && hostCars.length === 0 && !loading && similarCars.length === 0) {
    return null
  }

  return (
    <>
      {/* Host's Other Cars Section */}
      {hostId && (hostCars.length > 0 || loadingHost) && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3 pl-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
              {/* Host profile photo or fallback icon */}
              {hostProfilePhoto ? (
                <img 
                  src={hostProfilePhoto} 
                  alt={displayName} 
                  className="w-5 h-5 rounded-full object-cover"
                  style={{ width: '20px', height: '20px' }}
                />
              ) : isCompanyHost ? (
                <IoBusinessOutline className="w-5 h-5" />
              ) : (
                <IoPersonOutline className="w-5 h-5" />
              )}
              
              {/* Title text with privacy-protected name */}
              {isCompanyHost ? (
                <>More from {displayName}</>
              ) : (
                <>{displayName ? `${displayName}'s` : "Host's"} Other Whips</>
              )}
              
              {/* Premium Fleet Badge if host has luxury cars */}
              {hostCars.some(car => 
                car.carType?.toLowerCase() === 'luxury' || 
                car.carType?.toLowerCase() === 'exotic' ||
                car.dailyRate > 200
              ) && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium Fleet
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isCompanyHost 
                ? 'Explore more vehicles from our fleet'
                : 'Check out more cars from this trusted host'
              }
            </p>
          </div>

          {loadingHost ? (
            <LoadingSkeleton />
          ) : (
            <CarCarousel 
              cars={hostCars} 
              scrollId="host-cars-container"
              dailyRate={dailyRate}
              currentLocation={location || userLocation}
            />
          )}
        </div>
      )}

      {/* Similar Cars Section */}
      {(similarCars.length > 0 || loading) && (
        <div className={`${hostCars.length > 0 ? 'pt-6' : 'pt-6 border-t border-gray-200 dark:border-gray-700'} pb-6`}>
          <div className="pl-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mb-1">
              <IoCarOutline className="w-4 h-4" />
              Similar cars nearby from other hosts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              More great options in {city} from different hosts
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <CarCarousel 
              cars={similarCars} 
              scrollId="similar-cars-container"
              dailyRate={dailyRate}
              currentLocation={location || userLocation}
            />
          )}
        </div>
      )}

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}