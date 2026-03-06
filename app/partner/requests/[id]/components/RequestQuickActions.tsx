// app/partner/requests/[id]/components/RequestQuickActions.tsx
// Quick actions for the request detail page — mirrors booking QuickActions layout

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoHandLeftOutline,
  IoCloseOutline,
  IoTrashOutline,
} from 'react-icons/io5'

interface RequestQuickActionsProps {
  bookingId: string | null
  bookingSnapshot: {
    agreementStatus: string | null
  } | null
  isCarAssigned: boolean
  isExpired: boolean
  isBookingExpired: boolean
  hasDeclined: boolean
  hasCompleted: boolean
  hasPendingCounterOffer: boolean
  guestPhone: string | null
  onConfirmAndSend: () => void
  onDecline: () => void
  onContinueAddingCar: () => void
  onCounterOffer: () => void
  onSendAgreement?: () => void
  sendingAgreement?: boolean
  onEdit?: () => void
  onCancel?: () => void
}

export default function RequestQuickActions({
  bookingId,
  bookingSnapshot,
  isCarAssigned,
  isExpired,
  isBookingExpired,
  hasDeclined,
  hasCompleted,
  hasPendingCounterOffer,
  guestPhone,
  onConfirmAndSend,
  onDecline,
  onContinueAddingCar,
  onCounterOffer,
  onSendAgreement,
  sendingAgreement = false,
  onEdit,
  onCancel,
}: RequestQuickActionsProps) {
  const t = useTranslations('PartnerRequestDetail')
  const tBd = useTranslations('PartnerBookings')

  const isTerminal = isExpired || isBookingExpired || hasDeclined || hasCompleted

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h3>
      <div className="space-y-2">

        {/* Confirm & Send — primary action when car is assigned */}
        {isCarAssigned && !isBookingExpired && !hasDeclined && (
          <button
            onClick={onConfirmAndSend}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            {t('confirmAndSend')}
          </button>
        )}

        {/* Continue Adding Car — when onboarding not complete */}
        {!isTerminal && !isCarAssigned && (
          <button
            onClick={onContinueAddingCar}
            className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium flex items-center gap-2"
          >
            <IoArrowForwardOutline className="w-4 h-4" />
            {t('continueAddingCar')}
          </button>
        )}

        {/* Send/Resend Agreement — when booking exists */}
        {bookingSnapshot && !isTerminal && onSendAgreement && (
          <button
            onClick={onSendAgreement}
            disabled={sendingAgreement}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <IoDocumentTextOutline className="w-4 h-4" />
            {bookingSnapshot.agreementStatus === 'sent' || bookingSnapshot.agreementStatus === 'viewed' || bookingSnapshot.agreementStatus === 'signed'
              ? tBd('bdResendAgreement')
              : tBd('bdSendAgreement')
            }
          </button>
        )}

        {/* Call Guest — when phone available and car assigned */}
        {isCarAssigned && guestPhone && bookingId && (
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/twilio/masked-call', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ bookingId }),
                })
                if (res.ok) { alert(t('callGuestSuccess')) }
                else {
                  const data = await res.json().catch(() => ({}))
                  alert(data.error || t('callGuestFailed'))
                }
              } catch { alert(t('callGuestFailed')) }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <IoCallOutline className="w-4 h-4" />
            {t('callGuest')}
          </button>
        )}

        {/* Counter-offer — when no pending counter-offer */}
        {!isTerminal && !hasPendingCounterOffer && (
          <button
            onClick={onCounterOffer}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <IoHandLeftOutline className="w-4 h-4" />
            {t('requestDifferentRate')}
          </button>
        )}

        {/* Edit Booking */}
        {!isTerminal && onEdit && (
          <button
            onClick={onEdit}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <IoCreateOutline className="w-4 h-4" />
            {t('editBooking')}
          </button>
        )}

        {/* Cancel Booking */}
        {!isTerminal && onCancel && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <IoTrashOutline className="w-4 h-4" />
            {t('cancelBooking')}
          </button>
        )}

        {/* Decline Request — dangerous action */}
        {!hasDeclined && !hasCompleted && !isExpired && !isBookingExpired && (
          <button
            onClick={onDecline}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <IoCloseOutline className="w-4 h-4" />
            {t('declineRequest')}
          </button>
        )}
      </div>
    </div>
  )
}
