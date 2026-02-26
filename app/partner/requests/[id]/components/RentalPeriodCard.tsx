'use client'

import { useTranslations } from 'next-intl'
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoWalletOutline,
  IoHandLeftOutline
} from 'react-icons/io5'

interface RentalPeriodCardProps {
  startDate?: string
  endDate?: string
  pickupCity?: string
  pickupState?: string
  durationDays: number
  dailyRate: number
  totalAmount: number
  platformFee: number
  hostEarnings: number
  counterOfferStatus?: string
  hasPendingCounterOffer: boolean
  isExpired: boolean
  hasDeclined: boolean
  hasCompleted: boolean
  onRequestDifferentRate: () => void
  formatDate: (date?: string) => string
  formatCurrency: (amount: number) => string
}

export default function RentalPeriodCard({
  startDate,
  endDate,
  pickupCity,
  pickupState,
  durationDays,
  dailyRate,
  totalAmount,
  platformFee,
  hostEarnings,
  counterOfferStatus,
  hasPendingCounterOffer,
  isExpired,
  hasDeclined,
  hasCompleted,
  onRequestDifferentRate,
  formatDate,
  formatCurrency,
}: RentalPeriodCardProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <IoCalendarOutline className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalPeriod')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('pickup')}</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(startDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('return')}</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(endDate)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoLocationOutline className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pickupLocation')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {pickupCity || 'Phoenix'}, {pickupState || 'AZ'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('guestWillComeToYou')}</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {t('durationDays', { count: durationDays })}
          </span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <IoWalletOutline className="w-5 h-5 text-gray-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">{t('pricing')}</h4>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(dailyRate)} × {t('durationDays', { count: durationDays })}
          </span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('platformFee')}</span>
          <span className="text-gray-500 dark:text-gray-400">-{formatCurrency(platformFee)}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">{t('yourEarnings')}</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(hostEarnings)}
            </span>
          </div>
        </div>

        {counterOfferStatus === 'APPROVED' && (
          <p className="text-xs text-green-600 dark:text-green-400">{t('counterOfferApproved')}</p>
        )}

        {!hasPendingCounterOffer && !isExpired && !hasDeclined && !hasCompleted && (
          <button
            onClick={onRequestDifferentRate}
            className="w-full mt-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <IoHandLeftOutline className="w-4 h-4" />
            {t('requestDifferentRate')}
          </button>
        )}
      </div>
    </div>
  )
}
