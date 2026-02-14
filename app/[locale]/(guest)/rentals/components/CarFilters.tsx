'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { IoCarSportOutline, IoChevronDownOutline } from 'react-icons/io5'

const CAR_TYPES = [
  { value: '', label: 'All' },
  { value: 'suv', label: 'SUV' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'electric', label: 'Electric' },
  { value: 'truck', label: 'Truck' },
  { value: 'sports', label: 'Sports' },
  { value: 'convertible', label: 'Convertible' }
]

const PRICE_RANGES = [
  { value: '', label: 'Any Price', min: '', max: '' },
  { value: 'budget', label: 'Budget', min: '0', max: '75' },
  { value: 'standard', label: 'Standard', min: '75', max: '150' },
  { value: 'premium', label: 'Premium', min: '150', max: '300' },
  { value: 'luxury', label: 'Luxury', min: '300', max: '' }
]

interface CarFiltersProps {
  currentType?: string
  currentMake?: string
  currentPriceRange?: string
  makes: string[]
  totalCount: number
}

export default function CarFilters({
  currentType = '',
  currentMake = '',
  currentPriceRange = '',
  makes,
  totalCount
}: CarFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    router.push(`/rentals?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleTypeChange = (type: string) => {
    updateFilters({ type })
  }

  const handleMakeChange = (make: string) => {
    updateFilters({ make })
  }

  const handlePriceChange = (priceValue: string) => {
    const priceRange = PRICE_RANGES.find(p => p.value === priceValue)
    if (priceRange) {
      updateFilters({
        priceMin: priceRange.min,
        priceMax: priceRange.max,
        price: priceValue
      })
    } else {
      updateFilters({ priceMin: '', priceMax: '', price: '' })
    }
  }

  const clearAllFilters = () => {
    router.push('/rentals', { scroll: false })
  }

  const hasActiveFilters = currentType || currentMake || currentPriceRange

  // Sort makes alphabetically
  const sortedMakes = [...makes].sort((a, b) => a.localeCompare(b))

  return (
    <div className="mb-6 space-y-4">
      {/* Results count and clear filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoCarSportOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> cars available
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Type Pills */}
      <div className="flex flex-wrap gap-2">
        {CAR_TYPES.map((type) => {
          const isActive = currentType === type.value || (!currentType && type.value === '')
          return (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Make and Price Dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Make Dropdown */}
        <div className="relative">
          <select
            value={currentMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Makes</option>
            {sortedMakes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Price Range Dropdown */}
        <div className="relative">
          <select
            value={currentPriceRange}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
                {range.min && range.max && ` ($${range.min}-$${range.max})`}
                {range.min && !range.max && ` ($${range.min}+)`}
              </option>
            ))}
          </select>
          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {currentType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-lg">
              {CAR_TYPES.find(t => t.value === currentType)?.label || currentType}
              <button
                onClick={() => handleTypeChange('')}
                className="ml-1 hover:text-amber-600"
              >
                ×
              </button>
            </span>
          )}
          {currentMake && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-lg">
              {currentMake}
              <button
                onClick={() => handleMakeChange('')}
                className="ml-1 hover:text-amber-600"
              >
                ×
              </button>
            </span>
          )}
          {currentPriceRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-lg">
              {PRICE_RANGES.find(p => p.value === currentPriceRange)?.label || 'Custom Price'}
              <button
                onClick={() => handlePriceChange('')}
                className="ml-1 hover:text-amber-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
