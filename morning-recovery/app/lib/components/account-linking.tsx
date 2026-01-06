// app/lib/components/account-linking.tsx
// Component for linking guest and host accounts

'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AccountLinkingProps {
  currentUser: {
    id: string
    email: string
    legacyDualId?: string | null
    linkedAccountEmail?: string | null
  }
  userType?: 'host' | 'guest'
}

export function AccountLinking({ currentUser, userType = 'guest' }: AccountLinkingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [targetEmail, setTargetEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [requestId, setRequestId] = useState<string | null>(null)
  const [step, setStep] = useState<'initial' | 'verify'>('initial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAccountOptions, setShowAccountOptions] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/account/link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        // If account not found, show login/signup options
        if (data.error?.includes('No account found')) {
          setShowAccountOptions(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to send link request')
      }

      setRequestId(data.requestId)
      setStep('verify')
      setSuccess('Verification code sent! Please check your email.')

      // In development, show the code
      if (data.devCode) {
        alert(`Development Mode - Verification Code: ${data.devCode}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrLogin = (action: 'login' | 'signup') => {
    // Store linking intent in sessionStorage
    sessionStorage.setItem('linkingIntent', JSON.stringify({
      currentUserId: currentUser.id,
      currentUserEmail: currentUser.email,
      targetEmail,
      userType,
      returnPath: pathname
    }))

    // Redirect to appropriate page with linking context
    const targetPath = userType === 'host'
      ? (action === 'login' ? '/auth/login' : '/auth/signup')
      : (action === 'login' ? '/host/login' : '/host/signup')

    const url = new URL(targetPath, window.location.origin)
    url.searchParams.set('linking', 'true')
    url.searchParams.set('email', targetEmail)
    url.searchParams.set('returnTo', pathname)

    router.push(url.toString())
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/account/link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, verificationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify link')
      }

      setSuccess('Accounts successfully linked! Please refresh the page.')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('initial')
    setTargetEmail('')
    setVerificationCode('')
    setRequestId(null)
    setError(null)
    setSuccess(null)
  }

  const handleUnlink = async () => {
    setUnlinking(true)
    setError(null)

    try {
      const response = await fetch('/api/account/link/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlink accounts')
      }

      setSuccess('Accounts have been unlinked. Refreshing...')
      setShowUnlinkConfirm(false)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setShowUnlinkConfirm(false)
    } finally {
      setUnlinking(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Dual-Role Account Linking</h2>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Current Status</h3>
        {currentUser.legacyDualId ? (
          <div className="text-green-600 dark:text-green-400">
            <p className="font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your accounts are linked
            </p>
            {currentUser.linkedAccountEmail && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-7">
                Linked to: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{currentUser.linkedAccountEmail}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            Your account is not currently linked to another account.
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What is Account Linking?</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {userType === 'host'
            ? 'Link your host account with a guest account to access bookings and switch between roles seamlessly. Since one ID belongs to one person, you can only link one guest account to this host profile.'
            : 'Link your guest and host accounts to switch between roles seamlessly while maintaining separate profiles. Since one ID belongs to one person, you can only link one host account to this guest profile.'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Unlink Accounts?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to unlink your accounts? You will no longer be able to switch between host and guest roles. Both accounts will be notified.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                disabled={unlinking}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unlinking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Unlinking...
                  </>
                ) : (
                  'Yes, Unlink'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Don't allow linking if already linked */}
      {currentUser.legacyDualId ? (
        <div className="space-y-4">
          {userType === 'host' ? (
            <>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your accounts are linked. You can switch between roles using the role switcher in the header.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you need to link to a different account, you must first unlink the current connection.
                </p>
              </div>
              <button
                onClick={() => setShowUnlinkConfirm(true)}
                className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-medium rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Unlink Accounts
              </button>
            </>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                Your account is already linked. To unlink or link to a different account, please switch to your host account.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Use the role switcher in the header to switch to your host account, then go to Account Settings to manage the link.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Step 1: Request Link */}
          {step === 'initial' && !showAccountOptions && (
            <form onSubmit={handleRequestLink} className="space-y-4">
              <div>
                <label htmlFor="targetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {userType === 'host'
                    ? 'Email of Your Guest Account'
                    : 'Email of Your Host Account'}
                </label>
                <input
                  id="targetEmail"
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder={userType === 'host'
                    ? 'Enter your guest account email'
                    : 'Enter your host account email'}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {userType === 'host'
                    ? 'Enter the email address of your guest account that you want to link with this host account to access bookings.'
                    : 'Enter the email address of your host account that you want to link with this guest account.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !targetEmail}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Account Options (Login or Create) */}
          {step === 'initial' && showAccountOptions && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  No {userType === 'host' ? 'Guest' : 'Host'} Account Found
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                  We couldn't find a {userType === 'host' ? 'guest' : 'host'} account with the email <strong>{targetEmail}</strong>.
                  You can either login to an existing account or create a new one.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleCreateOrLogin('login')}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Login to Existing {userType === 'host' ? 'Guest' : 'Host'} Account</span>
                </button>

                <button
                  onClick={() => handleCreateOrLogin('signup')}
                  className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Create New {userType === 'host' ? 'Guest' : 'Host'} Account</span>
                </button>

                <button
                  onClick={() => {
                    setShowAccountOptions(false)
                    setTargetEmail('')
                    setError(null)
                  }}
                  className="w-full px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  required
                  maxLength={8}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-lg tracking-wider"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the verification code sent to {targetEmail}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 8}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Link Accounts'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
