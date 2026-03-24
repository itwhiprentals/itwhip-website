'use client'

// app/[locale]/verify/[id]/page.tsx
// Guest-facing identity verification page — branded ItWhip experience
// Creates Stripe session on-demand when guest clicks "Verify"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { IoShieldCheckmarkOutline, IoWarningOutline, IoIdCardOutline, IoCameraOutline, IoTimeOutline } from 'react-icons/io5'

export default function VerifyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const justVerified = searchParams.get('verified') === 'true'

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetch(`/api/verify/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load verification'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStartVerification = async () => {
    setStarting(true)
    try {
      const res = await fetch(`/api/verify/${id}`, { method: 'POST' })
      const result = await res.json()
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      } else {
        setError(result.error || 'Failed to start verification')
        setStarting(false)
      }
    } catch {
      setError('Failed to start verification')
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading verification...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <IoWarningOutline className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Unavailable</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Success state — just verified or already verified
  if (data?.status === 'verified' || justVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoShieldCheckmarkOutline className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Identity Verified</h2>
          {data?.verifiedName && (
            <p className="text-lg text-green-600 font-semibold mb-2">{data.verifiedName}</p>
          )}
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your identity has been verified successfully. {data?.partnerName} has been notified.
          </p>
          <p className="text-xs text-gray-400">Powered by ItWhip &middot; Verified by Stripe Identity</p>
        </div>
      </div>
    )
  }

  // Pending state — show "Verify" button
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10 text-center">
          <IoShieldCheckmarkOutline className="w-12 h-12 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Verify Your Identity</h1>
          <p className="text-orange-100 mt-2 text-sm">Requested by {data?.partnerName}</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Hi {data?.guestName?.split(' ')[0]}, please verify your identity to complete your{' '}
            {data?.purpose === 'rideshare' ? 'rideshare rental' : 'car rental'} with{' '}
            <strong>{data?.partnerName}</strong>.
          </p>

          {/* What you'll need */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoIdCardOutline className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Driver&apos;s License</p>
                <p className="text-xs text-gray-400">Front and back photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoCameraOutline className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Selfie</p>
                <p className="text-xs text-gray-400">Must match your ID photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoTimeOutline className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">~2 minutes</p>
                <p className="text-xs text-gray-400">Quick and secure process</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStartVerification}
            disabled={starting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {starting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Starting...
              </span>
            ) : (
              'Start Verification'
            )}
          </button>

          {/* Security note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
            Powered by <a href="https://stripe.com/identity" target="_blank" rel="noopener" className="text-orange-500 hover:underline">Stripe Identity</a>.
            Your data is encrypted and never shared without your consent.
          </p>
        </div>
      </div>
    </div>
  )
}
