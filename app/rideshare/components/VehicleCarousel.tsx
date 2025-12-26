// app/rideshare/components/VehicleCarousel.tsx
// Horizontal scrollable vehicle carousel

'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFlashOutline,
  IoStarOutline,
  IoCarOutline
} from 'react-icons/io5'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
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
}

export default function VehicleCarousel({ vehicles, partnerSlug }: VehicleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

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
    <div className="relative group">
      {/* Scroll Buttons */}
      {vehicles.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
          >
            <IoChevronBackOutline className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
          >
            <IoChevronForwardOutline className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/cars/${vehicle.id}`}
            className="flex-shrink-0 w-[300px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group/card"
          >
            {/* Vehicle Image */}
            <div className="relative h-44 bg-gray-200 dark:bg-gray-700">
              {vehicle.photo ? (
                <Image
                  src={vehicle.photo}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoCarOutline className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Instant Book Badge */}
              {vehicle.instantBook && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  <IoFlashOutline className="w-3 h-3" />
                  Instant Book
                </div>
              )}

              {/* Rating Badge */}
              {vehicle.rating > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white text-xs font-medium rounded-full">
                  <IoStarOutline className="w-3 h-3 text-yellow-500" />
                  {vehicle.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {vehicle.location}
              </p>

              {/* Features */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>{vehicle.transmission}</span>
                <span>•</span>
                <span>{vehicle.seats} seats</span>
                <span>•</span>
                <span>{vehicle.trips} trips</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${vehicle.dailyRate}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                </div>
                {vehicle.weeklyRate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ${vehicle.weeklyRate}/week
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
