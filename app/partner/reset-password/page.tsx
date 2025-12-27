// app/partner/reset-password/page.tsx
// Partner password reset page - for newly approved Fleet Partners
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoArrowBackOutline,
  IoBriefcaseOutline
} from 'react-icons/io5'

function PartnerResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setError('Invalid or missing reset token')
      return
    }

    setTokenValid(true)
  }, [token])

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, text: '', color: '' }

    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'text-red-600' },
      { strength: 2, text: 'Fair', color: 'text-orange-600' },
      { strength: 3, text: 'Good', color: 'text-yellow-600' },
      { strength: 4, text: 'Strong', color: 'text-green-600' },
      { strength: 5, text: 'Very Strong', color: 'text-green-700' }
    ]

    return levels[strength]
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/partner/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setSuccess(true)

      // Redirect to partner login after success
      setTimeout(() => {
        router.push('/partner/login')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setTokenValid(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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

        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-6">
              <IoWarningOutline className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid or has expired. Please contact support for a new link.
              </p>
            </div>

            <a
              href="mailto:info@itwhip.com"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              Contact Partner Support
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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

        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <IoCheckmarkCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Set Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been created. Redirecting to partner login...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoBriefcaseOutline className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to ItWhip Partners!
              </h1>
              <p className="text-gray-600 text-sm">
                Create your password to access the Partner Dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <IoWarningOutline className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="w-5 h-5" />
                    ) : (
                      <IoEyeOutline className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {password && (
                  <p className={`text-xs mt-2 ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.text}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <IoEyeOffOutline className="w-5 h-5" />
                    ) : (
                      <IoEyeOutline className="w-5 h-5" />
                    )}
                  </button>
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
                    Setting Password...
                  </>
                ) : (
                  'Set Password & Continue'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start text-xs text-gray-600">
                <IoShieldCheckmarkOutline className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                <p>
                  For security, this link expires in 24 hours and can only be used once.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:info@itwhip.com" className="text-orange-600 hover:text-orange-700">
                info@itwhip.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PartnerResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <PartnerResetPasswordForm />
    </Suspense>
  )
}
