// app/rideshare/components/VehicleFilters.tsx
// Vehicle filters for partner fleet pages - Polished design

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IoFilterOutline, IoCloseOutline, IoFlashOutline, IoCarSportOutline } from 'react-icons/io5'

interface VehicleFiltersProps {
  availableMakes?: string[]
  onFilterChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

export interface FilterState {
  make: string
  sortBy: string
  availability: string
}

export default function VehicleFilters({
  availableMakes = [],
  onFilterChange,
  totalCount,
  filteredCount
}: VehicleFiltersProps) {
  const t = useTranslations('Rideshare')
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    sortBy: 'newest',
    availability: 'all'
  })

  // Show all makes available in the fleet, sorted alphabetically
  const displayMakes = [...availableMakes].sort()

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      make: '',
      sortBy: 'newest',
      availability: 'all'
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.make !== '' || filters.availability !== 'all'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <IoFilterOutline className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{t('filterVehicles')}</span>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              {t('clearFilters')}
              <IoCloseOutline className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {filteredCount === totalCount ? (
              <span className="flex items-center gap-1.5">
                <IoCarSportOutline className="w-4 h-4 text-orange-500" />
                {t('vehicleCount', { count: totalCount })}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <IoCarSportOutline className="w-4 h-4 text-orange-500" />
                {t('filteredCount', { filtered: filteredCount, total: totalCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Make Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('filterMake')}</label>
            <select
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">{t('allMakes')}</option>
              {displayMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_low">{t('sortPriceLow')}</option>
              <option value="price_high">{t('sortPriceHigh')}</option>
              <option value="rating">{t('sortRated')}</option>
              <option value="trips">{t('sortTrips')}</option>
            </select>
          </div>

          {/* Availability */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('availability')}</label>
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="all">{t('allVehicles')}</option>
              <option value="instant">{t('instantBookOnly')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
