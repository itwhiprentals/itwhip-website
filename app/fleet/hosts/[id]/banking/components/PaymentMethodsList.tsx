// app/fleet/hosts/[id]/banking/components/PaymentMethodsList.tsx
'use client'

import { IoBusinessOutline, IoCardOutline } from 'react-icons/io5'
import { PaymentMethod } from '../types'

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[]
  hasStripeConnect?: boolean
  hasStripeCustomer?: boolean
}

export function PaymentMethodsList({
  paymentMethods,
  hasStripeConnect = false,
  hasStripeCustomer = false
}: PaymentMethodsListProps) {
  // Don't show anything if no Stripe accounts - payment methods require Stripe
  if (!hasStripeConnect && !hasStripeCustomer) {
    return null
  }

  // Don't show if no payment methods
  if (paymentMethods.length === 0) {
    return null
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payment Methods ({paymentMethods.length})
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 ${
                method.isDefault
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    method.type === 'bank_account'
                      ? 'bg-blue-100 dark:bg-blue-900/40'
                      : 'bg-purple-100 dark:bg-purple-900/40'
                  }`}>
                    {method.type === 'bank_account' ? (
                      <IoBusinessOutline className="text-blue-600" />
                    ) : (
                      <IoCardOutline className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {method.type === 'bank_account'
                        ? `${method.brand || 'Bank'} ****${method.last4}`
                        : `${method.brand} ****${method.last4}`}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {method.type === 'bank_account'
                        ? `${method.accountType || 'checking'} • ${method.status || 'active'}`
                        : `Expires ${method.expiryMonth}/${method.expiryYear}`}
                    </p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
