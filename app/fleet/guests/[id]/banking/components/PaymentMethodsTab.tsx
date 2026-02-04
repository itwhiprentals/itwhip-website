// app/fleet/guests/[id]/banking/components/PaymentMethodsTab.tsx
'use client'

import { BankingData, formatDate, getBrandIcon } from '../types'
import { LockedPaymentMethodBadge } from './LockedPaymentMethodBadge'

interface PaymentMethodsTabProps {
  data: BankingData
}

export function PaymentMethodsTab({ data }: PaymentMethodsTabProps) {
  const hasActiveClaim = data.alerts?.hasActiveClaim || false

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>

      {/* Claim warning if cards are locked */}
      {hasActiveClaim && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            All payment methods are locked due to active claim(s). Guest cannot remove cards until claims are resolved.
          </p>
        </div>
      )}

      {data.paymentMethods.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">No payment methods on file</p>
      ) : (
        <div className="space-y-3">
          {data.paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getBrandIcon(pm.brand)}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {pm.brand} ****{pm.last4}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exp {pm.expiryMonth}/{pm.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {pm.isDefault && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    DEFAULT
                  </span>
                )}
                {pm.isLockedForClaim && (
                  <LockedPaymentMethodBadge reason="claim" />
                )}
                {pm.isLocked && !pm.isLockedForClaim && (
                  <LockedPaymentMethodBadge reason="booking" bookingCode={pm.lockedForBooking} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Bookings with locked cards */}
      {data.activeBookings.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Bookings (Payment Locked)</h4>
          <div className="space-y-2">
            {data.activeBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.bookingCode}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{booking.carName}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
