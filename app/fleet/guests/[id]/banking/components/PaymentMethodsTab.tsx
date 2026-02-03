// app/fleet/guests/[id]/banking/components/PaymentMethodsTab.tsx
'use client'

import { IoLockClosedOutline } from 'react-icons/io5'
import { BankingData, formatDate, getBrandIcon } from '../types'

interface PaymentMethodsTabProps {
  data: BankingData
}

export function PaymentMethodsTab({ data }: PaymentMethodsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
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
              <div className="flex items-center gap-2">
                {pm.isDefault && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    DEFAULT
                  </span>
                )}
                {pm.isLocked && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full flex items-center gap-1">
                    <IoLockClosedOutline className="w-3 h-3" />
                    LOCKED
                  </span>
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
