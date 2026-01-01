// app/rideshare/components/VehicleCarousel.tsx
// Vehicle grid for rideshare - displays 2 columns on mobile, matching rental cards

'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarSportOutline,
  IoStarOutline,
  IoCarOutline
} from 'react-icons/io5'
import { generateCarUrl } from '@/app/lib/utils/urls'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  trim?: string | null
  dailyRate: number
  weeklyRate?: number
  photo: string | null
  photos?: string[]
  location: string
  instantBook: boolean
  transmission: string
  fuelType: string
  seats: number
  rating: number
  trips: number
}

interface VehicleCarouselProps {
  vehicles: Vehicle[]
  partnerSlug?: string
  maxVisible?: number  // Limit visible cards (default 4 for 2 rows)
}

export default function VehicleCarousel({ vehicles, partnerSlug, maxVisible = 4 }: VehicleCarouselProps) {
  // Limit to maxVisible cards (2 rows on mobile = 4 cards)
  const displayVehicles = vehicles.slice(0, maxVisible)

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-center">
          <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No vehicles available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {displayVehicles.map((vehicle) => {
        // Get valid photo URL (handle both string and object formats, and empty strings)
        let photoUrl: string | null = null
        if (vehicle.photo) {
          if (typeof vehicle.photo === 'string' && vehicle.photo.trim() !== '') {
            photoUrl = vehicle.photo
          } else if (typeof vehicle.photo === 'object' && (vehicle.photo as any)?.url) {
            photoUrl = (vehicle.photo as any).url
          }
        }

        return (
          <Link
            key={vehicle.id}
            href={generateCarUrl({
              id: vehicle.id,
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
              city: vehicle.location?.split(',')[0]?.trim() || 'Phoenix'
            })}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group/card"
          >
            {/* Vehicle Image */}
            <div className="relative h-44 bg-gray-200 dark:bg-gray-700">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoCarOutline className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Rideshare Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded-full">
                <IoCarSportOutline className="w-3 h-3" />
                Rideshare
              </div>

              {/* Rating Badge */}
              {vehicle.rating > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white text-xs font-medium rounded-full">
                  <IoStarOutline className="w-3 h-3 text-yellow-500" />
                  {vehicle.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="p-3">
              {/* Year + Make with Daily Price */}
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                  {vehicle.year} {vehicle.make}
                </h3>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ${vehicle.dailyRate}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">/day</span>
                </div>
              </div>

              {/* Model only - trim often contains multiple options */}
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {vehicle.model}
              </p>

              {/* Location with Weekly Price */}
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[60%]">
                  {vehicle.location}
                </p>
                {vehicle.weeklyRate && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    ${vehicle.weeklyRate}/wk
                  </span>
                )}
              </div>
            </div>
          </Link>
        )})}

    </div>
  )
}
