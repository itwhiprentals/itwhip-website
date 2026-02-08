// app/(guest)/rentals/components/browse/FilterSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoCloseOutline,
  IoCarOutline,
  IoCashOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoOptionsOutline,
  IoSparklesOutline,
  IoWaterOutline,
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoHomeOutline,
  IoAirplaneOutline,
  IoRefreshOutline
} from 'react-icons/io5'
import {
  CAR_TYPES,
  CAR_FEATURES
} from '@/app/(guest)/rentals/lib/constants'

// Local filter option arrays - not exported from constants (CAR_TYPES is a Record, not an array)
const CAR_TYPE_OPTIONS = Object.entries(CAR_TYPES).map(([value, info]) => ({
  value,
  label: info.label,
}))

const FUEL_TYPES = [
  { value: 'gas', label: 'Gas' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'diesel', label: 'Diesel' },
]

const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
]

const SEAT_OPTIONS = [
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 7, label: '7+' },
]

interface RentalSearchFilters {
  location?: string
  pickupDate?: string
  returnDate?: string
  carTypes?: string[]
  features?: string[]
  minPrice?: number
  maxPrice?: number
  seats?: number
  transmission?: string
  fuelType?: string
  instantBook?: boolean
  deliveryType?: string
  verifiedHost?: boolean
}

interface FilterSidebarProps {
  filters: RentalSearchFilters
  onFiltersChange: (filters: RentalSearchFilters) => void
  onClose?: () => void
  isMobile?: boolean
  resultCount?: number
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onClose,
  isMobile = false,
  resultCount = 0
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<RentalSearchFilters>(filters)
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 500
  ])

  useEffect(() => {
    setLocalFilters(filters)
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 500])
  }, [filters])

  const handleFilterChange = (key: keyof RentalSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange = [...priceRange]
    if (type === 'min') {
      newRange[0] = value
      handleFilterChange('minPrice', value)
    } else {
      newRange[1] = value
      handleFilterChange('maxPrice', value)
    }
    setPriceRange(newRange)
  }

  const handleCarTypeToggle = (type: string) => {
    const currentTypes = localFilters.carTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    handleFilterChange('carTypes', newTypes)
  }

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = localFilters.features || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    handleFilterChange('features', newFeatures)
  }

  const clearAllFilters = () => {
    const clearedFilters: RentalSearchFilters = {
      location: localFilters.location,
      pickupDate: localFilters.pickupDate,
      returnDate: localFilters.returnDate
    }
    setLocalFilters(clearedFilters)
    setPriceRange([0, 500])
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return (localFilters.carTypes?.length ?? 0) > 0 ||
           (localFilters.features?.length ?? 0) > 0 ||
           (localFilters.minPrice ?? 0) > 0 ||
           (localFilters.maxPrice ?? 500) < 500 ||
           localFilters.seats ||
           localFilters.transmission ||
           localFilters.fuelType ||
           localFilters.instantBook ||
           localFilters.deliveryType
  }

  return (
    <div className={`
      ${isMobile ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'sticky top-4'}
      ${isMobile ? 'overflow-y-auto' : 'h-fit max-h-[calc(100vh-2rem)] overflow-y-auto'}
    `}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className={isMobile ? 'p-4' : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'}>
        {/* Header for Desktop */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoOptionsOutline className="w-5 h-5" />
              Filters
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-amber-500 hover:text-amber-600 flex items-center gap-1"
              >
                <IoRefreshOutline className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Result Count */}
        {resultCount > 0 && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {resultCount} cars match your filters
            </p>
          </div>
        )}

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoCashOutline className="w-5 h-5 text-gray-400" />
            Price per day
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="$0"
                />
              </div>
              <span className="text-gray-400 mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 500)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="$500"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Instant Book */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.instantBook || false}
              onChange={(e) => handleFilterChange('instantBook', e.target.checked)}
              className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
            />
            <div className="flex items-center gap-2">
              <IoFlashOutline className="w-5 h-5 text-green-500" />
              <span className="text-gray-900 dark:text-white">Instant Book</span>
            </div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-7 mt-1">
            Book instantly without waiting for host approval
          </p>
        </div>

        {/* Car Type */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoCarOutline className="w-5 h-5 text-gray-400" />
            Vehicle Type
          </h4>
          <div className="space-y-2">
            {CAR_TYPE_OPTIONS.map((type) => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.carTypes?.includes(type.value) || false}
                  onChange={() => handleCarTypeToggle(type.value)}
                  className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Seats */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoPeopleOutline className="w-5 h-5 text-gray-400" />
            Seats
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {SEAT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('seats', option.value === localFilters.seats ? undefined : option.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm transition-colors
                  ${localFilters.seats === option.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoSpeedometerOutline className="w-5 h-5 text-gray-400" />
            Transmission
          </h4>
          <div className="space-y-2">
            {TRANSMISSION_TYPES.map(type => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="transmission"
                  checked={localFilters.transmission === type.value}
                  onChange={() => handleFilterChange('transmission', type.value)}
                  className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="transmission"
                checked={!localFilters.transmission}
                onChange={() => handleFilterChange('transmission', undefined)}
                className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Any</span>
            </label>
          </div>
        </div>

        {/* Fuel Type */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoWaterOutline className="w-5 h-5 text-gray-400" />
            Fuel Type
          </h4>
          <div className="space-y-2">
            {FUEL_TYPES.map(type => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fuelType"
                  checked={localFilters.fuelType === type.value}
                  onChange={() => handleFilterChange('fuelType', type.value)}
                  className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="fuelType"
                checked={!localFilters.fuelType}
                onChange={() => handleFilterChange('fuelType', undefined)}
                className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Any</span>
            </label>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoSparklesOutline className="w-5 h-5 text-gray-400" />
            Features
          </h4>
          <div className="space-y-2">
            {CAR_FEATURES.map(feature => (
              <label key={feature} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.features?.includes(feature) || false}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoLocationOutline className="w-5 h-5 text-gray-400" />
            Delivery Options
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.deliveryType === 'airport'}
                onChange={() => handleFilterChange('deliveryType', localFilters.deliveryType === 'airport' ? undefined : 'airport')}
                className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <div className="flex items-center gap-2">
                <IoAirplaneOutline className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Airport Pickup</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.deliveryType === 'hotel'}
                onChange={() => handleFilterChange('deliveryType', localFilters.deliveryType === 'hotel' ? undefined : 'hotel')}
                className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <div className="flex items-center gap-2">
                <IoHomeOutline className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Hotel Delivery</span>
              </div>
            </label>
          </div>
        </div>

        {/* Host Verification */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.verifiedHost || false}
              onChange={(e) => handleFilterChange('verifiedHost', e.target.checked)}
              className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
            />
            <div className="flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-500" />
              <span className="text-gray-900 dark:text-white">Verified Hosts Only</span>
            </div>
          </label>
        </div>

        {/* Mobile Apply Button */}
        {isMobile && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              Show {resultCount} Cars
            </button>
          </div>
        )}
      </div>
    </div>
  )
}