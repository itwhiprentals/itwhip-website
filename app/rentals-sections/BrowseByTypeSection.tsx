// app/rentals-sections/BrowseByTypeSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { IoArrowForwardOutline, IoCarOutline } from 'react-icons/io5'

const carTypes = [
  {
    type: 'sedan',
    label: 'Sedan',
    price: 'from $35/day',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=210&h=158&fit=crop&fm=webp&q=60'
  },
  {
    type: 'suv',
    label: 'SUV',
    price: 'from $45/day',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=210&h=158&fit=crop&fm=webp&q=60'
  },
  {
    type: 'luxury',
    label: 'Luxury',
    price: 'from $100/day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=210&h=158&fit=crop&fm=webp&q=60'
  },
  {
    type: 'sports',
    label: 'Sports',
    price: 'from $150/day',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=210&h=158&fit=crop&fm=webp&q=60'
  },
  {
    type: 'electric',
    label: 'Electric',
    price: 'from $80/day',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=210&h=158&fit=crop&fm=webp&q=60'
  },
  {
    type: 'truck',
    label: 'Truck',
    price: 'from $60/day',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=210&h=158&fit=crop&fm=webp&q=60'
  }
]

interface CarData {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType: string
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
  const [activeTab, setActiveTab] = useState<'type' | 'make'>('type')
  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
        {/* Toggle Header - Centered */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setActiveTab('type')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
                activeTab === 'type'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Browse by Type
            </button>
            <button
              onClick={() => setActiveTab('make')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
                activeTab === 'make'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Browse by Make
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
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {makeData.make}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        {makeData.totalCars} {makeData.totalCars === 1 ? 'car' : 'cars'}
                      </span>
                    </div>
                    <Link
                      href={`/rentals/makes/${makeData.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                    >
                      View all {makeData.make === 'Mercedes-Benz' ? 'Mercedes' : makeData.make}
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
                          seats: 5,
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
                  No cars available at the moment.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Check back soon for new listings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
