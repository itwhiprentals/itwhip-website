// app/(guest)/rentals/components/browse/SortDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoChevronDownOutline,
  IoCheckmarkOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoStarOutline,
  IoLocationOutline,
  IoFlashOutline,
  IoSwapVerticalOutline
} from 'react-icons/io5'

export type SortOption =
  | 'recommended'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'distance'
  | 'instant'
  | 'newest'
  | 'popular'

interface SortOptionConfig {
  value: SortOption
  labelKey: string
  descKey: string
  icon: React.ReactNode
}

const SORT_OPTION_CONFIGS: SortOptionConfig[] = [
  { value: 'recommended', labelKey: 'recommended', descKey: 'recommendedDesc', icon: <IoSwapVerticalOutline className="w-4 h-4" /> },
  { value: 'price_low', labelKey: 'priceLowToHigh', descKey: 'priceLowDesc', icon: <IoTrendingUpOutline className="w-4 h-4" /> },
  { value: 'price_high', labelKey: 'priceHighToLow', descKey: 'priceHighDesc', icon: <IoTrendingDownOutline className="w-4 h-4" /> },
  { value: 'rating', labelKey: 'highestRated', descKey: 'ratingDesc', icon: <IoStarOutline className="w-4 h-4" /> },
  { value: 'distance', labelKey: 'distanceNearest', descKey: 'distanceDesc', icon: <IoLocationOutline className="w-4 h-4" /> },
  { value: 'instant', labelKey: 'instantBook', descKey: 'instantBookSortDesc', icon: <IoFlashOutline className="w-4 h-4" /> },
  { value: 'newest', labelKey: 'newestCars', descKey: 'newestCarsDesc', icon: <IoTrendingUpOutline className="w-4 h-4" /> },
  { value: 'popular', labelKey: 'mostPopular', descKey: 'mostPopularDesc', icon: <IoCheckmarkOutline className="w-4 h-4" /> }
]

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
  disabled?: boolean
  compact?: boolean
}

export default function SortDropdown({
  value,
  onChange,
  className = '',
  disabled = false,
  compact = false
}: SortDropdownProps) {
  const t = useTranslations('SearchResults')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = SORT_OPTION_CONFIGS.find(opt => opt.value === value) || SORT_OPTION_CONFIGS[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SortOption) => {
    onChange(option)
    setIsOpen(false)
  }

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600 rounded-lg
            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {selectedOption.icon}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(selectedOption.labelKey)}
          </span>
          <IoChevronDownOutline className={`
            w-4 h-4 text-gray-400 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
            {SORT_OPTION_CONFIGS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left flex items-center gap-2
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  ${value === option.value ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                `}
              >
                <span className="text-gray-400">{option.icon}</span>
                <span className={`
                  text-sm
                  ${value === option.value
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}>
                  {t(option.labelKey)}
                </span>
                {value === option.value && (
                  <IoCheckmarkOutline className="w-4 h-4 text-amber-500 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('sortBy')}</span>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400">{selectedOption.icon}</span>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {t(selectedOption.labelKey)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t(selectedOption.descKey)}
            </div>
          </div>
        </div>
        <IoChevronDownOutline className={`
          w-5 h-5 text-gray-400 transition-transform
          ${isOpen ? 'rotate-180' : ''}
        `} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-2">
          {SORT_OPTION_CONFIGS.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors flex items-center justify-between group
                ${value === option.value ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`
                  ${value === option.value
                    ? 'text-amber-500'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }
                `}>
                  {option.icon}
                </span>
                <div>
                  <div className={`
                    font-medium
                    ${value === option.value
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}>
                    {t(option.labelKey)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t(option.descKey)}
                  </div>
                </div>
              </div>
              {value === option.value && (
                <IoCheckmarkOutline className="w-5 h-5 text-amber-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Export the sort function
export function sortCars(cars: any[], sortOption: SortOption) {
  const sorted = [...cars]

  switch (sortOption) {
    case 'price_low':
      return sorted.sort((a, b) => parseFloat(a.dailyRate) - parseFloat(b.dailyRate))

    case 'price_high':
      return sorted.sort((a, b) => parseFloat(b.dailyRate) - parseFloat(a.dailyRate))

    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        if (ratingA === ratingB) {
          return (b.totalTrips || 0) - (a.totalTrips || 0)
        }
        return ratingB - ratingA
      })

    case 'distance':
      return sorted.sort((a, b) => {
        const distA = a.distance || Number.MAX_VALUE
        const distB = b.distance || Number.MAX_VALUE
        return distA - distB
      })

    case 'instant':
      return sorted.sort((a, b) => {
        if (a.instantBook === b.instantBook) return 0
        return a.instantBook ? -1 : 1
      })

    case 'newest':
      return sorted.sort((a, b) => b.year - a.year)

    case 'popular':
      return sorted.sort((a, b) => (b.totalTrips || 0) - (a.totalTrips || 0))

    case 'recommended':
    default:
      return sorted.sort((a, b) => {
        const scoreA = calculateRecommendationScore(a)
        const scoreB = calculateRecommendationScore(b)
        return scoreB - scoreA
      })
  }
}

function calculateRecommendationScore(car: any): number {
  let score = 0

  score += (car.rating || 0) * 10
  score += Math.min((car.totalTrips || 0) * 0.5, 20)
  if (car.instantBook) score += 10
  if (car.host?.isVerified) score += 10

  const dailyRate = parseFloat(car.dailyRate)
  if (dailyRate < 100) score += 10
  else if (dailyRate < 150) score += 5

  if (car.hotelDelivery) score += 5
  if (car.source === 'p2p') score += 15

  return score
}
