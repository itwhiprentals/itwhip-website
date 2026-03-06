// app/partner/requests/[id]/components/RequestHeader.tsx
// Extracted header component for the request detail page
// Mirrors BookingHeader pattern but tailored for recruited-host request flow

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoTimeOutline,
} from 'react-icons/io5'

interface RequestHeaderProps {
  requestId: string
  isCarAssigned: boolean
  isExpired: boolean
  hasDeclined: boolean
  hasCompleted: boolean
  isBookingExpired: boolean
  hasPendingCounterOffer: boolean
  counterOfferAmount?: number | null
  copied: boolean
  onConfirmAndSend: () => void
  onDecline: () => void
  onContinueAddingCar: () => void
  onRefresh: () => void
  onCopyId: (id: string) => void
}

export default function RequestHeader({
  requestId,
  isCarAssigned,
  isExpired,
  hasDeclined,
  hasCompleted,
  isBookingExpired,
  hasPendingCounterOffer,
  counterOfferAmount,
  copied,
  onConfirmAndSend,
  onDecline,
  onContinueAddingCar,
  onRefresh,
  onCopyId,
}: RequestHeaderProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        {/* Top row - Back button, title, badge + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/partner/dashboard?section=requests"
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {t('requestBookingDetails')}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              MANUAL BOOKING
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {isCarAssigned && !isBookingExpired && (
              <>
                <button
                  onClick={onConfirmAndSend}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  {t('confirmAndSend')}
                </button>
                <button
                  onClick={onDecline}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('decline')}
                </button>
              </>
            )}
            {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && (
              <>
                <button
                  onClick={onContinueAddingCar}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium flex items-center gap-2"
                >
                  <IoArrowForwardOutline className="w-4 h-4" />
                  {t('continueAddingCar')}
                </button>
                <button
                  onClick={onDecline}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('decline')}
                </button>
              </>
            )}
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title={t('refresh')}
            >
              <IoRefreshOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Second row - REQ number */}
        <div className="flex items-center justify-between gap-2 mt-1 pl-10 sm:pl-14">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
              REQ-{requestId?.slice(0, 8).toUpperCase() || '0000'}
            </span>
            <button
              onClick={() => onCopyId(requestId || '')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {copied ? (
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <IoCopyOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Counter-offer pending notice */}
        {hasPendingCounterOffer && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
            <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <strong>{t('counterOfferPending')}</strong>{' '}
              {t('counterOfferReviewing', { amount: counterOfferAmount })}
            </span>
          </div>
        )}

        {/* Mobile Quick Actions */}
        <div className="sm:hidden mt-3 flex gap-2">
          {isCarAssigned && !isBookingExpired && (
            <>
              <button
                onClick={onConfirmAndSend}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
              >
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                {t('confirmAndSend')}
              </button>
              <button
                onClick={onDecline}
                className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
              >
                {t('decline')}
              </button>
            </>
          )}
          {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && (
            <>
              <button
                onClick={onContinueAddingCar}
                className="flex-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
              >
                <IoArrowForwardOutline className="w-4 h-4" />
                {t('continueAddingCar')}
              </button>
              <button
                onClick={onDecline}
                className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
              >
                {t('decline')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
