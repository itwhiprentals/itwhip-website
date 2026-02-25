// app/rentals-sections/BrowseByTypeSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { IoArrowForwardOutline, IoCarOutline } from 'react-icons/io5'
import { capitalizeCarMake } from '@/app/lib/utils/formatters'

interface CarData {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType: string
  vehicleType?: string | null // For rideshare badge
  seats?: number | null
  city: string
  rating: number | null
  totalTrips: number
  instantBook: boolean
  photos: { url: string }[]
  host: {
    name: string
    profilePhoto: string | null
  } | null
}

interface MakeData {
  make: string
  slug: string
  totalCars: number
  cars: CarData[]
}

export default function BrowseByTypeSection() {
  const t = useTranslations('Home')
  const [activeTab, setActiveTab] = useState<'type' | 'make'>('type')
  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const CLD = 'https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_210,h_158,c_fill,g_auto'

  const carTypes = [
    {
      type: 'sedan',
      label: t('typeSedanLabel'),
      price: t('typeSedanPrice'),
      image: `${CLD}/vehicle-types/sedan-car-rental.jpg`
    },
    {
      type: 'suv',
      label: t('typeSuvLabel'),
      price: t('typeSuvPrice'),
      image: `${CLD}/vehicle-types/suv-car-rental.jpg`
    },
    {
      type: 'luxury',
      label: t('typeLuxuryLabel'),
      price: t('typeLuxuryPrice'),
      image: `${CLD}/vehicle-types/luxury-car-rental.jpg`
    },
    {
      type: 'sports',
      label: t('typeSportsLabel'),
      price: t('typeSportsPrice'),
      image: `${CLD}/vehicle-types/sports-car-rental.jpg`
    },
    {
      type: 'electric',
      label: t('typeElectricLabel'),
      price: t('typeElectricPrice'),
      image: `${CLD}/vehicle-types/electric-car-rental.jpg`
    },
    {
      type: 'truck',
      label: t('typeTruckLabel'),
      price: t('typeTruckPrice'),
      image: `${CLD}/vehicle-types/truck-car-rental.jpg`
    }
  ]

  // Fetch makes data when switching to make tab
  useEffect(() => {
    if (activeTab === 'make' && makesData.length === 0) {
      setIsLoading(true)
      fetch('/api/rentals/by-make?limit=8')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMakesData(data.makes)
          }
        })
        .catch(err => {
          console.error('Failed to fetch makes:', err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [activeTab, makesData.length])

  return (
    <section className="py-4 sm:py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toggle Header - Centered, scrollable if text is too wide */}
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto scrollbar-hide px-2 py-1">
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 flex-shrink-0">
            <button
              onClick={() => setActiveTab('type')}
              className={`px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[13px] sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'type'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('browseByType')}
            </button>
            <button
              onClick={() => setActiveTab('make')}
              className={`px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[13px] sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'make'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('browseByMake')}
            </button>
          </div>
        </div>

        {/* Type Grid */}
        {activeTab === 'type' && (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {carTypes.map((carType) => (
              <Link
                key={carType.type}
                href={`/rentals/types/${carType.type}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden">
                    <img
                      src={carType.image}
                      alt={carType.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 sm:p-3 bg-white dark:bg-gray-700">
                    <span className="block font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {carType.label}
                    </span>
                    <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {carType.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Make View - Each make as a section */}
        {activeTab === 'make' && (
          <div className="space-y-0">
            {isLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
                      <div className="h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full w-20" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                        <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700" />
                        <div className="p-3 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : makesData.length > 0 ? (
              makesData.map((makeData, idx) => (
                <div
                  key={makeData.make}
                  className="py-6 sm:py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
                >
                  {/* Make Header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                        {capitalizeCarMake(makeData.make)}
                      </h3>
                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 whitespace-nowrap flex-shrink-0">
                        {t('carCount', { count: makeData.totalCars })}
                      </span>
                    </div>
                    <Link
                      href={`/rentals/makes/${makeData.slug}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-xs sm:text-base whitespace-nowrap flex-shrink-0"
                    >
                      {t('viewAllMake', { make: capitalizeCarMake(makeData.make) === 'Mercedes-Benz' ? 'Mercedes' : capitalizeCarMake(makeData.make) })}
                      <IoArrowForwardOutline className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Car Grid - Same layout as other sections */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {makeData.cars.map((car) => (
                      <CompactCarCard
                        key={car.id}
                        car={{
                          id: car.id,
                          make: car.make,
                          model: car.model,
                          year: car.year,
                          dailyRate: car.dailyRate,
                          carType: car.carType,
                          vehicleType: car.vehicleType as 'RENTAL' | 'RIDESHARE' | null,
                          seats: car.seats,
                          city: car.city,
                          rating: car.rating,
                          totalTrips: car.totalTrips,
                          instantBook: car.instantBook,
                          photos: car.photos,
                          host: car.host
                        }}
                        accentColor="purple"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <IoCarOutline className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('noCarsAvailable')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('checkBackSoon')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
