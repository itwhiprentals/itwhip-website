// app/(guest)/dashboard/components/AppealStatusBanner.tsx
'use client'

import { useState } from 'react'

// SVG Icons
const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CloseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

interface AppealStatusBannerProps {
  notificationId: string
  appealId?: string
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  originalAction?: string
  originalReason?: string
  onDismiss: () => void
}

export default function AppealStatusBanner({
  notificationId,
  appealId,
  reviewNotes,
  reviewedBy,
  reviewedAt,
  originalAction,
  originalReason,
  onDismiss
}: AppealStatusBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissing, setIsDismissing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleDismiss = async () => {
    setIsDismissing(true)

    try {
      const response = await fetch('/api/guest/appeal-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: 'dismiss'
        })
      })

      if (response.ok) {
        setIsVisible(false)
        onDismiss()
      } else {
        console.error('Failed to dismiss notification')
        // Still hide locally even if API fails
        setIsVisible(false)
        onDismiss()
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
      // Still hide locally even if API fails
      setIsVisible(false)
      onDismiss()
    } finally {
      setIsDismissing(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mt-4 mb-4">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        disabled={isDismissing}
        className="absolute top-3 right-3 p-1 rounded hover:bg-red-100 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
        aria-label="Dismiss notification"
      >
        <CloseIcon className="w-4 h-4 text-red-700 dark:text-red-300" />
      </button>

      <div className="flex items-start">
        {/* Icon */}
        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
            Appeal Not Approved
          </h3>
          
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Your appeal has been reviewed and was not approved. The original restrictions remain active on your account.
          </p>

          {/* Review Details Section */}
          {reviewNotes && (
            <div className="mb-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium transition-colors"
              >
                <span>{showDetails ? 'Hide' : 'View'} Review Details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>

              {showDetails && (
                <div className="mt-2 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700 p-2.5">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                        Decision Reason:
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {reviewNotes}
                      </p>
                    </div>

                    {(reviewedBy || reviewedAt) && (
                      <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                        {reviewedBy && <span>Reviewed by: {reviewedBy}</span>}
                        {reviewedAt && (
                          <span>{new Date(reviewedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <a
              href="/profile?tab=status"
              className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
              View Status
            </a>
            
            <a
              href="/support"
              className="inline-flex items-center px-3 py-1.5 border border-red-600 dark:border-red-500 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-sm font-medium transition-colors"
            >
              Contact Support
            </a>

            {appealId && (
              <a
                href={`/profile?tab=status&appeal=${appealId}`}
                className="inline-flex items-center px-3 py-1.5 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm font-medium transition-colors"
              >
                View Details
              </a>
            )}
          </div>

          {/* Info Notice */}
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded">
            <p className="text-xs text-orange-800 dark:text-orange-200">
              <strong>Next steps:</strong> You can contact support for clarification or if you have new information to provide.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}