// app/partner/requests/[id]/components/CounterOfferModal.tsx
// Modal for hosts to submit a counter-offer for the booking rate

'use client'

import { useLocale } from 'next-intl'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoCashOutline,
  IoCalculatorOutline,
  IoSendOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface CounterOfferModalProps {
  currentRate: number
  durationDays: number
  onClose: () => void
  onSuccess: () => void
}

export default function CounterOfferModal({
  currentRate,
  durationDays,
  onClose,
  onSuccess
}: CounterOfferModalProps) {
  const locale = useLocale()

  const [amount, setAmount] = useState<string>(currentRate.toString())
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numericAmount = parseFloat(amount) || 0
  const minRate = Math.floor(currentRate * 0.5)
  const maxRate = Math.ceil(currentRate * 2)
  const isValidAmount = numericAmount >= minRate && numericAmount <= maxRate

  // Calculations
  const newTotal = numericAmount * durationDays
  const platformFee = newTotal * 0.1
  const hostEarnings = newTotal - platformFee
  const difference = numericAmount - currentRate
  const percentChange = currentRate > 0 ? ((difference / currentRate) * 100).toFixed(0) : '0'

  const handleSubmit = async () => {
    if (!isValidAmount) {
      setError(`Rate must be between $${minRate} and $${maxRate} per day`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/partner/onboarding/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          note: note.trim() || undefined
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to submit counter-offer')
        return
      }

      onSuccess()
    } catch (err) {
      console.error('Counter-offer error:', err)
      setError('Failed to submit counter-offer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Bottom Sheet */}
      <div className="absolute top-[25%] bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl max-w-lg mx-auto transform transition-all animate-in slide-in-from-bottom duration-300 overflow-y-auto">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCashOutline className="w-5 h-5 text-orange-600" />
            Request Rate Adjustment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Rate */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Offered Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${currentRate}/day
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total: ${(currentRate * durationDays).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({durationDays} days)
            </p>
          </div>

          {/* Rate Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Preferred Rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minRate}
                max={maxRate}
                step="1"
                className={`w-full pl-8 pr-16 py-3 border rounded-lg text-lg font-semibold ${
                  isValidAmount
                    ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    : 'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/day</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Acceptable range: ${minRate} - ${maxRate}/day
            </p>
          </div>

          {/* Earnings Preview */}
          {isValidAmount && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <IoCalculatorOutline className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-300">New Earnings Estimate</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">New Total</span>
                  <span className="font-medium text-gray-900 dark:text-white">${newTotal.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (10%)</span>
                  <span className="text-gray-500 dark:text-gray-400">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-green-200 dark:border-green-700 pt-2 flex justify-between">
                  <span className="font-medium text-green-700 dark:text-green-300">You'll Receive</span>
                  <span className="font-bold text-green-700 dark:text-green-300">${hostEarnings.toFixed(2)}</span>
                </div>
              </div>
              {difference !== 0 && (
                <p className={`text-xs mt-2 ${difference > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {difference > 0 ? '+' : ''}{percentChange}% from offered rate
                </p>
              )}
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Similar cars in my area rent for $50-60/day on Turo..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Our team will review your request within 2 hours and respond via email.
          </p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 p-4 pb-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 safe-area-bottom">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValidAmount || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IoSendOutline className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
