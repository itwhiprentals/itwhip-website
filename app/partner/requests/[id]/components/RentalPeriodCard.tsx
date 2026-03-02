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
  startTime?: string | null
  endDate?: string
  endTime?: string | null
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
  startTime,
  endDate,
  endTime,
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

  const formatTime12h = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <IoCalendarOutline className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalPeriod')}</h3>
      </div>

      {/* Dates Grid — matches ManualBookingView */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('pickup')}</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(startDate)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('atTime')} {formatTime12h(startTime || '10:00')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('return')}</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(endDate)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('atTime')} {formatTime12h(endTime || '10:00')}</p>
        </div>
      </div>

      {/* Location + Duration — matches ManualBookingView layout */}
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
          <div className="text-right flex-shrink-0">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {t('durationDays', { count: durationDays })}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown — matches ManualBookingView */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
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

        {/* Standard 25% fee — strikethrough */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 dark:text-gray-500 line-through">{t('prStandardPlatformFee')}</span>
          <span className="text-gray-400 dark:text-gray-500 line-through">
            -{formatCurrency(totalAmount * 0.25)}
          </span>
        </div>

        {/* Welcome discount highlight */}
        <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1.5 -mx-2">
          <span className="text-green-700 dark:text-green-400 font-medium">{t('prWelcomeDiscount')}</span>
          <span className="text-green-700 dark:text-green-400 font-medium">
            +{formatCurrency(totalAmount * 0.25 - platformFee)}
          </span>
        </div>

        {/* Actual platform fee at 10% */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('platformFee')} (10%)</span>
          <span className="text-red-600 dark:text-red-400">-{formatCurrency(platformFee)}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
          <span className="text-gray-900 dark:text-white">{t('yourEarnings')}</span>
          <span className="text-lg text-green-600 dark:text-green-400">
            {formatCurrency(hostEarnings)}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1">{t('prWelcomeDiscountNote')}</p>

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
