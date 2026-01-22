// app/partner/settings/components/DeleteAccountModal.tsx
'use client'

import { useState } from 'react'
import {
  IoTrashOutline,
  IoCloseOutline,
  IoWarningOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCardOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from 'react-icons/io5'

const DELETION_REASONS = [
  { value: 'no_longer_need', label: 'No longer need the service' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'too_expensive', label: 'Service is too expensive' },
  { value: 'poor_experience', label: 'Had a poor experience' },
  { value: 'other', label: 'Other reason' }
]

interface DeleteAccountModalProps {
  isOpen: boolean
  email: string
  onClose: () => void
  onDelete: (password: string, reason: string) => Promise<{ success: boolean; deletionDate?: string; error?: string }>
}

export function DeleteAccountModal({ isOpen, email, onClose, onDelete }: DeleteAccountModalProps) {
  const [step, setStep] = useState<'confirm' | 'password' | 'success'>('confirm')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionDate, setDeletionDate] = useState<string | null>(null)

  const resetModal = () => {
    setStep('confirm')
    setPassword('')
    setShowPassword(false)
    setReason('')
    setOtherReason('')
    setError('')
    setDeletionDate(null)
    onClose()
  }

  const handleDelete = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setError('')
    setIsDeleting(true)

    try {
      const finalReason = reason === 'other' ? otherReason : reason
      const result = await onDelete(password, finalReason)

      if (result.success) {
        setDeletionDate(result.deletionDate || null)
        setStep('success')
      } else {
        setError(result.error || 'Failed to delete account')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <IoTrashOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Account
            </h3>
          </div>
          <button
            onClick={resetModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      30-Day Grace Period
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Your account will be scheduled for deletion in 30 days. You can cancel this request at any time during the grace period by logging back in.
                    </p>
                  </div>
                </div>
              </div>

              {/* What Will Be Deleted */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  What will be deleted:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <IoPersonOutline className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Your partner profile and company information</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <IoCarOutline className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Your fleet listings and vehicle data</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <IoCardOutline className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Payout history and banking information</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <IoDocumentTextOutline className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Booking history and analytics</span>
                  </div>
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Why are you leaving? *
                </label>
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    setError('')
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a reason...</option>
                  {DELETION_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {reason === 'other' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please tell us more..."
                    className="w-full mt-2 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
                    rows={3}
                  />
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                      Confirm Account Deletion
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Enter your password to confirm. A confirmation email will be sent to <span className="font-medium">{email}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter your password to confirm *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="w-5 h-5" />
                    ) : (
                      <IoEyeOutline className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoTimeOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Deletion Scheduled
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your account is scheduled for deletion on:
              </p>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4">
                {deletionDate ? new Date(deletionDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '30 days from now'}
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Changed your mind?</strong> Simply log in anytime before the deletion date to cancel this request. A confirmation email has been sent to your email address.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          {step === 'confirm' && (
            <>
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reason) {
                    setError('Please select a reason for leaving')
                    return
                  }
                  setError('')
                  setStep('password')
                }}
                className="flex-1 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Continue
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <button
                onClick={() => {
                  setStep('confirm')
                  setPassword('')
                  setError('')
                }}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <IoTrashOutline className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'success' && (
            <button
              onClick={resetModal}
              className="w-full px-4 py-2.5 text-sm bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
