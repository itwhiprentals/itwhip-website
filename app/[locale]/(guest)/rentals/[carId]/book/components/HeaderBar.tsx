'use client'

import { useTranslations } from 'next-intl'
import { IoArrowBackOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'

interface HeaderBarProps {
  onBack: () => void
}

export function HeaderBar({ onBack }: HeaderBarProps) {
  const t = useTranslations('BookingPage')

  return (
    <>
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Header Bar - sticky below main header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              <span className="text-sm">{t('backToCarDetails')}</span>
            </button>

            <div className="flex items-center text-sm text-gray-500">
              <IoShieldCheckmarkOutline className="w-5 h-5 mr-1 text-green-500" />
              <span>{t('secureCheckout')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
