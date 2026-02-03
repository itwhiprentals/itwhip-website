// app/fleet/hosts/[id]/banking/components/StripeCustomerCard.tsx
'use client'

import {
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'
import { BankingData } from '../types'

interface StripeCustomerCardProps {
  stripeCustomer: BankingData['stripeCustomer']
}

export function StripeCustomerCard({ stripeCustomer }: StripeCustomerCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoBusinessOutline className="text-purple-600" />
          Stripe Customer (Charging Host)
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        {stripeCustomer.customerId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer ID</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {stripeCustomer.customerId}
              </code>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
              {stripeCustomer.defaultPaymentMethod ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <IoCheckmarkCircleOutline />
                  On File
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                  <IoAlertCircleOutline />
                  None
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Used to charge host for subscriptions, damage claims, and fees
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <IoAlertCircleOutline className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No Stripe Customer account
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cannot charge this host
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
