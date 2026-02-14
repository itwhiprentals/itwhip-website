// app/(guest)/rentals/components/details/SimilarCars.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
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
  IoStarSharp
} from 'react-icons/io5'

import { formatPrivateName, isCompanyName } from '@/app/lib/utils/namePrivacy'
import { optimizeImageUrl } from '@/app/lib/utils/imageOptimization'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { formatRating, isNewListing } from '@/app/lib/utils/formatCarSpecs'

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
  host?: {
    name?: string
    profilePhoto?: string
    isVerified?: boolean
  }
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
  // SSR-fetched initial data for SEO (Google can see these links in page source)
  initialSimilarCars?: SimilarCar[]
  initialHostCars?: SimilarCar[]
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const actualDistance = R * c
  
  const seed = Math.abs(lat2 + lon2) * 10000
  const randomFactor = (seed % 10) / 10
  const minDistance = 1.0 + randomFactor
  
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
  
  if (targetType && car.carType?.toLowerCase() === targetType.toLowerCase()) {
    score += 30
  }
  
  if (targetPrice && car.dailyRate) {
    const priceDiff = Math.abs(car.dailyRate - targetPrice)
    const pricePercent = priceDiff / targetPrice
    if (pricePercent <= 0.1) {
      score += 25
    } else if (pricePercent <= 0.2) {
      score += 15
    } else if (pricePercent <= 0.3) {
      score += 5
    }
  }
  
  if (distance !== undefined) {
    if (distance < 0.5) {
      score += 25
    } else if (distance < 1) {
      score += 20
    } else if (distance < 2) {
      score += 15
    } else if (distance < 5) {
      score += 10
    } else if (distance < 10) {
      score += 5
    }
  }
  
  if (targetInstantBook && car.instantBook) {
    score += 10
  }
  
  if (targetFeatures && car.features) {
    const carFeatures = Array.isArray(car.features) ? car.features : []
    const matchingFeatures = targetFeatures.filter(f => 
      carFeatures.some(cf => cf.toLowerCase().includes(f.toLowerCase()))
    )
    score += matchingFeatures.length * 2
  }
  
  if (car.rating && car.rating >= 4.5) {
    score += 5
  }
  
  return score
}

