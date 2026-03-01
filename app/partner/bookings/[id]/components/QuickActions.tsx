// app/partner/bookings/[id]/components/QuickActions.tsx
// Extracted quick actions sidebar from booking detail page

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCreateOutline,
  IoRefreshOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoSwapHorizontalOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoCloseOutline,
  IoAddOutline,
} from 'react-icons/io5'

interface QuickActionsProps {
  booking: {
    id: string
    status: string
    paymentStatus: string
    paymentType: string | null
    handoffStatus: string | null
    agreementStatus: string | null
  }
  isGuestDriven: boolean
  vehicle: { instantBook: boolean } | null
  renterId: string | null
  fleetOtherActiveCount: number
  markingPaid: boolean
  sendingAgreement: boolean
  cancelling: boolean
  commSendCounts: Record<string, number>
  setConfirmAction: (action: {
    title: string
    message: string
    onConfirm: () => void
    isDangerous?: boolean
  } | null) => void
  setShowEditModal: (show: boolean) => void
  setShowExtendModal: (show: boolean) => void
  setShowChargeModal: (show: boolean) => void
  setShowCommModal: (modal: string | null) => void
  setCommMessage: (msg: string) => void
  markAsPaid: () => void
  sendAgreement: () => void
  cancelBooking: () => void
}

