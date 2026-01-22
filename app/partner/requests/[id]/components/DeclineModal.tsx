// app/partner/requests/[id]/components/DeclineModal.tsx
// Modal for hosts to decline a booking request with two options:
// 1. Remove booking AND account (full removal)
// 2. Keep account, remove booking (stay for future opportunities)

'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoWarningOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoPersonOutline
} from 'react-icons/io5'

interface DeclineModalProps {
  onClose: () => void
  onSuccess: () => void
}

type DeclineOption = 'remove_all' | 'keep_account'

const DECLINE_REASONS = [
  { value: 'dates_unavailable', label: 'Dates don\'t work for me' },
  { value: 'rate_too_low', label: 'Rate is too low' },
  { value: 'car_unavailable', label: 'Car is no longer available' },
  { value: 'changed_mind', label: 'Changed my mind about hosting' },
  { value: 'other', label: 'Other reason' }
]

export default function DeclineModal({ onClose, onSuccess }: DeclineModalProps) {
  const [declineOption, setDeclineOption] = useState<DeclineOption | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState('')
  const [confirmedUnderstand, setConfirmedUnderstand] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reason = selectedReason === 'other' ? customReason : DECLINE_REASONS.find(r => r.value === selectedReason)?.label
  const canSubmit = declineOption && selectedReason && (selectedReason !== 'other' || customReason.trim()) && confirmedUnderstand

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/partner/onboarding/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          deleteAccount: declineOption === 'remove_all'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to decline request')
        return
      }

      onSuccess()
    } catch (err) {
      console.error('Decline error:', err)
      setError('Failed to decline request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoWarningOutline className="w-5 h-5 text-red-600" />
            Decline Request
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Decline Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What would you like to do?
            </label>
            <div className="space-y-3">
              {/* Option 1: Remove booking + account */}
              <button
                type="button"
                onClick={() => setDeclineOption('remove_all')}
                className={`w-full flex items-start gap-3 p-4 border-2 rounded-lg text-left transition-colors ${
                  declineOption === 'remove_all'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  declineOption === 'remove_all'
                    ? 'bg-red-100 dark:bg-red-900/50'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <IoTrashOutline className={`w-5 h-5 ${
                    declineOption === 'remove_all'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    declineOption === 'remove_all'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Remove booking & my account
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Delete this booking request and remove my ItWhip account completely. I'm not interested in hosting.
                  </p>
                </div>
              </button>

              {/* Option 2: Keep account, remove booking */}
              <button
                type="button"
                onClick={() => setDeclineOption('keep_account')}
                className={`w-full flex items-start gap-3 p-4 border-2 rounded-lg text-left transition-colors ${
                  declineOption === 'keep_account'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  declineOption === 'keep_account'
                    ? 'bg-orange-100 dark:bg-orange-900/50'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <IoPersonOutline className={`w-5 h-5 ${
                    declineOption === 'keep_account'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    declineOption === 'keep_account'
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Keep my account, remove this booking
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    I can't do this booking, but I'd like to stay on ItWhip for future opportunities.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Warning based on selection */}
          {declineOption && (
            <div className={`rounded-lg p-4 border ${
              declineOption === 'remove_all'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}>
              <p className={`text-sm ${
                declineOption === 'remove_all'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {declineOption === 'remove_all' ? (
                  <>
                    <strong>This will permanently delete your account.</strong> All your data will be removed and you won't receive any future booking opportunities.
                  </>
                ) : (
                  <>
                    <strong>This booking will be cancelled.</strong> You'll miss out on this opportunity, but we'll keep you in mind for future bookings that match your availability.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Reason Selection - Only show after option selected */}
          {declineOption && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Why are you declining? (helps us improve)
              </label>
              <div className="space-y-2">
                {DECLINE_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="declineReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Reason Input */}
          {selectedReason === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please specify
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tell us why you're declining..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>
          )}

          {/* Confirmation Checkbox */}
          {declineOption && selectedReason && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedUnderstand}
                onChange={(e) => setConfirmedUnderstand(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {declineOption === 'remove_all'
                  ? 'I understand this will permanently delete my account and all associated data.'
                  : 'I understand I will miss this booking opportunity but can receive future requests.'}
              </span>
            </label>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              declineOption === 'remove_all'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {submitting ? (
              <>
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : declineOption === 'remove_all' ? (
              'Delete Account'
            ) : (
              'Decline Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
