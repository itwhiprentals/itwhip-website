// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/EndTripConfirmSheet.tsx

'use client'

import { IoWarningOutline, IoLocationOutline, IoCheckmarkCircleOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'

interface EndTripConfirmSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  booking: any
  hoursRemaining: number
  gpsStatus: 'idle' | 'checking' | 'near' | 'far' | 'failed'
  gpsDistance: number | null
  onViewGuidelines: () => void
}

export function EndTripConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  booking,
  hoursRemaining,
  gpsStatus,
  gpsDistance,
  onViewGuidelines
}: EndTripConfirmSheetProps) {
  if (!isOpen) return null

  // Determine urgency level
  const isOverdue = hoursRemaining <= 0
  const isNearEnd = hoursRemaining > 0 && hoursRemaining <= 5
  const isModerate = hoursRemaining > 5 && hoursRemaining <= 24
  const isEarly = hoursRemaining > 24

  // Format time remaining
  const formatTimeRemaining = () => {
    if (isOverdue) return 'Trip has ended'
    if (hoursRemaining >= 24) {
      const days = Math.floor(hoursRemaining / 24)
      const hrs = Math.floor(hoursRemaining % 24)
      return `${days} day${days !== 1 ? 's' : ''}${hrs > 0 ? ` ${hrs}h` : ''}`
    }
    if (hoursRemaining >= 1) {
      const hrs = Math.floor(hoursRemaining)
      const mins = Math.floor((hoursRemaining % 1) * 60)
      return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${Math.floor(hoursRemaining * 60)} minutes`
  }

  // Calculate unused value (informational)
  const dailyRate = booking.dailyRate || 0
  const unusedValue = isOverdue ? 0 : (hoursRemaining / 24) * dailyRate
  const totalPaid = booking.totalAmount || 0
  const depositAmount = booking.depositAmount || 500

  // GPS distance display
  const distanceText = gpsDistance
    ? gpsDistance >= 1000
      ? `${(gpsDistance / 1000).toFixed(1)} km`
      : `${Math.round(gpsDistance)}m`
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          <div className="px-5 pb-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {isOverdue ? (
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              ) : isEarly ? (
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {isOverdue ? 'Return Vehicle Now' : isEarly ? 'End Trip Early?' : isModerate ? 'End Your Trip?' : 'Ready to Return?'}
                </h3>
                {!isOverdue && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeRemaining()} remaining on your rental
                  </p>
                )}
              </div>
            </div>

            {/* Urgency-based warning message */}
            {isOverdue && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-red-800 dark:text-red-300">
                  Your trip has ended. Please return the vehicle immediately to avoid late fees ($50/hr first hour, $25/hr after).
                </p>
              </div>
            )}

            {isEarly && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  You still have <span className="font-bold">{formatTimeRemaining()}</span> remaining.
                  Ending now means losing ~${unusedValue.toFixed(0)} in unused rental time with no refund.
                </p>
              </div>
            )}

            {isModerate && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  You have {formatTimeRemaining()} remaining. No refund will be issued for unused time.
                </p>
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Financial Summary</h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                  <span className="text-gray-900 dark:text-white">${dailyRate.toFixed(2)}/day</span>
                </div>
                {!isOverdue && !isNearEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Unused Time</span>
                    <span className="text-gray-900 dark:text-white">~{formatTimeRemaining()}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Refund for Unused Time</span>
                    <span className="font-bold text-red-600 dark:text-red-400">$0.00</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    No refunds for early returns per rental agreement
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 ml-5">
                    Returned in full if no damage to vehicle
                  </p>
                </div>
              </div>
            </div>

            {/* Before returning checklist */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Before returning:</h4>
              <div className="space-y-1.5">
                {[
                  'Remove all personal belongings',
                  'Return keys to host or lockbox',
                  'Top up fuel to pickup level',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS Status */}
            {gpsStatus === 'checking' && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
                <span className="text-xs text-blue-700 dark:text-blue-300">Checking your location...</span>
              </div>
            )}

            {gpsStatus === 'near' && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <IoLocationOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-700 dark:text-green-300">Near vehicle location</span>
              </div>
            )}

            {gpsStatus === 'far' && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <IoWarningOutline className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    {distanceText ? `~${distanceText} from vehicle` : 'You appear to be away from the vehicle'}
                  </span>
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                    Ending trip while not at the return location may result in deposit hold and account suspension.
                  </p>
                </div>
              </div>
            )}

            {gpsStatus === 'failed' && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <IoLocationOutline className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-300">Could not verify your location. Please make sure you&apos;re at the return location.</span>
              </div>
            )}

            {/* Guidelines link */}
            <div className="mb-4 text-center">
              <button
                onClick={onViewGuidelines}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                View end trip guidelines
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={onClose}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium text-sm transition-colors border border-gray-200 dark:border-gray-600"
              >
                Continue Trip
              </button>

              <button
                onClick={onConfirm}
                className="w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 px-4 rounded-lg font-medium text-sm transition-all shadow-[0_4px_0_0_#991b1b,0_6px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_3px_0_0_#991b1b,0_4px_8px_rgba(0,0,0,0.2)] active:shadow-[0_1px_0_0_#991b1b,0_2px_4px_rgba(0,0,0,0.15)] active:translate-y-[2px]"
              >
                End Trip Now
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
              This action cannot be undone. You will proceed to the vehicle inspection process.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
