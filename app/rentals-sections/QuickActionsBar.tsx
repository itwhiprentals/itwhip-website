// app/(guest)/rentals/sections/QuickActionsBar.tsx
// Native sticky bar — stays in document flow, zero layout shift

'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoMapOutline,
  IoLocationOutline,
  IoSparklesOutline,
  IoCarSportOutline,
  IoPeopleOutline
} from 'react-icons/io5'

interface QuickActionsBarProps {
  variant?: 'homepage' | 'rideshare'
}

export default function QuickActionsBar({ variant = 'homepage' }: QuickActionsBarProps) {
  const t = useTranslations('Home')

  return (
    <div
      className="sticky top-16 z-40 w-full bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 w-full overflow-x-auto scrollbar-hide">
          {/* Map View */}
          <Link
            href="/rentals/search?view=map"
            className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow border border-gray-200 dark:border-gray-600 whitespace-nowrap"
          >
            <IoMapOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span>{t('quickMap')}</span>
          </Link>

          {/* Cities */}
          <Link
            href="/rentals/cities"
            className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow border border-gray-200 dark:border-gray-600 whitespace-nowrap"
          >
            <IoLocationOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
            <span>{t('quickCities')}</span>
          </Link>

          {/* Third button - varies by variant */}
          {variant === 'homepage' ? (
            // Homepage: Show Rideshare link
            <Link
              href="/rideshare"
              className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow border border-orange-200 dark:border-orange-800 whitespace-nowrap"
            >
              <IoCarSportOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{t('quickRideshare')}</span>
            </Link>
          ) : (
            // Rideshare page: Show Rentals link
            <Link
              href="/"
              className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow border border-green-200 dark:border-green-800 whitespace-nowrap"
            >
              <IoCarSportOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{t('quickRentals')}</span>
            </Link>
          )}

          {/* Fourth button - varies by variant */}
          {variant === 'homepage' ? (
            // Homepage: List Your Car
            <Link
              href="/list-your-car"
              className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
            >
              <IoSparklesOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('quickListYourCar')}</span>
              <span className="sm:hidden">{t('quickList')}</span>
            </Link>
          ) : (
            // Rideshare page: Join Now
            <Link
              href="/partners/apply"
              className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
            >
              <IoPeopleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{t('quickJoin')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
