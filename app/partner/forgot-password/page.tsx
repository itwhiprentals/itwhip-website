// app/partner/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IoMailOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoPersonOutline
} from 'react-icons/io5'

export default function PartnerForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Use host forgot-password API (partner = host in unified portal)
      const response = await fetch('/api/host/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setSuccess(true)
      setEmail('')

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                ItWhip
              </span>
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                Partner Portal
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            href="/partner/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Partner Login
          </Link>

          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoMailOutline className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your email to receive reset instructions
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 text-sm font-medium mb-1">
                      Check your email
                    </p>
                    <p className="text-green-700 text-xs">
                      If an account exists with this email, you will receive password reset instructions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <IoWarningOutline className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start text-xs text-gray-600">
                <IoInformationCircleOutline className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                <p>
                  For security, we'll send reset instructions to your email if an account exists.
                  The link expires in 1 hour.
                </p>
              </div>
            </div>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                href="/partner/login"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </div>

          {/* Guest Portal Redirect Section */}
          <div className="mt-8 bg-white rounded-lg border border-blue-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IoPersonOutline className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Looking to rent a car?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Guest accounts use a different login system.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  Go to Guest Reset
                  <svg
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Need help?{' '}
            <a
              href="mailto:info@itwhip.com"
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
