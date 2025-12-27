// app/components/home/HomeClient.tsx
// Client component for homepage with SSR hydration

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from '@/app/rentals-sections/HeroSection'
import QuickActionsBar from '@/app/rentals-sections/QuickActionsBar'
import BrowseByTypeSection from '@/app/rentals-sections/BrowseByTypeSection'
import BenefitsSection from '@/app/rentals-sections/BenefitsSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import MileageForensicsSection from '@/app/components/sections/MileageForensicsSection'
import InsuranceTiersSection from '@/app/components/sections/InsuranceTiersSection'
import MaxACSection from '@/app/components/sections/MaxACSection'
import ArizonaEventsSection from '@/app/components/sections/ArizonaEventsSection'
import { useUserLocation } from '@/app/hooks/useUserLocation'
import { IoArrowForwardOutline, IoLeafOutline, IoLocationOutline, IoCarSportOutline, IoMapOutline } from 'react-icons/io5'
import type { HomePageCar } from '@/app/lib/server/fetchHomeData'

interface HomeClientProps {
  initialEsgCars: HomePageCar[]
  initialCityCars: HomePageCar[]
}

export default function HomeClient({ initialEsgCars, initialCityCars }: HomeClientProps) {
  // Initialize with server-rendered data (no empty state!)
  const [esgCars, setEsgCars] = useState<HomePageCar[]>(initialEsgCars)
  const [cityCars, setCityCars] = useState<HomePageCar[]>(initialCityCars)
  const [isLoading, setIsLoading] = useState(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  // Use geolocation hook for progressive enhancement
  const userLocation = useUserLocation()

  // Transform car data for CompactCarCard compatibility
  const transformCar = (car: HomePageCar) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: car.dailyRate,
    carType: car.carType,
    seats: car.seats,
    city: car.city,
    rating: car.rating,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos,
    esgScore: car.esgScore,
    fuelType: car.fuelType,
    host: car.host
  })

  // Progressive enhancement: refresh P2P cars when user city is detected
  useEffect(() => {
    // Only refresh once, and only if we have a served city
    if (hasRefreshed || userLocation.isLoading || !userLocation.isServedCity || !userLocation.city) {
      return
    }

    const refreshCityCars = async () => {
      try {
        setIsLoading(true)
        const cityUrl = `/api/rentals/search?city=${encodeURIComponent(userLocation.city)}&limit=10`
        const res = await fetch(cityUrl)

        if (res.ok) {
          const data = await res.json()
          const cityData = data.results || []

          if (cityData.length > 0) {
            // Transform API response to match HomePageCar shape
            const transformedCars = cityData.map((car: any) => ({
              id: car.id,
              make: car.make,
              model: car.model,
              year: car.year,
              dailyRate: Number(car.dailyRate),
              carType: car.carType || car.type,
              seats: car.seats,
              city: car.city || car.location?.city || 'Phoenix',
              rating: car.totalTrips > 0 ? (car.rating?.average ?? car.rating) : null,
              totalTrips: car.totalTrips || 0,
              instantBook: car.instantBook,
              photos: Array.isArray(car.photos) ? car.photos : [],
              esgScore: car.esgScore,
              fuelType: car.fuelType,
              host: car.host ? {
                name: car.host.name,
                profilePhoto: car.host.profilePhoto || car.host.avatar || null
              } : null
            }))

            setCityCars(transformedCars.slice(0, 10))

            // Also filter ESG cars to remove duplicates
            const cityCarIds = new Set(transformedCars.map((c: HomePageCar) => c.id))
            setEsgCars(prev => prev.filter(c => !cityCarIds.has(c.id)).slice(0, 6))
          }
        }
      } catch (err) {
        console.error('[HomeClient] City refresh error:', err)
      } finally {
        setIsLoading(false)
        setHasRefreshed(true)
      }
    }

    refreshCityCars()
  }, [userLocation.isLoading, userLocation.isServedCity, userLocation.city, hasRefreshed])

  // Show loading skeleton only during initial SSR hydration mismatch or refresh
  const showSkeleton = isLoading && cityCars.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-16">
        <HeroSection userCity={userLocation.displayLocation} />
        <QuickActionsBar />
        <BrowseByTypeSection />

        {/* ESG Impact Leaders Section */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <IoLeafOutline className="w-3.5 h-3.5" />
                  ESG Impact Leaders
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  Top ESG-Impact Vehicles in Arizona
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Low emissions rentals with verified maintenance scores
                </p>
              </div>
              <Link href="/rentals/search?filter=impact" className="hidden sm:flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {esgCars.length === 0 ? (
                // Skeleton only when truly empty
                [...Array(6)].map((_, i) => (
                  <div key={i} className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse ${i === 5 ? 'lg:hidden' : ''}`}>
                    <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                esgCars.slice(0, 6).map((car, index) => (
                  <CompactCarCard
                    key={car.id}
                    car={transformCar(car)}
                    accentColor="emerald"
                    className={index === 5 ? 'lg:hidden' : ''}
                  />
                ))
              )}
            </div>
            {esgCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/rentals/search?filter=impact" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-lg font-medium">
                  View all Impact Leaders <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Local P2P Rentals Section */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <IoLocationOutline className="w-3.5 h-3.5" />
                  Rent From Local Owners
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  P2P Rentals in {userLocation.displayLocationFull}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Rent directly from verified local hosts
                </p>
              </div>
              <Link
                href="/rentals/cities"
                className="hidden sm:flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {/* Loading State */}
            {showSkeleton && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State - No cars in this city */}
            {!showSkeleton && cityCars.length === 0 && userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoCarSportOutline className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No cars available in {userLocation.city} yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Be the first host to list your car in {userLocation.city} and start earning up to 90% of each rental.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/host/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                  >
                    <IoCarSportOutline className="w-5 h-5" />
                    List Your Car
                  </Link>
                  <Link
                    href="/rentals/search"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IoMapOutline className="w-5 h-5" />
                    View Other Cities
                  </Link>
                </div>
              </div>
            )}

            {/* Empty State - Generic Arizona (no specific city) */}
            {!showSkeleton && cityCars.length === 0 && !userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoMapOutline className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Explore Cars Across Arizona
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Browse peer-to-peer rentals in Phoenix, Scottsdale, Tempe, and other Arizona cities.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                >
                  Browse All Cars <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Cars Grid - When cars are available */}
            {!showSkeleton && cityCars.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {cityCars.slice(0, 6).map((car, index) => (
                    <CompactCarCard
                      key={car.id}
                      car={transformCar(car)}
                      accentColor="amber"
                      className={index === 5 ? 'lg:hidden' : ''}
                    />
                  ))}
                </div>

                {/* Mobile Browse All button */}
                <div className="flex justify-center mt-6 lg:hidden">
                  <Link
                    href="/rentals/cities"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Browse All <IoArrowForwardOutline className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section Components - P2P Focused */}
        <BenefitsSection />
        <InsuranceTiersSection />
        <MileageForensicsSection />
        <MaxACSection />
        <ArizonaEventsSection />
      </div>

      <Footer />
    </div>
  )
}
