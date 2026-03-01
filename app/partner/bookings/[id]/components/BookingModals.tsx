// app/partner/bookings/[id]/components/BookingModals.tsx
// All modals extracted from booking detail page

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCloseOutline,
  IoAlertCircleOutline,
  IoSendOutline,
} from 'react-icons/io5'

interface ConfirmAction {
  title: string
  message: string
  onConfirm: () => void
  isDangerous?: boolean
}

interface BookingModalsProps {
  booking: {
    id: string
    endDate: string
    endTime: string
    startDate: string
    startTime: string
    pickupLocation: string | null
    dailyRate: number
    verificationMethod?: string | null
    verificationDate?: string | null
    aiVerificationScore?: number | null
    licensePhotoUrl?: string | null
    licenseBackPhotoUrl?: string | null
  }
  vehicle: { year: number; make: string; model: string } | null
  // Confirmation modal
  confirmAction: ConfirmAction | null
  setConfirmAction: (action: ConfirmAction | null) => void
  // Car activate modal
  showCarActivateModal: boolean
  setShowCarActivateModal: (show: boolean) => void
  activateCar: () => void
  activatingCar: boolean
  // Car not approved modal
  showCarNotApprovedModal: boolean
  setShowCarNotApprovedModal: (show: boolean) => void
  // Extend rental modal
  showExtendModal: boolean
  setShowExtendModal: (show: boolean) => void
  formatDate: (dateStr: string) => string
  formatCurrency: (amount: number) => string
  showToast: (type: string, message: string) => void
  fetchBookingDetails: () => void
  // Communication modal
  showCommModal: string | null
  setShowCommModal: (modal: string | null) => void
  commMessage: string
  setCommMessage: (msg: string) => void
  commSendCounts: Record<string, number>
  sendCommunication: () => void
  sendingComm: boolean
  // Host reject modal
  showRejectModal: boolean
  setShowRejectModal: (show: boolean) => void
  rejectReason: string
  setRejectReason: (reason: string) => void
  hostRejectBooking: () => void
  hostRejecting: boolean
  // Edit booking modal
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  // Onboard details modal
  showOnboardModal: boolean
  setShowOnboardModal: (show: boolean) => void
}

