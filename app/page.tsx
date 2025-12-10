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
import { IoArrowForwardOutline, IoLeafOutline, IoLocationOutline } from 'react-icons/io5'

export default function RentalsPage() {
  const [esgCars, setEsgCars] = useState([])
  const [cityCars, setCityCars] = useState([])
  const [userCity, setUserCity] = useState('Phoenix')
  const [temp, setTemp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  useEffect(() => {
    const init = async () => {
      try {
        const city = 'Phoenix'
        setUserCity(city)
        setTemp(75)
        
        const [esgRes, cityRes] = await Promise.all([
          fetch('/api/rentals/search?location=Phoenix,AZ&sortBy=impactScore&limit=6'),
          fetch('/api/rentals/search?location=Phoenix,AZ&limit=6')
        ])
        
        if (!esgRes.ok || !cityRes.ok) {
          throw new Error(`API failed: ESG=${esgRes.status}, City=${cityRes.status}`)
        }
        
        const [esgData, cityData] = await Promise.all([esgRes.json(), cityRes.json()])

        const esgCarsData = esgData.results?.slice(0, 6) || []
        const cityCarsData = cityData.results?.slice(0, 6) || []
        
        setEsgCars(esgCarsData)
        setCityCars(cityCarsData)
        
      } catch (err) {
        console.error('[Homepage] Initialization error:', err)
        setUserCity('Phoenix')
        setTemp(75)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={mobileMenuOpen} setIsMobileMenuOpen={setMobileMenuOpen} />

      <div className="pt-16">
        <HeroSection userCity={userCity} temp={temp} />
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
                  Top ESG-Impact Vehicles in Phoenix
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Low emissions rentals with verified maintenance scores
                </p>
              </div>
              <Link href="/rentals/search?filter=impact" className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                View all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                esgCars.map(car => <CompactCarCard key={car.id} car={transformCar(car)} accentColor="emerald" />)
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
        <section className="py-6 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <IoLocationOutline className="w-3.5 h-3.5" />
                  Rent From Local Owners
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  P2P Rentals in {userCity}, AZ
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Luxury  rental car – rent directly from verified local hosts
                </p>
              </div>
              <Link href="/rentals/search" className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline">
                Browse all <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                cityCars.map(car => <CompactCarCard key={car.id} car={transformCar(car)} accentColor="amber" />)
              )}
            </div>
            {!isLoading && cityCars.length > 0 && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/rentals/search" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium">
                  View all cars <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
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