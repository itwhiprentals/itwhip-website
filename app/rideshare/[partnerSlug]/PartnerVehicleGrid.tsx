// app/rideshare/[partnerSlug]/PartnerVehicleGrid.tsx
// Client component for vehicle grid with filters - uses CompactCarCard for consistency

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoFlashOutline,
  IoStarOutline,
  IoTimeOutline,
  IoGridOutline,
  IoListOutline
} from 'react-icons/io5'
import VehicleFilters, { FilterState } from '../components/VehicleFilters'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { generateCarUrl } from '@/app/lib/utils/urls'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  photos: { url: string }[]
  city: string | null
  state: string | null
  instantBook: boolean
  transmission: string | null
  fuelType: string | null
  seats: number | null
  carType: string | null
  description: string | null
  features: string[]
  rating: number | null
  totalTrips: number | null
  vehicleType: string | null
  minTripDuration: number | null
  host: {
    name: string | null
    profilePhoto: string | null
  } | null
}

interface PartnerVehicleGridProps {
  vehicles: Vehicle[]
  availableMakes: string[]
}

export default function PartnerVehicleGrid({ vehicles, availableMakes }: PartnerVehicleGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    sortBy: 'newest',
    availability: 'all'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles]

    // Filter by make
    if (filters.make) {
      result = result.filter(v => v.make === filters.make)
    }

    // Filter by availability (instant book)
    if (filters.availability === 'instant') {
      result = result.filter(v => v.instantBook)
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.dailyRate - b.dailyRate)
        break
      case 'price_high':
        result.sort((a, b) => b.dailyRate - a.dailyRate)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'trips':
        result.sort((a, b) => (b.totalTrips || 0) - (a.totalTrips || 0))
        break
      default:
        // 'newest' - already ordered by createdAt desc from server
        break
    }

    return result
  }, [vehicles, filters])

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Available Vehicles
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <IoGridOutline className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <IoListOutline className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <VehicleFilters
        availableMakes={availableMakes}
        onFilterChange={setFilters}
        totalCount={vehicles.length}
        filteredCount={filteredVehicles.length}
      />

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'
            : 'space-y-4'
        }>
          {filteredVehicles.map((vehicle) => (
            viewMode === 'grid' ? (
              <CompactCarCard
                key={vehicle.id}
                car={{
                  id: vehicle.id,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  dailyRate: vehicle.dailyRate,
                  carType: vehicle.carType,
                  seats: vehicle.seats,
                  city: vehicle.city,
                  rating: vehicle.rating,
                  totalTrips: vehicle.totalTrips,
                  instantBook: vehicle.instantBook,
                  photos: vehicle.photos,
                  host: vehicle.host
                }}
                accentColor="amber"
              />
            ) : (
              <VehicleListItem key={vehicle.id} vehicle={vehicle} />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No vehicles match your filters
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  )
}

// List View Item - updated to use generateCarUrl for proper routing
function VehicleListItem({ vehicle }: { vehicle: Vehicle }) {
  const carUrl = generateCarUrl({
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    city: vehicle.city || 'Phoenix'
  })

  return (
    <Link
      href={carUrl}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col sm:flex-row"
    >
      {/* Image */}
      <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 bg-gray-200 dark:bg-gray-700">
        {vehicle.photos?.[0]?.url ? (
          <Image
            src={vehicle.photos[0].url}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoCarOutline className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {vehicle.instantBook && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              <IoFlashOutline className="w-3 h-3" />
              Instant
            </div>
          )}
          {/* Rideshare Badge */}
          {vehicle.vehicleType === 'RIDESHARE' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              <IoTimeOutline className="w-3 h-3" />
              3 Day Min
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : ''}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{vehicle.transmission}</span>
              <span>•</span>
              <span>{vehicle.seats} seats</span>
              <span>•</span>
              <span>{vehicle.fuelType}</span>
              {/* Only show rating if car has real trips (ignores DB default of 5.0) */}
              {vehicle.rating && vehicle.rating > 0 && vehicle.totalTrips && vehicle.totalTrips > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <IoStarOutline className="w-4 h-4 text-yellow-500" />
                    {vehicle.rating.toFixed(1)}
                  </span>
                </>
              )}
              {vehicle.totalTrips && vehicle.totalTrips > 0 && (
                <>
                  <span>•</span>
                  <span>{vehicle.totalTrips} trips</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${vehicle.dailyRate}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </div>
            {vehicle.weeklyRate && (
              <div className="text-sm text-gray-500 mt-1">
                ${vehicle.weeklyRate}/week
              </div>
            )}
            {vehicle.monthlyRate && (
              <div className="text-sm text-gray-500">
                ${vehicle.monthlyRate}/month
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
