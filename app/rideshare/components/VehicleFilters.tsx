// app/rideshare/components/VehicleFilters.tsx
// Vehicle filters for partner fleet pages - 6 Rideshare Makes Only

'use client'

import { useState } from 'react'
import { IoFilterOutline, IoCloseOutline } from 'react-icons/io5'

// Only these 6 makes are approved for rideshare
const RIDESHARE_MAKES = ['Toyota', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Chevrolet']

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
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    sortBy: 'newest',
    availability: 'all'
  })

  // Only show makes that are both in RIDESHARE_MAKES and available in fleet
  const displayMakes = RIDESHARE_MAKES.filter(make =>
    availableMakes.length === 0 || availableMakes.includes(make)
  )

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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <IoFilterOutline className="w-5 h-5" />
          <span className="font-medium text-sm">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Clear
              <IoCloseOutline className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Make Filter */}
          <div className="flex-1 min-w-[120px]">
            <select
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Makes</option>
              {displayMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="trips">Most Trips</option>
            </select>
          </div>

          {/* Availability */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Vehicles</option>
              <option value="instant">Instant Book</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filteredCount === totalCount ? (
            <span>{totalCount} vehicles</span>
          ) : (
            <span>{filteredCount} of {totalCount}</span>
          )}
        </div>
      </div>

      {/* Make Pills (Quick Select) */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => handleFilterChange('make', '')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filters.make === ''
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {displayMakes.map(make => (
          <button
            key={make}
            onClick={() => handleFilterChange('make', make)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.make === make
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {make}
          </button>
        ))}
      </div>
    </div>
  )
}
