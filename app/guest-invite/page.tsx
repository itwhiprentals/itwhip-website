'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoCheckmarkCircle, IoWarning, IoTime, IoGift } from 'react-icons/io5'

function GuestInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState('')
  const [creditAmount, setCreditAmount] = useState(0)
  const [creditType, setCreditType] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid link')
      return
    }

    validateAndOnboard()
  }, [token])

  const validateAndOnboard = async () => {
    try {
      const response = await fetch('/api/guest-onboard/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 410) {
          setStatus('expired')
          setMessage(data.error || 'This link has expired')
        } else {
          setStatus('error')
          setMessage(data.error || 'Something went wrong')
        }
        return
      }

      if (data.success) {
        setStatus('success')
        setGuestName(data.guestName || '')
        setCreditAmount(data.creditAmount || 0)
        setCreditType(data.creditType || 'credit')
        setMessage(data.creditApplied
          ? `Your $${data.creditAmount} credit has been added!`
          : 'Welcome! Redirecting to your account...'
        )

        // Redirect to credits page
        setTimeout(() => {
          router.push(data.redirectUrl || '/payments/credits')
        }, 2000)
      }
    } catch (error) {
      console.error('Guest onboard validation error:', error)
      setStatus('error')
      setMessage('Failed to validate link. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            It<span className="text-orange-500">Whip</span>
          </h1>
          <p className="text-gray-500 mt-1">Welcome Gift</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <IoGift className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Claiming your credit...
              </h2>
              <p className="text-gray-500">
                Setting up your account
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome{guestName ? `, ${guestName}` : ''}!
              </h2>
              {creditAmount > 0 && (
                <div className="my-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">Credit Added</p>
                  <p className="text-3xl font-bold text-orange-600">${creditAmount.toFixed(0)}</p>
                </div>
              )}
              <p className="text-gray-500">
                {message}
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Redirecting to your account...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <IoTime className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Link Expired
              </h2>
              <p className="text-gray-500 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Your invitation link has expired after 72 hours. Contact us to receive a new one.
              </p>
              <a
                href="mailto:info@itwhip.com?subject=New%20Guest%20Invite%20Link%20Request&body=Hi%2C%0A%0AMy%20guest%20invitation%20link%20has%20expired.%20Could%20you%20please%20send%20me%20a%20new%20one%3F%0A%0AThank%20you!"
                className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Email Us for New Link
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <IoWarning className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-500 mb-6">
                {message}
              </p>
              <button
                onClick={() => {
                  setStatus('loading')
                  validateAndOnboard()
                }}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Questions? Email us at{' '}
            <a href="mailto:info@itwhip.com" className="text-orange-600 hover:underline">
              info@itwhip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            It<span className="text-orange-500">Whip</span>
          </h1>
          <p className="text-gray-500 mt-1">Welcome Gift</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <IoGift className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GuestInvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuestInviteContent />
    </Suspense>
  )
}
