'use client'

import { IoReceipt } from 'react-icons/io5'
import type { GrandTotal } from '@/app/lib/ai-booking/types'

interface GrandTotalCardProps {
  grandTotal: GrandTotal
  numberOfDays: number
  dailyRate: number
  onPay: () => void
  onBack?: () => void
  isLoading?: boolean
}

export default function GrandTotalCard({
  grandTotal,
  numberOfDays,
  dailyRate,
  onPay,
  onBack,
  isLoading,
}: GrandTotalCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
        <IoReceipt size={16} className="text-primary" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Order Summary
        </h4>
      </div>

      <div className="p-3 space-y-1.5">
        {/* Rental */}
        <Row
          label={`Rental: $${dailyRate.toFixed(2)} × ${numberOfDays} days`}
          amount={grandTotal.rental}
        />

        {/* Service Fee */}
        <Row label="Service fee (15%)" amount={grandTotal.serviceFee} />

        {/* Insurance */}
        {grandTotal.insurance > 0 && (
          <Row label="Insurance" amount={grandTotal.insurance} />
        )}

        {/* Delivery */}
        {grandTotal.delivery > 0 && (
          <Row label="Delivery" amount={grandTotal.delivery} />
        )}

        {/* Add-ons */}
        {grandTotal.addOns.map((addOn) => (
          <Row key={addOn.id} label={addOn.label} amount={addOn.amount} />
        ))}

        {/* Tax */}
        <Row label={`Tax (${grandTotal.taxRate})`} amount={grandTotal.tax} />

        {/* Divider before deposit */}
        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

        {/* Deposit */}
        <Row
          label="Security deposit (refundable)"
          amount={grandTotal.deposit}
          muted
        />

        {/* Grand Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Grand Total
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              ${grandTotal.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button
          onClick={onPay}
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Preparing payment...' : 'Pay Now'}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, amount, muted }: { label: string; amount: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${muted ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-600 dark:text-gray-400'}`}>
        {label}
      </span>
      <span className={`text-xs font-medium ${muted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
        ${amount.toFixed(2)}
      </span>
    </div>
  )
}
