'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { IoCheckmarkCircle, IoWarning, IoCarSport } from 'react-icons/io5'
import { useTranslations } from 'next-intl'

export default function GuestBookingLandingPage() {
  const t = useTranslations('GuestBookingLanding')
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState('')
  const [bookingCode, setBookingCode] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('invalidLink'))
      return
    }

    validateAndLogin()
  }, [token])

  const validateAndLogin = async () => {
    try {
      const response = await fetch('/api/guest-onboard/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || t('somethingWentWrong'))
        return
      }

      if (data.success) {
        setStatus('success')
        setGuestName(data.guestName || '')
        setBookingCode(data.bookingCode || '')
        setMessage(t('emailVerified'))

        // Redirect to server-side callback that sets cookies and redirects to dashboard
        setTimeout(() => {
          window.location.href = `/api/auth/guest-callback?token=${data.sessionToken}`
        }, 2000)
      }
    } catch (error) {
      console.error('Guest booking validation error:', error)
      setStatus('error')
      setMessage(t('failedToValidate'))
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
          <p className="text-gray-500 mt-1">{t('bookingAccess')}</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <IoCarSport className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('verifyingBooking')}
              </h2>
              <p className="text-gray-500">
                {t('settingUpAccount')}
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
                {guestName ? t('welcomeWithName', { guestName }) : t('welcome')}
              </h2>
              {bookingCode && (
                <div className="my-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">{t('booking')}</p>
                  <p className="text-lg font-bold text-orange-600">{bookingCode}</p>
                </div>
              )}
              <p className="text-gray-500">
                {message}
              </p>
              <p className="text-sm text-gray-400 mt-4">
                {t('redirectingToDashboard')}
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <IoWarning className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('somethingWentWrongTitle')}
              </h2>
              <p className="text-gray-500 mb-6">
                {message}
              </p>
              <button
                onClick={() => {
                  setStatus('loading')
                  validateAndLogin()
                }}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            {t('questionsEmail')}{' '}
            <a href="mailto:info@itwhip.com" className="text-orange-600 hover:underline">
              info@itwhip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