export function QuickActions({
  booking,
  isGuestDriven,
  vehicle,
  renterId,
  fleetOtherActiveCount,
  markingPaid,
  sendingAgreement,
  cancelling,
  commSendCounts,
  setConfirmAction,
  setShowEditModal,
  setShowExtendModal,
  setShowChargeModal,
  setShowCommModal,
  setCommMessage,
  markAsPaid,
  sendAgreement,
  cancelBooking,
}: QuickActionsProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('bdQuickActions')}</h3>
      <div className="space-y-2">
        {/* Edit Booking — only for manual PENDING bookings */}
        {booking.status === 'PENDING' && !isGuestDriven && (
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <IoCreateOutline className="w-4 h-4" />
            {t('bdEditBooking')}
          </button>
        )}

        {/* Guest-driven: Edit locked */}
        {isGuestDriven && booking.status === 'PENDING' && (
          <div className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-lg flex items-center gap-2 cursor-not-allowed">
            <IoCreateOutline className="w-4 h-4" />
            {t('bdEditBooking')}
            <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t('bdLocked')}</span>
          </div>
        )}

        {/* Extend/Modify/Change Customer — only for manual bookings */}
        {!isGuestDriven && (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') && (
          <>
            <button
              onClick={() => setShowExtendModal(true)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <IoRefreshOutline className="w-4 h-4" />
              {t('bdExtendRental')}
            </button>
            <button
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <IoCalendarOutline className="w-4 h-4" />
              {t('bdModifyDates')}
            </button>
            <button
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <IoPersonOutline className="w-4 h-4" />
              {t('bdChangeCustomer')}
            </button>
          </>
        )}

        {/* Change Vehicle — gated by fleet availability, with confirmation */}
        <div className="relative group">
          <button
            onClick={() => fleetOtherActiveCount && setConfirmAction({
              title: t('bdChangeVehicle'),
              message: t('bdConfirmChangeVehicle'),
              onConfirm: () => { /* TODO: implement vehicle change modal */ }
            })}
            disabled={!fleetOtherActiveCount}
            className={`w-full px-4 py-2 border rounded-lg flex items-center gap-2 ${
              fleetOtherActiveCount
                ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <IoSwapHorizontalOutline className="w-4 h-4" />
            {t('bdChangeVehicle')}
          </button>
          {!fleetOtherActiveCount && (
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
              {t('bdNoOtherVehicles')}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
            </div>
          )}
        </div>

        {/* Add Charge — with confirmation */}
        <button
          onClick={() => setConfirmAction({
            title: t('bdAddChargeAddon'),
            message: t('bdConfirmAddCharge'),
            onConfirm: () => setShowChargeModal(true)
          })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <IoWalletOutline className="w-4 h-4" />
          {t('bdAddChargeAddon')}
        </button>

        {/* Mark as Paid — cash+handoff = green disabled, else confirmation */}
        {booking.paymentStatus === 'PAID' || (booking.paymentType === 'CASH' && (booking.handoffStatus === 'HANDOFF_COMPLETE' || booking.handoffStatus === 'BYPASSED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED')) ? (
          <div className="w-full px-4 py-2 border border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 cursor-default">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            {t('bdPaid')}
          </div>
        ) : (
          <div className="relative group">
            <button
              onClick={() => setConfirmAction({
                title: t('bdMarkAsPaid'),
                message: t('bdConfirmMarkPaid'),
                onConfirm: markAsPaid
              })}
              disabled={markingPaid || !booking.paymentType}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {markingPaid ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
              ) : (
                <IoWalletOutline className="w-4 h-4" />
              )}
              {markingPaid ? t('bdUpdating') : t('bdMarkAsPaid')}
            </button>
            {!booking.paymentType && (
              <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
                {t('bdSelectPaymentFirst')}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
              </div>
            )}
          </div>
        )}

        {/* Send/Resend Agreement — with confirmation */}
        <button
          onClick={() => setConfirmAction({
            title: booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' || booking.agreementStatus === 'signed'
              ? t('bdResendAgreement')
              : t('bdSendAgreement'),
            message: t('bdConfirmSendAgreement'),
            onConfirm: sendAgreement
          })}
          disabled={sendingAgreement}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          {sendingAgreement ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
          ) : (
            <IoDocumentTextOutline className="w-4 h-4" />
          )}
          {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' || booking.agreementStatus === 'signed'
            ? t('bdResendAgreement')
            : t('bdSendAgreement')}
        </button>

        {/* Send Pickup Instructions — locked until confirmed, with confirmation */}
        <div className="relative group">
          <button
            onClick={() => setConfirmAction({
              title: t('bdSendPickupInstructions'),
              message: t('bdConfirmSendPickup'),
              onConfirm: () => { setCommMessage(''); setShowCommModal('pickup_instructions') }
            })}
            disabled={!booking.paymentType || booking.status === 'PENDING' || (commSendCounts.pickup_instructions || 0) >= 2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IoLocationOutline className="w-4 h-4" />
            {t('bdSendPickupInstructions')}
            {(commSendCounts.pickup_instructions || 0) > 0 && (
              <span className="ml-auto text-xs text-gray-400">({commSendCounts.pickup_instructions}/2)</span>
            )}
          </button>
          {(!booking.paymentType || booking.status === 'PENDING') && (
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
              {t('bdAvailableAfterConfirm')}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
            </div>
          )}
        </div>

        {/* Send Keys Instructions — locked until confirmed + instant book, with confirmation */}
        <div className="relative group">
          <button
            onClick={() => setConfirmAction({
              title: t('bdSendKeysInstructions'),
              message: t('bdConfirmSendKeys'),
              onConfirm: () => { setCommMessage(''); setShowCommModal('keys_instructions') }
            })}
            disabled={!booking.paymentType || booking.status === 'PENDING' || !vehicle?.instantBook || (commSendCounts.keys_instructions || 0) >= 2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IoKeyOutline className="w-4 h-4" />
            {t('bdSendKeysInstructions')}
            {(commSendCounts.keys_instructions || 0) > 0 && (
              <span className="ml-auto text-xs text-gray-400">({commSendCounts.keys_instructions}/2)</span>
            )}
          </button>
          {(!booking.paymentType || booking.status === 'PENDING') ? (
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
              {t('bdAvailableAfterConfirm')}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
            </div>
          ) : !vehicle?.instantBook && (
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
              {t('bdKeysInstantOnly')}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
            </div>
          )}
        </div>

        {/* Cancel Booking — dangerous, requires confirmation */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button
            onClick={() => setConfirmAction({
              title: t('bdCancelBooking'),
              message: t('bdConfirmCancelWarning'),
              onConfirm: cancelBooking,
              isDangerous: true
            })}
            disabled={cancelling}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2"
          >
            {cancelling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <IoCloseOutline className="w-4 h-4" />
            )}
            {t('bdCancelBooking')}
          </button>
        )}

        {/* New Booking — with confirmation */}
        <button
          onClick={() => setConfirmAction({
            title: t('bdNewBooking'),
            message: t('bdConfirmNewBooking'),
            onConfirm: () => { window.location.href = `/partner/bookings/new?customerId=${renterId}` }
          })}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <IoAddOutline className="w-4 h-4" />
          {t('bdNewBooking')}
        </button>
      </div>
    </div>
  )
}
