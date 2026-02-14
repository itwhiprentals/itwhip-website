// app/rideshare/[partnerSlug]/PartnerVehicleGrid.tsx
// Client component for vehicle grid with filters - uses CompactCarCard for consistency

'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  IoCarOutline,
  IoFlashOutline,
  IoStarOutline,
  IoGridOutline,
  IoListOutline,
  IoCarSportOutline,
  IoKeyOutline,
  IoAddCircleOutline
} from 'react-icons/io5'
import VehicleFilters, { FilterState } from '../components/VehicleFilters'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { capitalizeCarMake } from '@/app/lib/utils/formatters'
import { useEditMode } from './EditModeContext'

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

interface ServiceSettings {
  enableRideshare: boolean
  enableRentals: boolean
  rideshareCount: number
  rentalCount: number
}

interface PartnerVehicleGridProps {
  vehicles: Vehicle[]
  availableMakes: string[]
  serviceSettings?: ServiceSettings
}

export default function PartnerVehicleGrid({
  vehicles,
  availableMakes,
  serviceSettings
}: PartnerVehicleGridProps) {
  // Get edit mode from context
  const { isEditMode, openSheet } = useEditMode()
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    sortBy: 'newest',
    availability: 'all'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Show toggle when at least one service type is enabled (even if no vehicles yet)
  const hasRideshareEnabled = serviceSettings?.enableRideshare
  const hasRentalsEnabled = serviceSettings?.enableRentals
  const showToggle = hasRideshareEnabled || hasRentalsEnabled

  // Default to the tab with vehicles (prefer rideshare if enabled)
  const defaultTab = hasRideshareEnabled ? 'rideshare' : hasRentalsEnabled ? 'rentals' : 'all'

  const [activeTab, setActiveTab] = useState<'rideshare' | 'rentals' | 'all'>(
    showToggle ? defaultTab : 'all'
  )

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles]

    // Filter by tab (vehicle type)
    if (activeTab === 'rideshare') {
      result = result.filter(v => v.vehicleType === 'RIDESHARE')
    } else if (activeTab === 'rentals') {
      result = result.filter(v => v.vehicleType === 'RENTAL' || !v.vehicleType)
    }
    // 'all' shows everything

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
  }, [vehicles, filters, activeTab])

  // Get counts for current tab (after make/availability filters, before tab filter)
  const tabFilteredVehicles = useMemo(() => {
    let result = [...vehicles]
    if (filters.make) result = result.filter(v => v.make === filters.make)
    if (filters.availability === 'instant') result = result.filter(v => v.instantBook)
    return {
      rideshare: result.filter(v => v.vehicleType === 'RIDESHARE').length,
      rentals: result.filter(v => v.vehicleType === 'RENTAL' || !v.vehicleType).length
    }
  }, [vehicles, filters])

  return (
    <div>
      {/* Section Header - Title only */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Vehicles
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          — Browse and book from our fleet
        </span>
      </div>

      {/* Controls Row: Service Toggle + Grid/List Toggle */}
      <div className="flex items-center justify-between mb-4">
        {/* Service Toggle - text buttons */}
        {showToggle ? (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {/* Rideshare Tab */}
            {hasRideshareEnabled && (
              <button
                onClick={() => setActiveTab('rideshare')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'rideshare'
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Rideshare ({tabFilteredVehicles.rideshare})
              </button>
            )}
            {/* Rentals Tab */}
            {hasRentalsEnabled && (
              <button
                onClick={() => setActiveTab('rentals')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'rentals'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Rental ({tabFilteredVehicles.rentals})
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* View Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <IoGridOutline className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <IoListOutline className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {/* Vehicle Grid - Tighter spacing */}
      {filteredVehicles.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3'
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
                  vehicleType: vehicle.vehicleType as 'RENTAL' | 'RIDESHARE' | null,
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
            {vehicles.length === 0 ? 'No vehicles in your fleet' : 'No vehicles match your filters'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {vehicles.length === 0 ? 'Add your first vehicle to get started' : 'Try adjusting your search criteria'}
          </p>
          {isEditMode && (
            <button
              onClick={() => openSheet('addCar')}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddCircleOutline className="w-4 h-4" />
              Add Car
            </button>
          )}
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
          {/* Rideshare Badge - Primary */}
          {vehicle.vehicleType === 'RIDESHARE' && (
            <div className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Rideshare
            </div>
          )}
          {vehicle.instantBook && vehicle.vehicleType !== 'RIDESHARE' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              <IoFlashOutline className="w-3 h-3" />
              Instant
            </div>
          )}
        </div>
      </div>

      {/* Info - Two column layout: details left, prices right */}
      <div className="flex-1 p-4 sm:p-5">
        <div className="flex justify-between gap-4">
          {/* Left: Vehicle details */}
          <div className="min-w-0 flex-1">
            {/* Row 1: Year Make Model */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {vehicle.year} {capitalizeCarMake(vehicle.make)} {vehicle.model}
            </h3>
            {/* Row 2: Location */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : ''}
            </p>
            {/* Row 3: Specs */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{vehicle.transmission}</span>
              <span>•</span>
              <span>{vehicle.seats} seats</span>
              <span>•</span>
              <span>{vehicle.fuelType}</span>
            </div>
            {/* Row 4: Rating/New Listing & Trips */}
            <div className="flex items-center gap-2 text-sm mt-2">
              {vehicle.totalTrips && vehicle.totalTrips > 0 ? (
                <>
                  {vehicle.rating && vehicle.rating > 0 && (
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <IoStarOutline className="w-4 h-4 text-yellow-500" />
                      {Math.floor(vehicle.rating * 10) / 10}
                    </span>
                  )}
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{vehicle.totalTrips} trips</span>
                </>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-medium">New Listing</span>
              )}
            </div>
          </div>

          {/* Right: Prices */}
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              ${Math.floor(vehicle.dailyRate)}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </div>
            {vehicle.weeklyRate && (
              <div className="text-sm text-gray-500">
                ${Math.floor(vehicle.weeklyRate)}/week
              </div>
            )}
            {vehicle.monthlyRate && (
              <div className="text-sm text-gray-500">
                ${Math.floor(vehicle.monthlyRate)}/month
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
