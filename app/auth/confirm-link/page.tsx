// app/auth/confirm-link/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoLinkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoPersonOutline,
  IoBusinessOutline
} from 'react-icons/io5'

function ConfirmLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const type = searchParams.get('type') // 'guest' or 'host'

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login-required'>('loading')
  const [error, setError] = useState('')
  const [linkedAccount, setLinkedAccount] = useState<{ email: string; name?: string } | null>(null)
  const [waitingForHost, setWaitingForHost] = useState(false)

  useEffect(() => {
    if (!token || !type) {
      setStatus('error')
      setError('Invalid link. Missing token or type parameter.')
      return
    }

    if (type !== 'guest' && type !== 'host') {
      setStatus('error')
      setError('Invalid link type. Must be "guest" or "host".')
      return
    }

    confirmLink()
  }, [token, type])

  const confirmLink = async () => {
    if (!token || !type) return

    setStatus('loading')
    setError('')

    try {
      const endpoint = type === 'guest'
        ? '/api/account/link/confirm-guest'
        : '/api/account/link/confirm-host'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if authentication is required
        if (data.requiresAuth || response.status === 401) {
          setStatus('login-required')
          return
        }

        // Check if wrong account
        if (data.wrongAccount) {
          setStatus('error')
          setError(`${data.error} Expected: ${data.expectedEmail || 'different account'}`)
          return
        }

        // Check if already linked
        if (data.alreadyLinked) {
          setStatus('success')
          setLinkedAccount({ email: 'Already linked' })
          return
        }

        throw new Error(data.error || 'Confirmation failed')
      }

      // Success!
      if (type === 'guest' && data.waitingForHost) {
        // Guest confirmed, waiting for host
        setWaitingForHost(true)
        setLinkedAccount({ email: data.hostEmail })
        setStatus('success')
      } else {
        // Full link complete
        setLinkedAccount(data.linkedAccount || { email: 'Account linked' })
        setStatus('success')
      }

    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'An error occurred')
    }
  }

  const handleLogin = () => {
    // Redirect to login with return URL
    const returnTo = encodeURIComponent(`/auth/confirm-link?token=${token}&type=${type}`)
    router.push(`/auth/login?returnTo=${returnTo}`)
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoLinkOutline className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Confirming Account Link...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto" />
        </div>
      </div>
    )
  }

  // Login required state
  if (status === 'login-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              {type === 'host' ? (
                <IoBusinessOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <IoPersonOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Login Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Please log in to your <strong>{type}</strong> account to confirm the account linking.
            </p>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Log In to Continue</span>
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
              After logging in, you'll be redirected back here to complete the linking.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoCheckmarkCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            {waitingForHost ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Confirmation Recorded!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Your confirmation has been recorded. The host account has been notified to complete the linking.
                </p>

                {linkedAccount && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Host Account:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{linkedAccount.email}</p>
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    The host will receive an email with a link to complete the account linking. The link expires in 5 minutes.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Accounts Linked!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Your accounts have been successfully linked. You can now switch between host and guest roles.
                </p>

                {linkedAccount && linkedAccount.email !== 'Already linked' && linkedAccount.email !== 'Account linked' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Linked Account:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{linkedAccount.email}</p>
                    {linkedAccount.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{linkedAccount.name}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <Link
              href={type === 'host' ? '/host/dashboard' : '/dashboard'}
              className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Go to Dashboard
            </Link>

            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
              Use the role switcher in the header to switch between accounts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8"
        >
          <IoArrowBackOutline className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoAlertCircleOutline className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Link Failed
          </h1>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={confirmLink}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>

            <Link
              href="/host/settings"
              className="block w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-center"
            >
              Request New Link
            </Link>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
            Links expire after 5 minutes. If your link has expired, please request a new one.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent" />
      </div>
    }>
      <ConfirmLinkContent />
    </Suspense>
  )
}
