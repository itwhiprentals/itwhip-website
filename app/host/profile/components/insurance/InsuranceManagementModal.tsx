// app/host/profile/components/insurance/InsuranceManagementModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { IoCloseOutline, IoWarningOutline, IoCheckmarkCircleOutline, IoTrendingDownOutline, IoTrendingUpOutline } from 'react-icons/io5'
import { calculateFinancialImpact } from '@/app/lib/insurance/tier-calculator'

interface InsuranceManagementModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'DELETE' | 'TOGGLE' | null
  insuranceType?: 'P2P' | 'COMMERCIAL'
  currentTier: {
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM'
    hostEarnings: number
    platformCommission: number
  }
  targetTier?: {
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM'
    hostEarnings: number
    platformCommission: number
  }
  onConfirm: (confirmationText?: string) => Promise<void>
  hasActiveBookings?: boolean
  nextAvailableDate?: Date | null
}

export default function InsuranceManagementModal({
  isOpen,
  onClose,
  action,
  insuranceType,
  currentTier,
  targetTier,
  onConfirm,
  hasActiveBookings = false,
  nextAvailableDate
}: InsuranceManagementModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('')
      setError(null)
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen || !action) return null

  const handleConfirm = async () => {
    if (action === 'DELETE' && confirmationText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await onConfirm(confirmationText)
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsProcessing(false)
    }
  }

  // Calculate financial impact
  const impact = targetTier
    ? calculateFinancialImpact(currentTier as any, targetTier as any, 1000)
    : null

  // Determine severity based on action and tiers
  const getSeverity = () => {
    if (!targetTier) return 'critical'
    if (targetTier.tier === 'BASIC') return 'critical'
    if (targetTier.hostEarnings < currentTier.hostEarnings) return 'warning'
    return 'info'
  }

  const severity = getSeverity()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {action === 'DELETE' ? 'Delete Insurance' : 'Switch Insurance'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {action === 'DELETE' 
                  ? `Removing ${insuranceType} insurance`
                  : `Switching to ${insuranceType} insurance`}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Active Bookings Warning */}
        {hasActiveBookings && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Action Blocked: Active Bookings
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                  You cannot modify insurance while you have active or future bookings.
                </p>
                {nextAvailableDate && (
                  <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                    Available after: {new Date(nextAvailableDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Earnings Change Display */}
          <div className={`p-4 rounded-lg border-2 ${
            severity === 'critical' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              : severity === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(currentTier.hostEarnings * 100)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {currentTier.tier}
                </p>
              </div>

              <div className="flex items-center justify-center px-4">
                {targetTier && targetTier.hostEarnings < currentTier.hostEarnings ? (
                  <IoTrendingDownOutline className="w-8 h-8 text-red-500" />
                ) : targetTier && targetTier.hostEarnings > currentTier.hostEarnings ? (
                  <IoTrendingUpOutline className="w-8 h-8 text-green-500" />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-gray-400">→</span>
                  </div>
                )}
              </div>

              <div className="text-center flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">New</p>
                <p className={`text-2xl font-bold ${
                  targetTier && targetTier.hostEarnings < currentTier.hostEarnings
                    ? 'text-red-600 dark:text-red-400'
                    : targetTier && targetTier.hostEarnings > currentTier.hostEarnings
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {targetTier ? Math.round(targetTier.hostEarnings * 100) : 40}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {targetTier?.tier || 'BASIC'}
                </p>
              </div>
            </div>

            {/* Financial Impact */}
            {impact && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Impact on $1,000 booking:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Current:</span>
                    <span className="block font-semibold">${impact.currentEarnings}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">New:</span>
                    <span className="block font-semibold">${impact.newEarnings}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Difference:</span>
                    <span className={`block font-semibold ${
                      impact.difference < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {impact.difference > 0 ? '+' : ''}{impact.difference < 0 ? '-' : ''}${Math.abs(impact.difference)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          {action === 'DELETE' && (
            <div className={`space-y-3 ${severity === 'critical' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
              <div className="flex items-start">
                <IoWarningOutline className={`w-5 h-5 mr-2 mt-0.5 ${
                  severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div className="text-sm space-y-2">
                  <p className="font-semibold">This action will:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Immediately reduce your earnings from {Math.round(currentTier.hostEarnings * 100)}% to {targetTier ? Math.round(targetTier.hostEarnings * 100) : 40}%</li>
                    <li>Require admin approval to add insurance again</li>
                    <li>Take effect on all future bookings</li>
                    <li>Cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input for Delete */}
          {action === 'DELETE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                disabled={hasActiveBookings || isProcessing}
                className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                  confirmationText === 'DELETE' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50`}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              hasActiveBookings || 
              isProcessing || 
              (action === 'DELETE' && confirmationText !== 'DELETE')
            }
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              severity === 'critical'
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                : severity === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {isProcessing ? 'Processing...' : action === 'DELETE' ? 'Delete Insurance' : 'Switch Insurance'}
          </button>
        </div>
      </div>
    </div>
  )
}