// Updated CarCard Component matching city page design
function CarCard({ 
  car, 
  currentLocation,
  currentCarPrice 
}: { 
  car: SimilarCar
  currentLocation?: { lat?: number; lng?: number }
  currentCarPrice: number
}) {
  const t = useTranslations('SimilarCars')
  const rawImageUrl = car.photos?.[0]?.url || car.photos?.[0] ||
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop&fm=webp&q=80'
  const imageUrl = optimizeImageUrl(rawImageUrl as string, 400)
  
  // Calculate distance for this car
  let displayDistance: number | undefined
  if (currentLocation?.lat && currentLocation?.lng && car.location?.lat && car.location?.lng) {
    displayDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      car.location.lat,
      car.location.lng
    )
  }
  
  const priceDifference = Math.abs(car.dailyRate - currentCarPrice)
  const showPriceDifference = priceDifference > 5
  
  return (
    <Link
      href={`/rentals/${car.id}`}
      className="flex-shrink-0 w-64 sm:w-72 group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image Container - Compact rectangular */}
      <div className="relative h-24 sm:h-28 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Price comparison badge - Top left */}
        {showPriceDifference && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 backdrop-blur-sm text-white text-[11px] font-bold rounded-full ${
              car.dailyRate < currentCarPrice 
                ? 'bg-green-600/90' 
                : 'bg-gray-700/80'
            }`}>
              ${Math.round(priceDifference)} {car.dailyRate < currentCarPrice ? t('less') : t('more')}
            </span>
          </div>
        )}
        
        {/* Best Match badge if applicable - only show if no price difference badge */}
        {!showPriceDifference && car.similarityScore && car.similarityScore >= 70 && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-amber-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
              {t('bestMatch')}
            </span>
          </div>
        )}
        
        {/* Distance badge - if applicable */}
        {displayDistance && (
          <div className="absolute bottom-2 left-2">
            <div className="px-2 py-0.5 bg-amber-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
              {displayDistance.toFixed(1)} {t('mi')}
            </div>
          </div>
        )}
        
        {/* Price Badge - Bottom right */}
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-md shadow-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${Math.round(car.dailyRate)}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('perDay')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content - Compact */}
      <div className="p-3">
        {/* Title - Make and Model on separate lines */}
        <div className="mb-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 flex items-center justify-between">
            <span>{car.year} {capitalizeCarMake(car.make)}</span>
            {(car as any).vehicleType?.toUpperCase() === 'RIDESHARE' ? (
              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                <IoCarSportOutline className="w-2.5 h-2.5" />
                {t('rideshare')}
              </span>
            ) : car.instantBook && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                <IoFlashOutline className="w-2.5 h-2.5" />
                {t('instant')}
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
            {normalizeModelName(car.model, car.make)}
          </div>
        </div>
        
        {/* Car Type, Seats, Rating & Trips - All in one row */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="capitalize">{car.carType?.toLowerCase() || 'sedan'}</span>
            <span>•</span>
            <span>{car.seats || 5} {t('seats')}</span>
            {!isNewListing(car.totalTrips) && (
              <>
                <span>•</span>
                {car.rating && car.rating > 0 ? (
                  <div className="flex items-center gap-0.5">
                    <IoStarOutline className="w-2.5 h-2.5 text-amber-400 fill-current" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatRating(car.rating)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">{t('noReviewsYet')}</span>
                )}
              </>
            )}
          </div>
          {/* Trips or New Listing - Far right */}
          <span className="text-[10px]">
            {isNewListing(car.totalTrips) ? (
              <span className="text-green-600 dark:text-green-400 font-medium">{t('newListing')}</span>
            ) : (
              `(${car.totalTrips} ${car.totalTrips === 1 ? t('trip') : t('trips')})`
            )}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Updated Carousel Component
function CarCarousel({ 
  cars, 
  scrollId,
  currentLocation,
  currentCarPrice
}: { 
  cars: SimilarCar[]
  scrollId: string
  currentLocation?: { lat?: number; lng?: number }
  currentCarPrice: number
}) {
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(scrollId)
    if (container) {
      const scrollAmount = 280 // Adjusted for new card width
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
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {cars.map((car) => (
          <CarCard 
            key={car.id} 
            car={car} 
            currentLocation={currentLocation}
            currentCarPrice={currentCarPrice}
          />
        ))}
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
  location,
  initialSimilarCars,
  initialHostCars
}: SimilarCarsProps) {
  const t = useTranslations('SimilarCars')
  // Initialize state with SSR data if provided (for SEO - Google sees these in page source)
  const [hostCars, setHostCars] = useState<SimilarCar[]>(initialHostCars || [])
  const [similarCars, setSimilarCars] = useState<SimilarCar[]>(initialSimilarCars || [])
  // If initial data provided, start with loading=false so content renders immediately
  const [loading, setLoading] = useState(!initialSimilarCars)
  const [loadingHost, setLoadingHost] = useState(!initialHostCars)
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
          setUserLocation({
            lat: 33.4484,
            lng: -112.0740
          })
        }
      )
    }
  }, [])

  // Fetch host's other cars - skip if SSR data provided
  useEffect(() => {
    // If we have SSR data, don't re-fetch
    if (initialHostCars && initialHostCars.length > 0) {
      return
    }
    if (hostId) {
      fetchHostCars()
    } else {
      setLoadingHost(false)
    }
  }, [hostId, currentCarId])

  // Fetch similar cars - skip if SSR data provided
  useEffect(() => {
    // If we have SSR data, don't re-fetch
    if (initialSimilarCars && initialSimilarCars.length > 0) {
      return
    }
    fetchSimilarCars()
  }, [currentCarId, carType, city])

  const fetchHostCars = async () => {
    if (!hostId) {
      setLoadingHost(false)
      return
    }
    
    try {
      setLoadingHost(true)
      
      const params = new URLSearchParams({
        hostId: hostId,
        exclude: currentCarId,
        limit: '10'
      })
      
      const response = await fetch(`/api/rentals/host-cars?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data && data.cars && Array.isArray(data.cars)) {
          const sortedHostCars = data.cars.sort((a: SimilarCar, b: SimilarCar) => {
            const aDiff = Math.abs(a.dailyRate - dailyRate)
            const bDiff = Math.abs(b.dailyRate - dailyRate)
            return aDiff - bDiff
          })
          
          setHostCars(sortedHostCars)
        } else {
          setHostCars([])
        }
      } else {
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
      
      const params = new URLSearchParams({
        exclude: currentCarId,
        city: city,
        limit: '12'
      })
      
      if (carType) params.append('carType', carType)
      if (hostId) params.append('excludeHost', hostId)
      
      const response = await fetch(`/api/rentals/similar?${params.toString()}`)
      
      if (response.ok) {
        const cars = await response.json()
        
        const carsWithScores = cars.map((car: SimilarCar) => {
          let distance: number | undefined
          
          if (location?.lat && location?.lng && car.location?.lat && car.location?.lng) {
            distance = calculateDistance(
              location.lat,
              location.lng,
              car.location.lat,
              car.location.lng
            )
          } else if (userLocation && car.location?.lat && car.location?.lng) {
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
        
        const sortedCars = carsWithScores
          .sort((a: any, b: any) => (b.similarityScore || 0) - (a.similarityScore || 0))
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

  // Loading skeleton - Updated to match new card dimensions
  const LoadingSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64 sm:w-72 animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24 sm:h-28 mb-3" />
          <div className="px-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

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

              {isCompanyHost ? (
                <>{t('moreFrom', { name: displayName })}</>
              ) : (
                <>{displayName ? t('hostsOtherWhips', { name: displayName }) : t('hostsOtherWhipsFallback')}</>
              )}

              {hostCars.some(car =>
                car.carType?.toLowerCase() === 'luxury' ||
                car.carType?.toLowerCase() === 'exotic' ||
                car.dailyRate > 200
              ) && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('premiumFleet')}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isCompanyHost
                ? t('exploreMoreVehicles')
                : t('checkOutMoreCars')
              }
            </p>
          </div>

          {loadingHost ? (
            <LoadingSkeleton />
          ) : (
            <CarCarousel
              cars={hostCars}
              scrollId="host-cars-container"
              currentLocation={location ?? userLocation ?? undefined}
              currentCarPrice={dailyRate}
            />
          )}
        </div>
      )}

      {/* Similar Cars Section */}
      {(similarCars.length > 0 || loading) && (
        <div className={`${hostCars.length > 0 ? 'pt-6' : 'pt-6 border-t border-gray-200 dark:border-gray-700'}`}>
          <div className="pl-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-1.5 mb-1">
              <IoCarOutline className="w-4 h-4" />
              {t('similarCarsNearby')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t('moreGreatOptions', { city })}
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <CarCarousel
              cars={similarCars}
              scrollId="similar-cars-container"
              currentLocation={location ?? userLocation ?? undefined}
              currentCarPrice={dailyRate}
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