// app/page.tsx
// Rental landing page as homepage - Enhanced with better car image handling

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from './rentals-sections/HeroSection'
import QuickActionsBar from './rentals-sections/QuickActionsBar'
import BrowseByTypeSection from './rentals-sections/BrowseByTypeSection'
import BenefitsSection from './rentals-sections/BenefitsSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { 
  IoCarOutline, 
  IoFlashOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoLocationOutline,
  IoStarSharp,
  IoCarSportOutline
} from 'react-icons/io5'

// Enhanced Image Component with better error handling
function CarImage({ car, className }: { car: any, className: string }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Enhanced image URL logic for RentalCarPhoto structure
  const getImageUrl = () => {
    console.log('Getting image for car:', car.id, car.make, car.model)
    
    // Check for RentalCarPhoto relationship (based on your Prisma structure)
    const photoSources = [
      // Prisma relation fields (common patterns)
      car.photos,           // If included as 'photos'
      car.RentalCarPhoto,   // Direct relation name
      car.carPhotos,        // Alternative relation name
      car.images,           // Alternative relation name
      
      // Single photo fields
      car.photo,
      car.image,
      car.imageUrl,
      car.photoUrl
    ]
    
    // Check each photo source
    for (const source of photoSources) {
      if (source) {
        // If it's an array of photo objects
        if (Array.isArray(source) && source.length > 0) {
          const firstPhoto = source[0]
          if (firstPhoto.url) {
            console.log('Found image URL from array:', firstPhoto.url)
            return firstPhoto.url
          }
          // If the array contains direct URL strings
          if (typeof firstPhoto === 'string') {
            console.log('Found image URL as string:', firstPhoto)
            return firstPhoto
          }
        }
        
        // If it's a single photo object
        if (typeof source === 'object' && source.url) {
          console.log('Found image URL from object:', source.url)
          return source.url
        }
        
        // If it's a direct URL string
        if (typeof source === 'string' && source.length > 0) {
          console.log('Found direct image URL:', source)
          return source
        }
      }
    }
    
    console.log('No valid image found, using brand-specific fallback for:', car.make, car.model)
    
    // High-quality brand-specific fallbacks
    const make = car.make?.toLowerCase() || ''
    const model = car.model?.toLowerCase() || ''
    
    // Luxury brands
    if (make.includes('tesla')) {
      return 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('bmw')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('mercedes')) {
      return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('audi')) {
      return 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('porsche')) {
      return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('lexus')) {
      return 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    
    // Popular brands
    if (make.includes('toyota')) {
      return 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('honda')) {
      return 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('ford')) {
      return 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('chevrolet') || make.includes('chevy')) {
      return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('nissan')) {
      return 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('hyundai')) {
      return 'https://images.unsplash.com/photo-1562141961-401595f78d6e?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (make.includes('kia')) {
      return 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    
    // Car type-based fallbacks
    if (model.includes('suv') || car.carType?.toLowerCase().includes('suv')) {
      return 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (model.includes('sedan') || car.carType?.toLowerCase().includes('sedan')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (model.includes('coupe') || car.carType?.toLowerCase().includes('coupe')) {
      return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (model.includes('convertible') || car.carType?.toLowerCase().includes('convertible')) {
      return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (model.includes('truck') || model.includes('pickup') || car.carType?.toLowerCase().includes('truck')) {
      return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center&auto=format'
    }
    if (model.includes('hatchback') || car.carType?.toLowerCase().includes('hatchback')) {
      return 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&crop=center&auto=format'
    }

    // Final fallback: Modern car
    return 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=800&h=600&fit=crop&crop=center&auto=format'
  }

  const imageUrl = getImageUrl()

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  if (imageError) {
    // Fallback content when image fails to load
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center`}>
        <div className="text-center">
          <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {car.year} {car.make} {car.model}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center absolute inset-0 z-10`}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${car.make} ${car.model} ${car.year} - Car rental`}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  )
}

// Skeleton Component for Loading Cards
function CarCardSkeleton() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700">
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="px-4 py-2.5 bg-gray-300 dark:bg-gray-600 rounded-lg w-20 h-10" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-18 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RentalsPage() {
  const [featuredCars, setFeaturedCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      const response = await fetch('/api/rentals/search?sortBy=recommended&limit=6')
      const data = await response.json()
      
      let cars = data?.results || []
      
      // COMPREHENSIVE DEBUG LOGGING - Check ALL possible image fields
      if (cars.length > 0) {
        console.log('=== FULL CAR DATA DEBUG ===')
        console.log('Complete first car object:', cars[0])
        console.log('=== IMAGE FIELDS CHECK ===')
        console.log('photos:', cars[0].photos)
        console.log('image:', cars[0].image)
        console.log('imageUrl:', cars[0].imageUrl)
        console.log('photo:', cars[0].photo)
        console.log('thumbnail:', cars[0].thumbnail)
        console.log('picture:', cars[0].picture)
        console.log('images:', cars[0].images)
        console.log('photoUrl:', cars[0].photoUrl)
        console.log('carImage:', cars[0].carImage)
        console.log('vehicleImage:', cars[0].vehicleImage)
        console.log('mainPhoto:', cars[0].mainPhoto)
        console.log('primaryImage:', cars[0].primaryImage)
        console.log('=== END DEBUG ===')
        
        // Also check if photos is an array with objects
        if (cars[0].photos && Array.isArray(cars[0].photos)) {
          console.log('Photos array length:', cars[0].photos.length)
          if (cars[0].photos.length > 0) {
            console.log('First photo object:', cars[0].photos[0])
          }
        }
      }
      
      setFeaturedCars(cars.slice(0, 6))
    } catch (error) {
      console.error('Error fetching featured cars:', error)
      setFeaturedCars([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAppClick = () => {
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        isMobileMenuOpen={mobileMenuOpen}
        setIsMobileMenuOpen={setMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
      
      <div className="pt-16">
        <HeroSection />
        <QuickActionsBar />
        <BrowseByTypeSection />
        
        {/* Featured Cars Section */}
        <section className="pt-2 pb-12 sm:pt-4 sm:pb-16 md:pt-6 md:pb-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <div>
                <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Popular Now</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-1 sm:mb-2">
                  Featured Cars
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                  Hand-picked for you
                </p>
              </div>
              <Link
                href="/rentals/search"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
              >
                View all
                <IoArrowForwardOutline className="w-5 h-5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, index) => (
                  <CarCardSkeleton key={index} />
                ))}
              </div>
            ) : featuredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredCars.map((car) => {
                  const isTraditional = car.provider_type === 'traditional'
                  const showLocalHostBadge = car.host && !car.instantBook
                  const tripCount = car.trips || car.totalTrips || car.rating?.count || 0
                  
                  const carUrl = car.make && car.model && car.year && car.city 
                    ? generateCarUrl({
                        id: car.id,
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        city: car.city || car.location?.city || 'Phoenix'
                      })
                    : `/rentals/${car.id}`
                  
                  return (
                    <Link
                      key={car.id}
                      href={carUrl}
                      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Enhanced Image Container */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                        <CarImage 
                          car={car}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        
                        {/* Gradient overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {showLocalHostBadge && (
                            <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <IoStarSharp className="w-3 h-3" />
                              LOCAL HOST
                            </span>
                          )}
                          {car.instantBook && (
                            <span className="px-3 py-1 bg-emerald-500 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <IoFlashOutline className="w-3 h-3" />
                              INSTANT BOOK
                            </span>
                          )}
                          {isTraditional && car.provider && (
                            <span className="px-3 py-1 bg-blue-600 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                              {car.provider.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3">
                          <div className="px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ${car.dailyRate || car.totalDaily}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">/day</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {car.year} {car.make} {car.model}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {car.rating && (
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <IoStarOutline
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < Math.floor(car.rating.average || car.rating)
                                          ? 'text-amber-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {typeof (car.rating.average || car.rating) === 'number' 
                                    ? (car.rating.average || car.rating).toFixed(1)
                                    : (car.rating.average || car.rating)}
                                </span>
                              </div>
                            )}
                            
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <IoCarSportOutline className="w-3.5 h-3.5" />
                              {tripCount} trips
                            </span>
                          </div>
                          
                          {car.location && car.host && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <IoLocationOutline className="w-3 h-3" />
                              {car.location.city || 'Phoenix'}
                            </span>
                          )}
                        </div>
                        
                        {car.features && Array.isArray(car.features) && (
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {car.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                              <IoLocationOutline className="w-3.5 h-3.5" />
                              {(() => {
                                if (car.location?.lat && car.location?.lng) {
                                  const userLat = 33.4484
                                  const userLng = -112.0740
                                  
                                  const R = 3959
                                  const dLat = (car.location.lat - userLat) * Math.PI / 180
                                  const dLon = (car.location.lng - userLng) * Math.PI / 180
                                  const a = 
                                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                                    Math.cos(userLat * Math.PI / 180) * Math.cos(car.location.lat * Math.PI / 180) *
                                    Math.sin(dLon/2) * Math.sin(dLon/2)
                                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                                  let distance = R * c
                                  
                                  if (distance < 1.0) {
                                    const seed = car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                                    const random = (seed % 9) / 10
                                    distance = 1.1 + random
                                  }
                                  
                                  return `${distance.toFixed(1)} miles away`
                                } else {
                                  return car.location?.city || 'Phoenix area'
                                }
                              })()}
                            </div>
                            <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold text-sm group-hover:gap-2 transition-all">
                              <span>View</span>
                              <IoArrowForwardOutline className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No featured cars available at the moment.</p>
              </div>
            )}

            {!isLoading && featuredCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
                >
                  View all cars
                  <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
        
        <BenefitsSection />
      </div>
      
      <Footer />
    </div>
  )
}