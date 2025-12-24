// app/suspended/page.tsx
// Landing page for suspended users
// Shows suspension details and provides contact support option

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

interface SuspensionDetails {
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

function SuspendedContent() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') || 'both'
  const [suspensionDetails, setSuspensionDetails] = useState<SuspensionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSuspensionDetails() {
      try {
        const response = await fetch('/api/user/suspension-status')
        if (response.ok) {
          const data = await response.json()
          setSuspensionDetails(data)
        }
      } catch (error) {
        console.error('[Suspended Page] Failed to fetch details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuspensionDetails()
  }, [])

  const getRoleText = () => {
    const role = suspensionDetails?.affectedRole || roleParam
    switch (role) {
      case 'both':
        return 'account'
      case 'guest':
        return 'guest account'
      case 'host':
        return 'host account'
      default:
        return 'account'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h1 className="mt-3 text-center text-2xl font-bold text-white">
            Account Suspended
          </h1>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Loading suspension details...
              </p>
            </div>
          ) : suspensionDetails?.hasSuspension ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                Your <span className="font-semibold">{getRoleText()}</span> has been suspended.
              </p>

              {/* Reason */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-xs font-semibold text-red-900 dark:text-red-200 uppercase mb-1">
                  Reason
                </p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  {suspensionDetails.reason}
                </p>
              </div>

              {/* Cross-role warning */}
              {suspensionDetails.crossRoleWarning && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {suspensionDetails.crossRoleWarning}
                  </p>
                </div>
              )}

              {/* Expiration or Permanent */}
              {suspensionDetails.isPermanent ? (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Status
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    ⚠️ Permanent Suspension
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Contact support if you believe this is an error.
                  </p>
                </div>
              ) : suspensionDetails.expiresAt ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase mb-1">
                    Expires
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {new Date(suspensionDetails.expiresAt).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              ) : null}

              {/* What this means */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  What this means
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {(suspensionDetails.affectedRole === 'both' ||
                    suspensionDetails.affectedRole === 'guest') && (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>You cannot book or rent vehicles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Active bookings may be cancelled</span>
                      </li>
                    </>
                  )}
                  {(suspensionDetails.affectedRole === 'both' ||
                    suspensionDetails.affectedRole === 'host') && (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>You cannot list or manage vehicles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Your listings are hidden from search</span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>You can still access account settings</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No active suspension found. You should be able to access your account normally.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/support"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contact Support
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <a
              href="mailto:info@itwhip.com"
              className="text-red-600 dark:text-red-400 hover:underline"
            >
              info@itwhip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuspendedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SuspendedContent />
    </Suspense>
  )
}
