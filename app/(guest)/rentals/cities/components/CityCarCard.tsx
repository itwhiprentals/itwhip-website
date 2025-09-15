// app/(guest)/rentals/cities/components/CityCarCard.tsx
'use client'

import Link from 'next/link'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { IoFlashOutline, IoStarSharp } from 'react-icons/io5'

interface CityCarCardProps {
  car: {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    city: string
    photos?: Array<{
      url: string
      caption?: string
    }>
    instantBook?: boolean
    host?: {
      name: string
      isVerified?: boolean
    }
    rating?: number
    totalTrips?: number
  }
}

export default function CityCarCard({ car }: CityCarCardProps) {
  // Get the main photo
  const photoUrl = car.photos?.[0]?.url || 
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=400&h=300&fit=crop'

  // Generate SEO-friendly URL
  const carUrl = generateCarUrl({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    city: car.city
  })

  // Show LOCAL HOST badge for managed cars that appear as P2P
  const showLocalHostBadge = car.host && !car.instantBook

  return (
    <Link 
      href={carUrl}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Compact Image Container */}
      <div className="relative h-32 sm:h-36 md:h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={photoUrl}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Badges - Smaller for compact view */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {showLocalHostBadge && (
            <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
              <IoStarSharp className="w-2.5 h-2.5" />
              HOST
            </span>
          )}
          {car.instantBook && (
            <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
              <IoFlashOutline className="w-2.5 h-2.5" />
              INSTANT
            </span>
          )}
        </div>
        
        {/* Price Badge - Compact */}
        <div className="absolute bottom-2 right-2">
          <div className="px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-md shadow-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                ${car.dailyRate}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">/day</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimal Content Section */}
      <div className="p-3">
        {/* Car Name - Compact */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {car.year} {car.make} {car.model}
        </h3>
        
        {/* Rating & Trips - Very compact */}
        {(car.rating || car.totalTrips) && (
          <div className="flex items-center gap-2 mt-1">
            {car.rating && (
              <div className="flex items-center gap-0.5">
                <IoStarSharp className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {car.rating.toFixed(1)}
                </span>
              </div>
            )}
            {car.totalTrips && car.totalTrips > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {car.totalTrips} trips
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}