// app/(guest)/rentals/search/components/MapSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoStarOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoCarOutline
} from 'react-icons/io5'
import { useTranslations } from 'next-intl'

interface MapSidebarProps {
  cars: any[]
  selectedCar: any | null
  onCarSelect: (car: any) => void
  onCarHover?: (car: any | null) => void
  rentalDays: number
  isLoading?: boolean
  userLocation?: { lat: number; lng: number } | null
}

export function MapSidebar({ 
  cars, 
  selectedCar, 
  onCarSelect, 
  onCarHover,
  rentalDays,
  isLoading = false,
  userLocation
}: MapSidebarProps) {
  const t = useTranslations('SearchResults')
  const [sortBy, setSortBy] = useState('distance')
  const [sortedCars, setSortedCars] = useState(cars)

  // Privacy-safe distance formatting
  const formatDistance = (distance: number | null | undefined): string => {
    if (distance === null || distance === undefined) return t('distanceUnknown')
    if (distance < 2) return '2 miles'
    if (distance < 3) return '3 miles'
    return `${Math.round(distance)} mi`
  }

  // Sort cars whenever cars or sortBy changes
  useEffect(() => {
    let sorted = [...cars]
    
    switch (sortBy) {
      case 'distance':
        // Sort by actual distance if available
        sorted.sort((a, b) => {
          const distA = a.distance ?? 999
          const distB = b.distance ?? 999
          return distA - distB
        })
        break
      case 'price_low':
        sorted.sort((a, b) => (a.dailyRate || 0) - (b.dailyRate || 0))
        break
      case 'price_high':
        sorted.sort((a, b) => (b.dailyRate || 0) - (a.dailyRate || 0))
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        break
      default:
        break
    }
    
    setSortedCars(sorted)
  }, [cars, sortBy])

  // Calculate total price
  const calculateTotalPrice = (dailyRate: number) => {
    return Math.round(dailyRate * rentalDays)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loadingCars')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t('carsAvailable', { count: sortedCars.length })}
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="distance">{t('nearestSort')}</option>
            <option value="price_low">{t('priceLowSort')}</option>
            <option value="price_high">{t('priceHighSort')}</option>
            <option value="rating">{t('topRatedSort')}</option>
          </select>
        </div>
      </div>

      {/* Car List */}
      <div className="flex-1 overflow-y-auto">
        {sortedCars.length === 0 ? (
          <div className="p-8 text-center">
            <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('noCarsFoundInArea')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sortedCars.map((car) => (
              <div
                key={car.id}
                className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedCar?.id === car.id 
                    ? 'ring-2 ring-amber-600 shadow-lg' 
                    : 'hover:ring-2 hover:ring-amber-300'
                }`}
                onClick={() => onCarSelect(car)}
                onMouseEnter={() => onCarHover?.(car)}
                onMouseLeave={() => onCarHover?.(null)}
              >
                <div className="flex gap-4">
                  {/* Car Image */}
                  <div className="flex-shrink-0 w-28 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {car.photos && car.photos[0] ? (
                      <img
                        src={car.photos[0].url}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {car.year} {car.make} {car.model}
                    </h4>
                    
                    {/* Features */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>{t('seatsCount', { count: car.seats })}</span>
                      {car.instantBook && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <IoFlashOutline className="w-3 h-3" />
                            {t('instantBadge')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Location Only - No Distance for Privacy */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <IoLocationOutline className="w-3 h-3" />
                      <span>{car.location?.city || 'Phoenix'}</span>
                    </div>

                    {/* Rating */}
                    {car.rating && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <IoStarOutline className="w-3 h-3 text-amber-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {car.rating.average || 5.0}
                        </span>
                        {car.rating.count > 0 && (
                          <span className="text-gray-500 dark:text-gray-500">
                            ({car.rating.count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      ${Math.round(car.dailyRate)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('perDay')}</div>
                    {rentalDays > 1 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t('totalPrice', { amount: calculateTotalPrice(car.dailyRate) })}
                      </div>
                    )}
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCarSelect(car)
                  }}
                  className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t('view')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}