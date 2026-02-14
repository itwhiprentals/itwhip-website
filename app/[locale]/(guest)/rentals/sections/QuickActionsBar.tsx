// app/(guest)/rentals/sections/QuickActionsBar.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  IoSearchOutline,
  IoDocumentTextOutline,
  IoKeyOutline
} from 'react-icons/io5'

export default function QuickActionsBar() {
  const t = useTranslations('RentalsHome')

  return (
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <Link 
              href="/rentals/search" 
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              <IoSearchOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>{t('browse')}</span>
            </Link>
            <Link
              href="/rentals/dashboard/bookings"
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              <IoDocumentTextOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>{t('myRentals')}</span>
            </Link>
          </div>
          <Link 
            href="/rentals/host" 
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            <IoKeyOutline className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="hidden sm:inline">{t('listYourCar')}</span>
            <span className="sm:hidden">{t('listShort')}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}