'use client'

import { useState } from 'react'
import Link from 'next/link'
import CarCard from '@/app/components/cards/CarCard'
import CarCardSkeleton from '@/app/components/cards/CarCardSkeleton'
import { IoCarOutline, IoArrowForwardOutline } from 'react-icons/io5'

interface CarGridProps {
  initialCars: any[]
  totalCount: number
  currentPage: number
  perPage: number
  filters: {
    type?: string
    make?: string
    priceMin?: string
    priceMax?: string
  }
}

export default function CarGrid({
  initialCars,
  totalCount,
  currentPage,
  perPage,
  filters
}: CarGridProps) {
  const [cars, setCars] = useState<any[]>(initialCars)
  const [page, setPage] = useState(currentPage)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialCars.length < totalCount)

  // Transform server data to match CarCard expected format
  // CarCard expects rating as either a number or { average: number }
  const transformCarForCard = (car: any) => {
    // Ensure rating is a proper number (handles Decimal from Prisma)
    const ratingValue = car.rating != null ? Number(car.rating) : null

    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      dailyRate: Number(car.dailyRate),
      totalDaily: Number(car.dailyRate),
      instantBook: car.instantBook,
      rating: ratingValue ? { average: ratingValue, count: car.totalTrips || 0 } : null,
      trips: car.totalTrips,
      totalTrips: car.totalTrips,
      esgScore: car.esgScore || null,
      fuelType: car.fuelType || null,
      host: car.host,
      photos: car.photos,
      location: {
        city: car.city || 'Phoenix',
        state: 'AZ',
        lat: car.latitude,
        lng: car.longitude
      }
    }
  }

  const loadMore = async () => {
    setIsLoading(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams()

      if (filters.type) params.set('carType', filters.type)
      if (filters.make) params.set('make', filters.make)
      if (filters.priceMin) params.set('priceMin', filters.priceMin)
      if (filters.priceMax) params.set('priceMax', filters.priceMax)
      params.set('limit', perPage.toString())
      params.set('offset', ((nextPage - 1) * perPage).toString())

      const response = await fetch(`/api/rentals/search?${params.toString()}`)
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        // Deduplicate cars by id to prevent duplicate key errors
        setCars(prev => {
          const existingIds = new Set(prev.map(c => c.id))
          const newCars = data.results.filter((c: any) => !existingIds.has(c.id))
          return [...prev, ...newCars]
        })
        setPage(nextPage)
        setHasMore(cars.length + data.results.length < totalCount)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more cars:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-16">
        <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No cars found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Try adjusting your filters to see more results.
        </p>
        <Link
          href="/rentals"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Clear filters
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Showing count */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Showing {cars.length} of {totalCount} cars
      </p>

      {/* Car Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <CarCard key={car.id} car={transformCarForCard(car)} showHostAvatar />
        ))}

        {/* Loading skeletons */}
        {isLoading && [...Array(6)].map((_, i) => (
          <CarCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Load more cars
            <IoArrowForwardOutline className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin" />
            Loading more cars...
          </div>
        </div>
      )}
    </div>
  )
}
