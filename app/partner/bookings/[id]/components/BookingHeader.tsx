// app/partner/bookings/[id]/components/BookingHeader.tsx
// Extracted header/status bar from booking detail page

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoArrowBackOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoCopyOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5'

interface BookingHeaderProps {
  booking: {
    id: string
    status: string
    paymentType: string | null
    paymentStatus: string
    bookingType?: string
    hostApproval: string | null
    pickupLocation: string | null
    createdAt: string
    originalBookingId?: string | null
    replacedByBookingId?: string | null
    vehicleAccepted?: boolean
    vehicleAcceptedAt?: string | null
    agreementStatus?: string | null
  }
  renter: { name: string } | null
  isManualBooking: boolean
  isGuestDriven: boolean
  confirming: boolean
  cancelling: boolean
  hostApproving: boolean
  confirmBooking: () => void
  cancelBooking: () => void
  hostApproveBooking: () => void
  setShowRejectModal: (show: boolean) => void
  copyToClipboard: (text: string) => void
  getStatusColor: (status: string) => string
}

export function BookingHeader({
  booking,
  renter,
  isManualBooking,
  isGuestDriven,
  confirming,
  cancelling,
  hostApproving,
  confirmBooking,
  cancelBooking,
  hostApproveBooking,
  setShowRejectModal,
  copyToClipboard,
  getStatusColor,
}: BookingHeaderProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="p-3 sm:p-4">
        {/* Top row - Back button, title, status */}
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
              <Link
                href="/partner/bookings"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              {booking.status === 'PENDING' && !isGuestDriven && !isManualBooking ? t('bdConfirmBooking') : t('bdBookingDetails')}
            </h1>
            {booking.status === 'PENDING' && !isGuestDriven && !isManualBooking && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('bdReviewThenConfirm')}
              </p>
            )}
          </div>

          {/* Status badges + Quick Actions — far right */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              {isManualBooking && booking.paymentType === 'CASH' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  CASH
                </span>
              )}
              {isManualBooking && booking.paymentType === 'CARD' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  CARD
                </span>
              )}
            </div>

            {/* Quick Actions - Hidden on mobile, shown inline on desktop */}
            <div className="hidden sm:flex items-center gap-2">
            {isGuestDriven && booking.hostApproval === 'PENDING' ? (
              <>
                <button
                  onClick={hostApproveBooking}
                  disabled={hostApproving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {hostApproving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoCheckmarkOutline className="w-4 h-4" />
                  )}
                  {t('bdApproveBooking')}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <IoCloseOutline className="w-4 h-4" />
                  {t('bdReject')}
                </button>
              </>
            ) : (
              <>
                {booking.status === 'PENDING' && !isGuestDriven && booking.bookingType !== 'MANUAL' && (
                  !isManualBooking && booking.paymentType === 'CARD' && booking.paymentStatus !== 'AUTHORIZED' ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center gap-2 cursor-not-allowed"
                    >
                      <IoTimeOutline className="w-4 h-4" />
                      {t('bdWaitingForAuthorization')}
                    </button>
                  ) : (
                    <button
                      onClick={confirmBooking}
                      disabled={confirming}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      {confirming ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <IoCheckmarkOutline className="w-4 h-4" />
                      )}
                      {t('bdConfirmBooking')}
                    </button>
                  )
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isGuestDriven && (
                  <button
                    onClick={cancelBooking}
                    disabled={cancelling}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    {cancelling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    ) : (
                      <IoCloseOutline className="w-4 h-4" />
                    )}
                    {t('bdCancel')}
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </div>

        {/* Booking snapshot — manual cash bookings */}
        {isManualBooking && booking.paymentType === 'CASH' && booking.status !== 'PENDING' && renter && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            <IoWalletOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {t('bdCashPickupMessage', { guest: renter.name, location: booking.pickupLocation || t('bdBusinessLocation') })}
            </span>
          </div>
        )}

        {/* Reservation Number — MANUAL BOOKING badge far right */}
        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{t('bdReservationNumber')}:</span>
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono">
              {booking.id.slice(0, 8).toUpperCase()}
            </span>
            <button
              onClick={() => copyToClipboard(booking.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <IoCopyOutline className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {isManualBooking && (
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {t('bdManualBooking')}
              </span>
            )}
            {booking.originalBookingId && (
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t('bdReassigned')}
              </span>
            )}
          </div>
        </div>

        {/* Booking chain links for reassignment */}
        {(booking.originalBookingId || booking.replacedByBookingId) && (
          <div className="mt-1.5 flex items-center gap-3 text-[11px]">
            {booking.originalBookingId && (
              <Link
                href={`/partner/bookings/${booking.originalBookingId}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('bdReplacesBooking', { code: booking.originalBookingId.slice(0, 8).toUpperCase() })}
              </Link>
            )}
            {booking.replacedByBookingId && (
              <Link
                href={`/partner/bookings/${booking.replacedByBookingId}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('bdReplacedBy', { code: booking.replacedByBookingId.slice(0, 8).toUpperCase() })}
              </Link>
            )}
          </div>
        )}

        {/* Reservation Expiry Notice - For PENDING bookings (not MANUAL — host already confirmed) */}
        {booking.status === 'PENDING' && booking.bookingType !== 'MANUAL' && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              <strong>{t('bdReservationExpires')}:</strong>{' '}
              {(() => {
                const createdAt = new Date(booking.createdAt)
                const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
                const now = new Date()
                const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
                const minutesLeft = Math.max(0, Math.floor(((expiresAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)))

                if (hoursLeft <= 0 && minutesLeft <= 0) {
                  return <span className="text-red-600 dark:text-red-400">{t('bdExpiredConfirmOrCancel')}</span>
                }
                return t('bdTimeRemainingToConfirm', { hours: hoursLeft, minutes: minutesLeft })
              })()}
            </span>
          </div>
        )}

        {/* Mobile Quick Actions - Full width buttons on mobile */}
        <div className="sm:hidden mt-3 flex gap-2">
          {isGuestDriven && booking.hostApproval === 'PENDING' ? (
            <>
              <button
                onClick={hostApproveBooking}
                disabled={hostApproving}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
              >
                {hostApproving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoCheckmarkOutline className="w-4 h-4" />
                )}
                {t('bdApprove')}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 text-sm"
              >
                <IoCloseOutline className="w-4 h-4" />
                {t('bdReject')}
              </button>
            </>
          ) : (
            <>
              {booking.status === 'PENDING' && !isGuestDriven && booking.bookingType !== 'MANUAL' && (
                !isManualBooking && booking.paymentType === 'CARD' && booking.paymentStatus !== 'AUTHORIZED' ? (
                  <button
                    disabled
                    className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                  >
                    <IoTimeOutline className="w-4 h-4" />
                    {t('bdWaitingForAuthorization')}
                  </button>
                ) : (
                  <button
                    onClick={confirmBooking}
                    disabled={confirming}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    {confirming ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <IoCheckmarkOutline className="w-4 h-4" />
                    )}
                    {t('bdConfirm')}
                  </button>
                )
              )}
              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isGuestDriven && (
                <button
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className={`${booking.status === 'PENDING' && booking.bookingType !== 'MANUAL' ? '' : 'flex-1'} px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 text-sm`}
                >
                  {cancelling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                  ) : (
                    <IoCloseOutline className="w-4 h-4" />
                  )}
                  {t('bdCancel')}
                </button>
              )}
            </>
          )}
        </div>

        {/* Contextual status banners for manual bookings (host already confirmed at creation) */}
        {isManualBooking && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isGuestDriven && (
          <div className="mt-3 space-y-2">
            {/* Waiting for guest to sign agreement */}
            {booking.agreementStatus !== 'signed' && (
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 flex items-center gap-3">
                <IoDocumentTextOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('bdWaitingForSignature')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('bdAgreementSentToGuest')}</p>
                </div>
              </div>
            )}
            {/* Waiting for guest to select payment */}
            {booking.agreementStatus === 'signed' && !booking.paymentType && (
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 flex items-center gap-3">
                <IoWalletOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('bdWaitingForPaymentSelection')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('bdGuestSelectsPaymentMethod')}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
