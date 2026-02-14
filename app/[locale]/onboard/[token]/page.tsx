'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { IoCheckmarkCircle, IoWarning, IoTime, IoRocketOutline } from 'react-icons/io5'

export default function OnboardTokenPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [prospectName, setProspectName] = useState('')

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
      const response = await fetch('/api/onboard/validate', {
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
        setProspectName(data.prospectName || '')
        setMessage('Welcome! Redirecting to your dashboard...')

        // Small delay to show success message
        setTimeout(() => {
          router.push('/partner/dashboard?section=requests')
        }, 1500)
      }
    } catch (error) {
      console.error('Onboard validation error:', error)
      setStatus('error')
      setMessage('Failed to validate link. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            It<span className="text-orange-500">Whip</span>
          </h1>
          <p className="text-gray-400 mt-1">Host Onboarding</p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <IoRocketOutline className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying your link...
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Setting up your host account
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome{prospectName ? `, ${prospectName}` : ''}!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {message}
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <IoTime className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Link Expired
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Your invitation link has expired after 48 hours. Contact us to receive a new one.
              </p>
              <a
                href="mailto:info@itwhip.com?subject=New%20Invite%20Link%20Request&body=Hi%2C%0A%0AMy%20invitation%20link%20has%20expired.%20Could%20you%20please%20send%20me%20a%20new%20one%3F%0A%0AThank%20you!"
                className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Email Us for New Link
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <IoWarning className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
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
        <p className="text-center text-gray-500 text-sm mt-6">
          Having trouble?{' '}
          <a href="mailto:info@itwhip.com" className="text-orange-500 hover:text-orange-400">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
