// app/components/SuspensionBanner.tsx
// In-app banner component to notify users about account suspensions
// Shows warnings when one or both roles are suspended

'use client'

import { useEffect, useState } from 'react'

interface SuspensionData {
  hasSuspension: boolean
  affectedRole: 'guest' | 'host' | 'both' | null
  reason: string
  expiresAt?: string
  crossRoleWarning?: string
  isPermanent: boolean
  details: {
    hostSuspended: boolean
    guestSuspended: boolean
    guestBanned: boolean
  }
}

export default function SuspensionBanner() {
  const [suspension, setSuspension] = useState<SuspensionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    async function checkSuspensionStatus() {
      try {
        const response = await fetch('/api/user/suspension-status')
        if (response.ok) {
          const data = await response.json()
          if (data.hasSuspension) {
            setSuspension(data)
          }
        }
      } catch (error) {
        console.error('[SuspensionBanner] Failed to check status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSuspensionStatus()
  }, [])

  // Don't show if still loading, no suspension, or dismissed
  if (isLoading || !suspension || isDismissed) {
    return null
  }

  const getRoleText = () => {
    switch (suspension.affectedRole) {
      case 'guest':
        return 'Guest Account Suspended'
      case 'host':
        return 'Host Account Suspended'
      case 'both':
        return 'Account Suspended'
      default:
        return 'Account Suspended'
    }
  }

  const getBannerColor = () => {
    if (suspension.isPermanent) {
      return 'border-red-600 bg-red-100 dark:bg-red-900/20'
    }
    return 'border-red-500 bg-red-50 dark:bg-red-900/10'
  }

  const getTextColor = () => {
    if (suspension.isPermanent) {
      return 'text-red-900 dark:text-red-200'
    }
    return 'text-red-800 dark:text-red-300'
  }

  return (
    <div className={`${getBannerColor()} border-l-4 p-4 mb-4 rounded-r-md`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${getTextColor()}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {getRoleText()}
          </h3>
          <div className={`mt-2 text-sm ${getTextColor()}`}>
            <p className="font-medium">{suspension.reason}</p>

            {suspension.crossRoleWarning && (
              <p className="mt-2 text-xs opacity-90">
                {suspension.crossRoleWarning}
              </p>
            )}

            {suspension.isPermanent ? (
              <p className="mt-2 text-xs font-semibold">
                ⚠️ This is a permanent suspension. Contact support if you believe this is an error.
              </p>
            ) : suspension.expiresAt ? (
              <p className="mt-2 text-xs">
                <span className="font-medium">Expires:</span>{' '}
                {new Date(suspension.expiresAt).toLocaleDateString('en-US', {
                  dateStyle: 'long'
                })}
              </p>
            ) : null}

            <div className="mt-3">
              <a
                href="/support"
                className="inline-flex items-center gap-1 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => setIsDismissed(true)}
            className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500`}
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
