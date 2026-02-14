'use client'

import { useTranslations } from 'next-intl'
import { IoCheckmarkOutline } from 'react-icons/io5'
import { format } from 'date-fns'

interface BookingDetailsCardsProps {
  savedBookingDetails: {
    startDate: string
    endDate: string
    insuranceType?: string
    insuranceTier?: string
    pricing: {
      insurancePrice: number
      breakdown: {
        refuelService: number
        additionalDriver: number
        extraMiles: number
        vipConcierge: number
      }
    }
    addOns: Record<string, boolean>
  }
  numberOfDays: number
  onEdit: () => void
}

export function BookingDetailsCards({ savedBookingDetails, numberOfDays, onEdit }: BookingDetailsCardsProps) {
  const t = useTranslations('BookingPage')

  const getInsuranceTierLabel = () => {
    const tier = (savedBookingDetails.insuranceType || savedBookingDetails.insuranceTier || '').toUpperCase()
    switch(tier) {
      case 'LUXURY': return t('luxuryProtection')
      case 'PREMIUM': return t('premiumProtection')
      case 'BASIC':
      case 'STANDARD': return t('standardProtection')
      case 'MINIMUM': return t('minimumProtection')
      default: return t('basicProtection')
    }
  }

  return (
    <>
      {/* Selected Dates Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('tripDatesSelected')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {format(new Date(savedBookingDetails.startDate + 'T00:00:00'), 'MMM d')} -
                {format(new Date(savedBookingDetails.endDate + 'T00:00:00'), 'MMM d, yyyy')}
                ({t('dayCount', { count: numberOfDays })})
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('edit')}
          </button>
        </div>
      </div>

      {/* Selected Insurance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('insuranceSelected')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getInsuranceTierLabel()}
                {' '}- ${savedBookingDetails.pricing.insurancePrice / numberOfDays}{t('perDay')}
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('edit')}
          </button>
        </div>
      </div>

      {/* Experience Enhancements Card */}
      {Object.values(savedBookingDetails.addOns).some(v => v) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('experienceEnhancements')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('addOnsSelected', { count: Object.values(savedBookingDetails.addOns).filter(v => v).length })}
                </p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('edit')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
