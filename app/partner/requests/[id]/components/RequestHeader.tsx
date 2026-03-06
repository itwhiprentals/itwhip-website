// app/partner/requests/[id]/components/RequestHeader.tsx
// Header component for request detail page — matches BookingHeader layout
// Rounded-lg card with status badges, banners inside, request-specific actions

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
  IoAlertCircleOutline,
} from 'react-icons/io5'

interface RequestHeaderProps {
  requestId: string
  requestStatus: string
  isCarAssigned: boolean
  isExpired: boolean
  hasDeclined: boolean
  hasCompleted: boolean
  isBookingExpired: boolean
  isBookingLate: boolean
  isBookingToday: boolean
  isBookingWithin24h: boolean
  hasPendingCounterOffer: boolean
  counterOfferAmount?: number | null
  paymentType?: string | null
  timeRemaining: { ms: number; hours: number; minutes: number; expired: boolean } | null
  timeDisplay: string
  copied: boolean
  onConfirmAndSend: () => void
  onDecline: () => void
  onContinueAddingCar: () => void
  onRefresh: () => void
  onCopyId: (id: string) => void
}

function getStatusBadge(
  requestStatus: string,
  hasDeclined: boolean,
  isExpired: boolean,
  isBookingExpired: boolean,
  hasPendingCounterOffer: boolean,
  t: (key: string) => string
): { label: string; className: string } {
  if (hasDeclined) return { label: t('statusDeclined'), className: 'bg-red-600 text-white' }
  if (isExpired || isBookingExpired) return { label: t('statusExpired'), className: 'bg-red-600 text-white' }
  if (hasPendingCounterOffer) return { label: t('statusCounterPending'), className: 'bg-blue-600 text-white' }
  if (requestStatus === 'CAR_ASSIGNED') return { label: t('statusCarAssigned'), className: 'bg-green-600 text-white' }
  return { label: t('statusPending'), className: 'bg-amber-500 text-white' }
}

export default function RequestHeader({
  requestId,
  requestStatus,
  isCarAssigned,
  isExpired,
  hasDeclined,
  hasCompleted,
  isBookingExpired,
  isBookingLate,
  isBookingToday,
  isBookingWithin24h,
  hasPendingCounterOffer,
  counterOfferAmount,
  paymentType,
  timeRemaining,
  timeDisplay,
  copied,
  onConfirmAndSend,
  onDecline,
  onContinueAddingCar,
  onRefresh,
  onCopyId,
}: RequestHeaderProps) {
  const t = useTranslations('PartnerRequestDetail')

  const status = getStatusBadge(requestStatus, hasDeclined, isExpired, isBookingExpired, hasPendingCounterOffer, t)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="p-3 sm:p-4">
        {/* Top row - Back button, title, status badges + actions */}
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
              <Link
                href="/partner/dashboard?section=requests"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              {t('requestBookingDetails')}
            </h1>
          </div>

          {/* Status badges + Desktop Actions — far right */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase ${status.className}`}>
                {status.label}
              </span>
              {paymentType === 'CASH' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  CASH
                </span>
              )}
              {paymentType === 'CARD' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  CARD
                </span>
              )}
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
              {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && !isCarAssigned && (
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
        </div>

        {/* Reservation Number — MANUAL BOOKING badge far right */}
        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{t('reservationNumber')}:</span>
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono">
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
          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {t('manualBooking')}
          </span>
        </div>

        {/* === Banners inside header === */}

        {/* Booking Expired */}
        {isBookingExpired && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-white bg-red-600 rounded-lg px-3 py-2">
            <IoAlertCircleOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{t('bookingExpiredBanner')}</span>
          </div>
        )}

        {/* Late / Today / Within 24h */}
        {!isBookingExpired && (isBookingLate || isBookingToday || isBookingWithin24h) && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            <IoAlertCircleOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {isBookingLate ? t('bookingLateWarning') : isBookingToday ? t('bookingTodayWarning') : t('bookingWithin24hWarning')}
            </span>
          </div>
        )}

        {/* Expiration Countdown */}
        {!isExpired && !hasDeclined && !hasCompleted && timeRemaining && timeDisplay && (
          <div className={`mt-2 sm:mt-3 flex items-center gap-2 rounded-lg px-3 py-2 ${
            timeRemaining.hours < 6
              ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-gray-800/50'
          }`}>
            <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {t('completeSetupBefore')} · <strong>{timeDisplay}</strong>
            </span>
          </div>
        )}

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
          {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && !isCarAssigned && (
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
