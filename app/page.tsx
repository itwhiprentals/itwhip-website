// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from './rentals-sections/HeroSection'
import QuickActionsBar from './rentals-sections/QuickActionsBar'
import BrowseByTypeSection from './rentals-sections/BrowseByTypeSection'
import BenefitsSection from './rentals-sections/BenefitsSection'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import MileageForensicsSection from '@/app/components/sections/MileageForensicsSection'
import InsuranceTiersSection from '@/app/components/sections/InsuranceTiersSection'
import MaxACSection from '@/app/components/sections/MaxACSection'
import ArizonaEventsSection from '@/app/components/sections/ArizonaEventsSection'
import { useUserLocation } from '@/app/hooks/useUserLocation'
import { IoArrowForwardOutline, IoLeafOutline, IoLocationOutline, IoCarSportOutline, IoMapOutline } from 'react-icons/io5'

export default function RentalsPage() {
  const [esgCars, setEsgCars] = useState([])
  const [cityCars, setCityCars] = useState([])
  const [temp, setTemp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use geolocation hook for dynamic location
  const userLocation = useUserLocation()

  // Transform API data to CompactCarCard format
  const transformCar = (car: any) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType || car.type,
    seats: car.seats,
    city: car.city || car.location?.city || 'Phoenix',
    rating: car.rating?.average ?? (car.rating != null ? Number(car.rating) : null),
    totalTrips: car.totalTrips || car.trips,
    instantBook: car.instantBook,
    photos: Array.isArray(car.photos) ? car.photos : [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto || car.host.avatar
    } : null
  })

  // Fetch cars based on user location
  useEffect(() => {
    const fetchCars = async () => {
      // Wait for location to load
      if (userLocation.isLoading) return

      try {
        setTemp(75)

        // ESG Section: Always fetch from ALL of Arizona (state-wide), sorted by impactScore
        const esgUrl = `/api/rentals/search?location=Arizona&sortBy=impactScore&limit=10`

        // P2P Section: Fetch from user's specific city if served, otherwise Arizona
        let cityUrl: string
        if (userLocation.isServedCity && userLocation.city) {
          // Exact city match for served cities
          cityUrl = `/api/rentals/search?city=${encodeURIComponent(userLocation.city)}&limit=10`
        } else {
          // State-wide search for Arizona
          cityUrl = `/api/rentals/search?location=Arizona&limit=6`
        }

        const [esgRes, cityRes] = await Promise.all([
          fetch(esgUrl),
          fetch(cityUrl)
        ])

        if (!esgRes.ok || !cityRes.ok) {
          throw new Error(`API failed: ESG=${esgRes.status}, City=${cityRes.status}`)
        }

        const [esgData, cityData] = await Promise.all([esgRes.json(), cityRes.json()])

        const rawEsgCars = esgData.results || []
        const cityCarsData = cityData.results || []

        // Get IDs of cars in the P2P section to prevent duplicates
        const cityCarIds = new Set(cityCarsData.map((car: any) => car.id))

        // Filter ESG cars to remove any that appear in P2P section
        // Show 6 cars on mobile, 5 on desktop (6th hidden via lg:hidden)
        const filteredEsgCars = rawEsgCars
          .filter((car: any) => !cityCarIds.has(car.id))
          .slice(0, 6)

        setEsgCars(filteredEsgCars)
        setCityCars(cityCarsData.slice(0, 10))

      } catch (err) {
        console.error('[Homepage] Initialization error:', err)
        setTemp(75)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCars()
  }, [userLocation.isLoading, userLocation.isServedCity, userLocation.city])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={mobileMenuOpen} setIsMobileMenuOpen={setMobileMenuOpen} />

      <div className="pt-16">
        <HeroSection userCity={userLocation.displayLocation} />
        <QuickActionsBar />
        <BrowseByTypeSection />

        {/* ESG Impact Leaders Section */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
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
              <Link href="/rentals/search?filter=impact" className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {isLoading ? (
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
                esgCars.map((car, index) => (
                  <CompactCarCard
                    key={car.id}
                    car={transformCar(car)}
                    accentColor="emerald"
                    className={index === 5 ? 'lg:hidden' : ''}
                  />
                ))
              )}
            </div>
            {!isLoading && esgCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/rentals/search?filter=impact" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium">
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
                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
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
                className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline"
              >
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {/* Loading State */}
            {isLoading && (
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
            {!isLoading && cityCars.length === 0 && userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoCarSportOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
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
            {!isLoading && cityCars.length === 0 && !userLocation.isServedCity && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <IoMapOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Explore Cars Across Arizona
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Browse peer-to-peer rentals in Phoenix, Scottsdale, Tempe, and other Arizona cities.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse All Cars <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Cars Grid - When cars are available */}
            {/* Mobile: 6 cars (3 rows x 2 cols), Desktop: 5 cars (1 row x 5 cols) */}
            {!isLoading && cityCars.length > 0 && (
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
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