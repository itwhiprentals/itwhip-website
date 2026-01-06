// app/host/components/PaymentMethodCard.tsx
'use client'

import { IoCheckmarkCircle, IoTrashOutline, IoCardOutline, IoBusinessOutline } from 'react-icons/io5'

interface PaymentMethod {
  id: string
  type: 'bank_account' | 'card'
  bankName?: string
  brand?: string
  last4: string
  accountType?: string
  expMonth?: number
  expYear?: number
  status?: string
  isDefault: boolean
}

interface PaymentMethodCardProps {
  method: PaymentMethod
  onDelete: (methodId: string) => void
  onSetDefault: (methodId: string) => void
}

export default function PaymentMethodCard({ method, onDelete, onSetDefault }: PaymentMethodCardProps) {
  const isBankAccount = method.type === 'bank_account'
  const isCard = method.type === 'card'

  // Clean up bank name display - remove "STRIPE TEST" prefix
  const displayBankName = method.bankName?.replace('STRIPE TEST', '').trim() || 'Bank Account'

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        {/* Left side - Icon and Details */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isBankAccount ? (
              <IoBusinessOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <IoCardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {isBankAccount ? (
                    <span>{displayBankName} ****{method.last4}</span>
                  ) : (
                    <span>{method.brand} ****{method.last4}</span>
                  )}
                </p>
                
                {/* Badges below title */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {method.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      <IoCheckmarkCircle className="w-3 h-3 mr-0.5" />
                      Default
                    </span>
                  )}

                  {method.status === 'verified' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </span>
                  )}

                  {method.status === 'new' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  )}
                </div>

                {/* Account details */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {isBankAccount && (
                    <>
                      {method.accountType === 'checking' ? 'Checking' : 'Savings'} • ****{method.last4}
                    </>
                  )}
                  {isCard && (
                    <>
                      Expires {method.expMonth}/{method.expYear} • Instant Payouts
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Make Default button - below content on mobile, hidden on desktop */}
            {!method.isDefault && (
              <div className="mt-3 sm:hidden">
                <button
                  onClick={() => onSetDefault(method.id)}
                  className="w-full px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Make Default
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-start gap-2 ml-2">
          {/* Make Default button for desktop only */}
          {!method.isDefault && (
            <button
              onClick={() => onSetDefault(method.id)}
              className="hidden sm:block px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Make Default
            </button>
          )}
          
          {/* Remove button - same style for both mobile and desktop */}
          <button
            onClick={() => onDelete(method.id)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm"
            title="Remove payment method"
          >
            <span className="sm:hidden">Remove</span>
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* Micro-deposit message */}
      {isBankAccount && method.status === 'new' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Micro-deposits sent. Verify the amounts to activate this account for payouts.
          </p>
        </div>
      )}
    </div>
  )
}