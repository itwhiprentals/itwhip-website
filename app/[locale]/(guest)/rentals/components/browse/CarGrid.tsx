// app/(guest)/rentals/components/browse/CarGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoGridOutline,
  IoListOutline,
  IoMapOutline,
  IoCarOutline,
  IoInformationCircleOutline,
  IoFilterOutline
} from 'react-icons/io5'
import CarCard from './CarCard'
import { RentalCarWithDetails } from '@/types/rental'

interface CarGridProps {
  cars: RentalCarWithDetails[]
  loading?: boolean
  view?: 'grid' | 'list' | 'map'
  onViewChange?: (view: 'grid' | 'list' | 'map') => void
  onCarSelect?: (car: RentalCarWithDetails) => void
  emptyMessage?: string
  showViewToggle?: boolean
  showResultCount?: boolean
  className?: string
}

export default function CarGrid({
  cars,
  loading = false,
  view = 'grid',
  onViewChange,
  onCarSelect,
  emptyMessage,
  showViewToggle = true,
  showResultCount = true,
  className = ''
}: CarGridProps) {
  const t = useTranslations('SearchResults')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedFavorites = localStorage.getItem('rental_favorites')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }, [])

  const handleFavorite = (carId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(carId)) {
        newFavorites.delete(carId)
      } else {
        newFavorites.add(carId)
      }
      localStorage.setItem('rental_favorites', JSON.stringify(Array.from(newFavorites)))
      return newFavorites
    })
  }

  if (!mounted) {
    return null
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={`${className}`}>
        {showResultCount && (
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {showViewToggle && (
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            )}
          </div>
        )}

        <div className={`
          ${view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
          }
        `}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-3" />
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (cars.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <IoCarOutline className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('noCarsTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {emptyMessage || t('tryAdjustingFilters')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            {t('tryDifferentFilters')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header with count and view toggle */}
      <div className="mb-4 flex items-center justify-between">
        {showResultCount && (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('carsAvailable', { count: cars.length })}
            </h2>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <IoInformationCircleOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {showViewToggle && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{t('view')}</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewChange?.('grid')}
                className={`p-2 rounded transition-colors ${
                  view === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('gridView')}
              >
                <IoGridOutline className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewChange?.('list')}
                className={`p-2 rounded transition-colors ${
                  view === 'list'
                    ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('listView')}
              >
                <IoListOutline className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewChange?.('map')}
                className={`p-2 rounded transition-colors ${
                  view === 'map'
                    ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('mapView')}
              >
                <IoMapOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Car Grid/List */}
      {view === 'map' ? (
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <IoMapOutline className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">{t('mapComingSoon')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t('switchToGridList')}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`
            ${view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
            }
          `}
        >
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              view={view}
              onFavorite={handleFavorite}
              isFavorited={favorites.has(car.id)}
            />
          ))}
        </div>
      )}

      {/* Load More / Pagination */}
      {cars.length >= 20 && (
        <div className="mt-8 flex justify-center">
          <button className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {t('loadMoreCars')}
          </button>
        </div>
      )}

      {/* Mobile Filter Button */}
      <button className="fixed bottom-4 right-4 lg:hidden z-10 px-4 py-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
        <IoFilterOutline className="w-5 h-5" />
        <span>{t('filters')}</span>
      </button>
    </div>
  )
}
