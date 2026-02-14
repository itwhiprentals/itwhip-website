// app/components/home/HomeClient.tsx
// Client component for homepage with SSR hydration

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import HeroSection from '@/app/rentals-sections/HeroSection'
import QuickActionsBar from '@/app/rentals-sections/QuickActionsBar'
import BrowseByTypeSection from '@/app/rentals-sections/BrowseByTypeSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import InsuranceTiersSection from '@/app/components/sections/InsuranceTiersSection'
import TrackingSection from '@/app/components/sections/TrackingSection'
import ArizonaEventsSection from '@/app/components/sections/ArizonaEventsSection'
import { useUserLocation } from '@/app/hooks/useUserLocation'
import { IoArrowForwardOutline, IoLeafOutline, IoLocationOutline, IoCarSportOutline, IoMapOutline } from 'react-icons/io5'
import type { HomePageCar } from '@/app/lib/server/fetchHomeData'

interface HomeClientProps {
  initialEsgCars: HomePageCar[]
  initialCityCars: HomePageCar[]
}

export default function HomeClient({ initialEsgCars, initialCityCars }: HomeClientProps) {
  const t = useTranslations('Home')

  // Initialize with server-rendered data (no empty state!)
  const [esgCars, setEsgCars] = useState<HomePageCar[]>(initialEsgCars)
  const [cityCars, setCityCars] = useState<HomePageCar[]>(initialCityCars)
  const [isLoading, setIsLoading] = useState(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  // Use geolocation hook for progressive enhancement
  const userLocation = useUserLocation()

  // GUARD: Ensure no car appears in both sections (extra safety on top of server deduplication)
  const deduplicatedCityCars = useMemo(() => {
    const esgCarIds = new Set(esgCars.map(c => c.id))
    return cityCars.filter(c => !esgCarIds.has(c.id))
  }, [esgCars, cityCars])

  // Transform car data for CompactCarCard compatibility
  const transformCar = (car: HomePageCar) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: car.dailyRate,
    carType: car.carType,
    vehicleType: car.vehicleType,  // For rideshare badge
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

  // Skip client-side refresh - use server-rendered cars for consistent rotation
  // The server already provides fresh, randomly shuffled cars on each request
  // Client-side refresh was causing cars to "flash" and revert to API data
  useEffect(() => {
    // Mark as refreshed immediately to prevent any refresh attempts
    setHasRefreshed(true)
  }, [])

  // Show loading skeleton only during initial SSR hydration mismatch or refresh
  const showSkeleton = isLoading && deduplicatedCityCars.length === 0

  return (
    <>
      {/* iOS Safari bars pick up body background — match Header (bg-white / gray-900) */}
      <style jsx global>{`
        body:has(.home-page) {
          background-color: #ffffff !important;
        }
        html.dark body:has(.home-page) {
          background-color: #111827 !important;
        }
      `}</style>

    <main className="home-page min-h-screen bg-gray-50 dark:bg-gray-900">
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
                  {t('esgLabel')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {t('esgHeading')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('esgDescription')}
                </p>
              </div>
              <Link href="/rentals/search?filter=impact" className="hidden sm:flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
                {t('viewAll')} <IoArrowForwardOutline className="w-4 h-4" />
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
                  {t('viewAllImpactLeaders')} <IoArrowForwardOutline className="w-5 h-5" />
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
                  {t('p2pLabel')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {t('p2pHeading', { location: userLocation.displayLocationFull })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('p2pDescription')}
                </p>
              </div>
              <Link
                href="/rentals/cities"
                className="hidden sm:flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                {t('viewAll')} <IoArrowForwardOutline className="w-4 h-4" />
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
            {!showSkeleton && deduplicatedCityCars.length === 0 && userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoCarSportOutline className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('noCarsInCity', { city: userLocation.city })}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t('beFirstHost', { city: userLocation.city })}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/host/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                  >
                    <IoCarSportOutline className="w-5 h-5" />
                    {t('listYourCar')}
                  </Link>
                  <Link
                    href="/rentals/search"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IoMapOutline className="w-5 h-5" />
                    {t('viewOtherCities')}
                  </Link>
                </div>
              </div>
            )}

            {/* Empty State - Generic Arizona (no specific city) */}
            {!showSkeleton && deduplicatedCityCars.length === 0 && !userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoMapOutline className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('exploreCarsArizona')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t('browseP2PRentals')}
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                >
                  {t('browseAllCars')} <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Cars Grid - When cars are available */}
            {!showSkeleton && deduplicatedCityCars.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {deduplicatedCityCars.slice(0, 6).map((car, index) => (
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
                    {t('browseAll')} <IoArrowForwardOutline className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section Components - P2P Focused */}
        <InsuranceTiersSection />

        {/* Separator */}
        <div className="max-w-5xl mx-auto px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        <TrackingSection />

        {/* Separator */}
        <div className="max-w-5xl mx-auto px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        <ArizonaEventsSection />
      </div>

      <Footer />
    </main>
    </>
  )
}
