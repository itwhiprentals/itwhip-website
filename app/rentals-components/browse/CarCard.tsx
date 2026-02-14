// app/(guest)/rentals/components/browse/CarCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  IoCarSportOutline,
  IoLocationOutline,
  IoStarOutline,
  IoStar,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoSpeedometerOutline,
  IoWaterOutline,
  IoHeartOutline,
  IoHeart,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { RentalCarWithDetails } from '@/types/rental'
import { formatCurrency } from '@/app/[locale]/(guest)/rentals/lib/rental-utils'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { formatRating, isNewListing, formatTransmission, formatFuelType } from '@/app/lib/utils/formatCarSpecs'

interface CarCardProps {
  car: RentalCarWithDetails
  view?: 'grid' | 'list'
  onFavorite?: (carId: string) => void
  isFavorited?: boolean
}

export default function CarCard({ 
  car, 
  view = 'grid',
  onFavorite,
  isFavorited = false 
}: CarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(isFavorited)

  const images = car.photos?.length > 0 
    ? car.photos.map((p: any) => p.url)
    : ['/images/car-placeholder.jpg']

  const features = car.features ? JSON.parse(car.features) : []
  const displayFeatures = features.slice(0, 3)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    onFavorite?.(car.id)
  }

  const handleImageNavigation = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.preventDefault()
    e.stopPropagation()
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  // Calculate total price
  const dailyRate = parseFloat(car.dailyRate.toString())
  const totalPrice = dailyRate * 3 // Default 3-day rental for display

  if (view === 'list') {
    return (
      <Link href={`/rentals/${car.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-72 h-48">
              <Image
                src={images[currentImageIndex]}
                alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
                fill
                className="object-cover"
              />
              {car.vehicleType?.toUpperCase() === 'RIDESHARE' ? (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <IoCarSportOutline className="w-3 h-3" />
                  Rideshare
                </div>
              ) : car.instantBook && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <IoFlashOutline className="w-3 h-3" />
                  Instant Book
                </div>
              )}
              <button
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                {isFavorite ? (
                  <IoHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <IoHeartOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)}
                  </h3>
                  
                  {/* Host Info */}
                  {car.host && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Hosted by {car.host.name}
                      </span>
                      {car.host.isVerified && (
                        <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-500" />
                      )}
                      {isNewListing(car.totalTrips) ? (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">New Listing</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <IoStar className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{formatRating(car.rating)}</span>
                          <span className="text-sm text-gray-500">({car.totalTrips} trips)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoLocationOutline className="w-4 h-4" />
                    <span>{car.city}, {car.state}</span>
                  </div>

                  {/* Features */}
                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <IoPeopleOutline className="w-4 h-4" />
                      <span>{car.seats} seats</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <IoSpeedometerOutline className="w-4 h-4" />
                      <span>{formatTransmission(car.transmission)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <IoWaterOutline className="w-4 h-4" />
                      <span>{formatFuelType(car.fuelType)}</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="flex gap-2 mt-3">
                    {displayFeatures.map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-700 dark:text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {features.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(dailyRate)}
                    <span className="text-sm font-normal text-gray-500">/day</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatCurrency(totalPrice)} total
                  </div>
                  {car.hotelDelivery && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 justify-end">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      Hotel delivery
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Grid View (Default)
  return (
    <Link href={`/rentals/${car.id}`}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Carousel */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          <Image
            src={images[currentImageIndex]}
            alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
            fill
            className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
          />
          
          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => handleImageNavigation(e, 'prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              >
                <IoCarSportOutline className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={(e) => handleImageNavigation(e, 'next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              >
                <IoCarSportOutline className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_: any, index: number) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          {car.instantBook && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <IoFlashOutline className="w-3 h-3" />
              Instant Book
            </div>
          )}
          
          {car.source === 'p2p' && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ItWhip Exclusive
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            {isFavorite ? (
              <IoHeart className="w-5 h-5 text-red-500" />
            ) : (
              <IoHeartOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)}
          </h3>

          {/* Host & Rating */}
          {car.host && (
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{car.host.name}</span>
                {car.host.isVerified && (
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-500" />
                )}
              </div>
              {isNewListing(car.totalTrips) ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">New Listing</span>
              ) : (
                <div className="flex items-center gap-1">
                  <IoStar className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{formatRating(car.rating)}</span>
                  <span className="text-xs text-gray-500">({car.totalTrips})</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <IoLocationOutline className="w-4 h-4" />
            <span>{car.city}, {car.state}</span>
            {car.airportPickup && (
              <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                Airport
              </span>
            )}
          </div>

          {/* Key Features */}
          <div className="flex gap-2 mt-3">
            {displayFeatures.map((feature: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dailyRate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/day</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(totalPrice)} total
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          {(car.hotelDelivery || car.homeDelivery) && (
            <div className="mt-2 flex gap-2">
              {car.hotelDelivery && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <IoCheckmarkCircle className="w-3 h-3" />
                  Hotel delivery
                </span>
              )}
              {car.homeDelivery && (
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <IoCheckmarkCircle className="w-3 h-3" />
                  Home delivery
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}