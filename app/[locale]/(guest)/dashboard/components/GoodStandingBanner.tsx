// app/(guest)/dashboard/components/GoodStandingBanner.tsx
'use client'

import { useState, useEffect } from 'react'

// SVG Icons
const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface GoodStandingBannerProps {
  notificationId: string
  appealId?: string
  reviewNotes?: string
  onDismiss: () => void
}

export default function GoodStandingBanner({
  notificationId,
  appealId,
  reviewNotes,
  onDismiss
}: GoodStandingBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissing, setIsDismissing] = useState(false)

  // Auto-dismiss after 30 seconds for success messages
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoDismiss()
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleAutoDismiss = async () => {
    await handleDismiss(true)
  }

  const handleDismiss = async (isAuto = false) => {
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
        if (!isAuto) {
          setIsVisible(false)
          onDismiss()
        }
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
      if (!isAuto) {
        setIsVisible(false)
        onDismiss()
      }
    } finally {
      setIsDismissing(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 mt-4 mb-4">
      {/* Dismiss Button */}
      <button
        onClick={() => handleDismiss(false)}
        disabled={isDismissing}
        className="absolute top-3 right-3 p-1 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
        aria-label="Dismiss notification"
      >
        <XIcon className="w-4 h-4 text-green-700 dark:text-green-300" />
      </button>

      <div className="flex items-start">
        {/* Icon */}
        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
            Appeal Approved - Restrictions Lifted
          </h3>
          
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Your appeal has been approved and account restrictions have been removed. You now have full access to all platform features.
          </p>

          {reviewNotes && (
            <div className="bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700 p-2.5 mb-3">
              <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                Review Notes:
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {reviewNotes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href="/profile?tab=status"
              className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
            >
              View Status
            </a>
            
            {appealId && (
              <a
                href={`/profile?tab=status&appeal=${appealId}`}
                className="inline-flex items-center px-3 py-1.5 border border-green-600 dark:border-green-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded text-sm font-medium transition-colors"
              >
                View Details
              </a>
            )}
          </div>

          {/* Auto-dismiss notice */}
          <p className="text-[10px] text-green-600 dark:text-green-400 mt-3 italic">
            This notification will auto-dismiss in 30 seconds
          </p>
        </div>
      </div>
    </div>
  )
}