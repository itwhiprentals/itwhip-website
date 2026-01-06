// app/fleet/guests/[id]/components/QuickActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// SVG Icons
const DocumentTextIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MailIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const XCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

interface QuickActionsProps {
  guestId: string
  guestName: string
  hasPendingAppeals: boolean
  pendingAppealsCount: number
  hasActiveWarnings: boolean
  warningCount: number
  accountStatus: 'ACTIVE' | 'WARNED' | 'SOFT_SUSPENDED' | 'HARD_SUSPENDED' | 'BANNED'
  onRefresh?: () => void
}

export default function QuickActions({
  guestId,
  guestName,
  hasPendingAppeals,
  pendingAppealsCount,
  hasActiveWarnings,
  warningCount,
  accountStatus,
  onRefresh
}: QuickActionsProps) {
  const router = useRouter()
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReviewAppeals = () => {
    // Navigate to appeals tab
    const url = `/fleet/guests/${guestId}?tab=appeals`
    router.push(url)
  }

  const handleViewHistory = () => {
    // Navigate to history/moderation tab
    const url = `/fleet/guests/${guestId}?tab=moderation`
    router.push(url)
  }

  const handleContactGuest = () => {
    // Navigate to messages or open contact modal
    const url = `/fleet/messages?guest=${guestId}`
    router.push(url)
  }

  const handleClearWarnings = async () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true)
      return
    }

    setClearing(true)
    setError(null)

    try {
      const response = await fetch(`/fleet/api/guests/${guestId}/clear-warnings?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to clear warnings')
      }

      // Success - refresh and close confirmation
      setShowConfirmClear(false)
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      console.error('Error clearing warnings:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear warnings')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Review Pending Appeals */}
        <button
          onClick={handleReviewAppeals}
          disabled={!hasPendingAppeals}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            hasPendingAppeals
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <ClockIcon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="truncate">Review Appeals</div>
            {hasPendingAppeals && (
              <div className="text-xs opacity-75">{pendingAppealsCount} pending</div>
            )}
          </div>
        </button>

        {/* Clear All Warnings */}
        <button
          onClick={handleClearWarnings}
          disabled={!hasActiveWarnings || clearing}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            hasActiveWarnings
              ? showConfirmClear
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          {showConfirmClear ? (
            <>
              <XCircleIcon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="truncate">Confirm Clear?</div>
                <div className="text-xs opacity-75">Click again</div>
              </div>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="truncate">Clear Warnings</div>
                {hasActiveWarnings && (
                  <div className="text-xs opacity-75">{warningCount} active</div>
                )}
              </div>
            </>
          )}
        </button>

        {/* View Full History */}
        <button
          onClick={handleViewHistory}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium transition-all"
        >
          <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="truncate">View History</div>
            <div className="text-xs opacity-75">All actions</div>
          </div>
        </button>

        {/* Contact Guest */}
        <button
          onClick={handleContactGuest}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium transition-all"
        >
          <MailIcon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="truncate">Contact Guest</div>
            <div className="text-xs opacity-75">Send message</div>
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <XCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation State Info */}
      {showConfirmClear && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrashIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Clear all warnings for {guestName}?
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                This will remove {warningCount} active warning{warningCount !== 1 ? 's' : ''} and create an audit trail entry. Click "Clear Warnings" again to confirm.
              </p>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 mt-2 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          accountStatus === 'ACTIVE' ? 'bg-green-500' :
          accountStatus === 'WARNED' ? 'bg-yellow-500' :
          accountStatus === 'SOFT_SUSPENDED' ? 'bg-orange-500' :
          accountStatus === 'HARD_SUSPENDED' ? 'bg-red-500' :
          'bg-gray-500'
        }`} />
        <span>
          Status: <span className="font-medium">{accountStatus.replace('_', ' ')}</span>
        </span>
      </div>
    </div>
  )
}