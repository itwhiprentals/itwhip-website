'use client'

import { useTranslations } from 'next-intl'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

interface CarInfoCardProps {
  car: {
    year: number
    make: string
    model: string
    carType: string
    seats: number
    rating?: number | null
    totalTrips?: number
    photos?: { url: string }[]
  }
}

export function CarInfoCard({ car }: CarInfoCardProps) {
  const t = useTranslations('BookingPage')

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {car.photos?.[0] && (
              <img
                src={car.photos[0].url}
                alt={`${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
                className="w-20 h-14 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {car.carType} • {car.seats} {t('seats')}
              </p>
              <div className="flex items-center mt-1 space-x-3">
                {car.rating && car.rating > 0 ? (
                  <div className="flex items-center">
                    <div className="flex text-amber-400 text-xs">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className={i < Math.floor(car.rating!) ? '' : 'opacity-30'}>
                          {star}
                        </span>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">
                      {car.rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                    {t('newListing')}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {car.totalTrips || 0} {t('trips')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
