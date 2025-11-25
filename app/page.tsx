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
import CarCard from '@/app/components/cards/CarCard'
import CarCardSkeleton from '@/app/components/cards/CarCardSkeleton'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(6)].map((_, i) => <CarCardSkeleton key={i} />)
              ) : (
                esgCars.map(car => <CarCard key={car.id} car={car} />)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(6)].map((_, i) => <CarCardSkeleton key={i} />)
              ) : (
                cityCars.map(car => <CarCard key={car.id} car={car} />)
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