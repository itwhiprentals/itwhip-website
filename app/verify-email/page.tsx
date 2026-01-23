// app/verify-email/page.tsx
// Public page to verify email authenticity by reference ID

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

interface EmailVerification {
  valid: boolean
  email?: {
    referenceId: string
    recipientEmail: string
    subject: string
    emailType: string
    sentAt: string
    status: string
  }
  error?: string
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [verification, setVerification] = useState<EmailVerification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ref) {
      fetch(`/api/verify-email-reference?ref=${encodeURIComponent(ref)}`)
        .then(res => res.json())
        .then(data => {
          setVerification(data)
          setLoading(false)
        })
        .catch(() => {
          setVerification({ valid: false, error: 'Failed to verify' })
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [ref])

  // Format email type for display
  const formatEmailType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  // Mask email for privacy
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return `${local[0]}***@${domain}`
    return `${local.slice(0, 2)}***@${domain}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-orange-600">ItWhip</h1>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Email Verification</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!ref ? (
            // No reference provided
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter Reference ID</h2>
              <p className="text-gray-500 text-sm mb-4">
                Enter the reference ID from the email you want to verify.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const input = (e.target as HTMLFormElement).ref.value
                  if (input) {
                    window.location.href = `/verify-email?ref=${encodeURIComponent(input)}`
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  name="ref"
                  placeholder="REF-XX-XXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center font-mono"
                />
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Verify Email
                </button>
              </form>
            </div>
          ) : loading ? (
            // Loading
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Verifying...</p>
            </div>
          ) : verification?.valid ? (
            // Valid email
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-700">Verified</h2>
                <p className="text-gray-500 text-sm mt-1">This email was sent by ItWhip</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Reference</span>
                  <span className="font-mono text-sm font-medium text-orange-600">{verification.email?.referenceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Type</span>
                  <span className="text-sm font-medium">{formatEmailType(verification.email?.emailType || '')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Sent To</span>
                  <span className="text-sm font-medium">{maskEmail(verification.email?.recipientEmail || '')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Sent At</span>
                  <span className="text-sm font-medium">
                    {verification.email?.sentAt
                      ? new Date(verification.email.sentAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className={`text-sm font-medium ${
                    verification.email?.status === 'SENT' || verification.email?.status === 'DELIVERED'
                      ? 'text-green-600'
                      : verification.email?.status === 'BOUNCED' || verification.email?.status === 'FAILED'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}>
                    {verification.email?.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                This confirms the email originated from ItWhip&apos;s official systems.
              </p>
            </div>
          ) : (
            // Invalid/not found
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-700 mb-2">Not Found</h2>
              <p className="text-gray-500 text-sm mb-4">
                This reference ID was not found in our system. The email may be fraudulent or the reference is incorrect.
              </p>
              <p className="font-mono text-sm text-gray-400 bg-gray-50 rounded px-3 py-2 inline-block">
                {ref}
              </p>
              <div className="mt-6">
                <Link
                  href="/verify-email"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Try another reference
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          If you believe you received a fraudulent email, please contact{' '}
          <a href="mailto:support@itwhip.com" className="text-orange-600 hover:underline">support@itwhip.com</a>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
