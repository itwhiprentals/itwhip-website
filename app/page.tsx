// app/page.tsx
// Rental landing page as homepage - Updated with consistent rounded-lg (8px)

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from './rentals-sections/HeroSection'
import QuickActionsBar from './rentals-sections/QuickActionsBar'
import BrowseByTypeSection from './rentals-sections/BrowseByTypeSection'
import BenefitsSection from './rentals-sections/BenefitsSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import { 
  IoCarOutline, 
  IoFlashOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoLocationOutline,
  IoStarSharp,
  IoCarSportOutline
} from 'react-icons/io5'

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
        {/* Title */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
        
        {/* Rating and Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Features */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-18 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Bottom Section */}
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
      setFeaturedCars(cars.slice(0, 6))
    } catch (error) {
      console.error('Error fetching featured cars:', error)
      setFeaturedCars([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAppClick = () => {
    // Handle get app click
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    // Handle search click
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
      
      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        <HeroSection />
        <QuickActionsBar />
        <BrowseByTypeSection />
        
        {/* Featured Cars Section - Minimal top padding to eliminate gap */}
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

            {/* Show Skeletons while loading */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, index) => (
                  <CarCardSkeleton key={index} />
                ))}
              </div>
            ) : featuredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredCars.map((car) => {
                  // Get the image URL properly
                  const imageUrl = car.photos?.[0]?.url || 
                                  car.photos?.[0] || 
                                  (car.provider === 'Enterprise' ? 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop' :
                                   car.provider === 'Hertz' ? 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&h=600&fit=crop' :
                                   'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop')
                  
                  const isTraditional = car.provider_type === 'traditional'
                  
                  // SECURITY FIX: Use business logic instead of source field
                  // Show "LOCAL HOST" badge for non-instant book listings with a host
                  // This naturally includes your managed cars that need to appear as P2P
                  const showLocalHostBadge = car.host && !car.instantBook
                  
                  // Alternative business logic options (choose based on your needs):
                  // const showLocalHostBadge = car.host && car.dailyRate > 400  // Luxury vehicles
                  // const showLocalHostBadge = car.host && car.host?.isVerified  // Verified hosts only
                  // const showLocalHostBadge = false  // Remove the badge entirely
                  
                  const tripCount = car.trips || car.totalTrips || car.rating?.count || 0
                  
                  return (
                    <Link
                      key={car.id}
                      href={`/rentals/${car.id}`}
                      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Image Container with Gradient Overlay */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`${car.make} ${car.model}`}
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
                        
                        {/* Price Badge - More prominent */}
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
                        {/* Car Title */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {car.year} {car.make} {car.model}
                        </h3>
                        
                        {/* Rating and Location Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Rating */}
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
                            
                            {/* Trip Count - Now showing */}
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <IoCarSportOutline className="w-3.5 h-3.5" />
                              {tripCount} trips
                            </span>
                          </div>
                          
                          {/* Location for listings with hosts */}
                          {car.location && car.host && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <IoLocationOutline className="w-3 h-3" />
                              {car.location.city || 'Phoenix'}
                            </span>
                          )}
                        </div>
                        
                        {/* Features Pills */}
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
                        
                        {/* Action Button - Enhanced border visibility with distance */}
                        <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                              <IoLocationOutline className="w-3.5 h-3.5" />
                              {(() => {
                                // Calculate distance if coordinates are available
                                if (car.location?.lat && car.location?.lng) {
                                  // Default Phoenix coordinates (you can get user's actual location)
                                  const userLat = 33.4484
                                  const userLng = -112.0740
                                  
                                  // Haversine formula for distance calculation
                                  const R = 3959 // Earth radius in miles
                                  const dLat = (car.location.lat - userLat) * Math.PI / 180
                                  const dLon = (car.location.lng - userLng) * Math.PI / 180
                                  const a = 
                                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                                    Math.cos(userLat * Math.PI / 180) * Math.cos(car.location.lat * Math.PI / 180) *
                                    Math.sin(dLon/2) * Math.sin(dLon/2)
                                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                                  let distance = R * c
                                  
                                  // Privacy protection: Never show less than 1 mile
                                  if (distance < 1.0) {
                                    // Randomize between 1.1 and 1.9 for privacy
                                    // Use car ID as seed for consistent random per car
                                    const seed = car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                                    const random = (seed % 9) / 10 // Gives 0.0 to 0.8
                                    distance = 1.1 + random // Range: 1.1 to 1.9
                                  }
                                  
                                  return `${distance.toFixed(1)} miles away`
                                } else {
                                  // Fallback to city if no coordinates
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
              // Empty state when no cars are found
              <div className="text-center py-12">
                <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No featured cars available at the moment.</p>
              </div>
            )}

            {/* Mobile View All */}
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