export function BookingModals({
  booking,
  vehicle,
  confirmAction,
  setConfirmAction,
  showCarActivateModal,
  setShowCarActivateModal,
  activateCar,
  activatingCar,
  showCarNotApprovedModal,
  setShowCarNotApprovedModal,
  showExtendModal,
  setShowExtendModal,
  formatDate,
  formatCurrency,
  showToast,
  fetchBookingDetails,
  showCommModal,
  setShowCommModal,
  commMessage,
  setCommMessage,
  commSendCounts,
  sendCommunication,
  sendingComm,
  showRejectModal,
  setShowRejectModal,
  rejectReason,
  setRejectReason,
  hostRejectBooking,
  hostRejecting,
  showEditModal,
  setShowEditModal,
  showOnboardModal,
  setShowOnboardModal,
}: BookingModalsProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <>
      {/* #5 — Reusable Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{confirmAction.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={() => { confirmAction.onConfirm(); setConfirmAction(null) }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm text-white ${
                  confirmAction.isDangerous
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {t('bdConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* #2 — Car Activate Modal */}
      {showCarActivateModal && vehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCarActivateModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('bdActivateVehicle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('bdActivateVehicleDesc', { vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}` })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCarActivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={activateCar}
                disabled={activatingCar}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              >
                {activatingCar && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                {t('bdActivate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* #2 — Car Not Approved Modal */}
      {showCarNotApprovedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCarNotApprovedModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <IoAlertCircleOutline className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdCannotActivate')}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('bdCarNotApprovedYet')}</p>
            <button
              onClick={() => setShowCarNotApprovedModal(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm"
            >
              {t('bdOk')}
            </button>
          </div>
        </div>
      )}

      {/* Extend Rental Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdExtendRental')}</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdCurrentEndDate')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(booking.endDate)} at {booking.endTime}
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newEndDate = formData.get('newEndDate') as string

                try {
                  const response = await fetch(`/api/partner/bookings/${booking.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endDate: newEndDate })
                  })
                  const data = await response.json()
                  if (data.success) {
                    showToast('success', t('bdRentalExtendedSuccess'))
                    setShowExtendModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || t('bdFailedExtendRental'))
                  }
                } catch {
                  showToast('error', t('bdFailedExtendRental'))
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdNewEndDate')}
                </label>
                <input
                  type="date"
                  name="newEndDate"
                  required
                  min={new Date(booking.endDate).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('bdAdditionalCostCalculated', { rate: formatCurrency(booking.dailyRate) })}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('bdCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {t('bdExtendRental')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showCommModal === 'pickup_instructions' ? t('bdSendPickupInstructions') : t('bdSendKeysInstructions')}
                </h3>
                <button
                  onClick={() => setShowCommModal(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <IoCloseOutline className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('bdCommModalDisclaimer')}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {showCommModal === 'pickup_instructions'
                  ? t('bdPickupInstructionsLabel')
                  : t('bdKeysInstructionsLabel')}
              </label>
              <textarea
                value={commMessage}
                onChange={(e) => setCommMessage(e.target.value)}
                placeholder={showCommModal === 'pickup_instructions'
                  ? t('bdPickupPlaceholder')
                  : t('bdKeysPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={5}
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{commMessage.length}/2000</span>
                <span className="text-xs text-gray-400">
                  {t('bdSendsRemaining', { count: 2 - (commSendCounts[showCommModal] || 0) })}
                </span>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowCommModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={sendCommunication}
                disabled={sendingComm || !commMessage.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                {sendingComm ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoSendOutline className="w-4 h-4" />
                )}
                {t('bdSendToGuest')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Host Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('bdRejectBooking')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('bdRejectBookingDesc')}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bdReasonForRejection')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder={t('bdRejectReasonPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason('') }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={hostRejectBooking}
                disabled={hostRejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              >
                {hostRejecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoCloseOutline className="w-4 h-4" />
                )}
                {t('bdRejectBooking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal (for PENDING bookings) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdEditBooking')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const updates = {
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  startTime: formData.get('startTime') as string,
                  endTime: formData.get('endTime') as string,
                  pickupLocation: formData.get('pickupLocation') as string,
                  notes: formData.get('notes') as string
                }

                try {
                  const response = await fetch(`/api/partner/bookings/${booking.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                  })
                  const data = await response.json()
                  if (data.success) {
                    showToast('success', t('bdBookingUpdatedSuccess'))
                    setShowEditModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || t('bdFailedUpdateBooking'))
                  }
                } catch {
                  showToast('error', t('bdFailedUpdateBooking'))
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bdStartDate')}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={new Date(booking.startDate).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bdEndDate')}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={new Date(booking.endDate).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bdPickupTime')}
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={booking.startTime}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bdReturnTime')}
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={booking.endTime}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdPickupLocation')}
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  defaultValue={booking.pickupLocation || ''}
                  placeholder={t('bdEnterPickupLocation')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('bdCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  {t('bdSaveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Details Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowOnboardModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdOnboardingDetails')}</h3>
              <button onClick={() => setShowOnboardModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Verification Method */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdVerificationMethod')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {booking.verificationMethod || t('bdUnknown')}
              </p>
              {booking.verificationDate && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('bdVerifiedOn')} {new Date(booking.verificationDate).toLocaleDateString()}
                </p>
              )}
              {booking.aiVerificationScore != null && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('bdConfidenceScore')}: {booking.aiVerificationScore}%
                </p>
              )}
            </div>

            {/* DL Front */}
            {booking.licensePhotoUrl ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bdDLFront')}</p>
                <img
                  src={booking.licensePhotoUrl}
                  alt="Driver's License Front"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-400">
                {t('bdNoDLFront')}
              </div>
            )}

            {/* DL Back */}
            {booking.licenseBackPhotoUrl ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bdDLBack')}</p>
                <img
                  src={booking.licenseBackPhotoUrl}
                  alt="Driver's License Back"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-400">
                {t('bdNoDLBack')}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">{t('bdViewOnlyNotice')}</p>
          </div>
        </div>
      )}
    </>
  )
}
