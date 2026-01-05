// app/host/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoPersonOutline,
  IoArrowForwardOutline,
  IoSearchOutline
} from 'react-icons/io5'
import OAuthButtons from '@/app/components/auth/OAuthButtons'

// Guard response type for cross-account type login attempts
interface GuardResponse {
  type: string
  title: string
  message: string
  actions: {
    primary: { label: string; url: string }
    secondary?: { label: string; url: string }
  }
}

function HostLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [guard, setGuard] = useState<GuardResponse | null>(null)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'pending' | 'rejected' | 'suspended' | null
    message: string
  }>({ type: null, message: '' })

  // Handle OAuth redirect status params
  useEffect(() => {
    const status = searchParams.get('status')
    const errorParam = searchParams.get('error')

    if (errorParam === 'no_account') {
      setError('No host account found with this email. Please sign up first.')
    } else if (status === 'pending') {
      setStatusMessage({
        type: 'pending',
        message: 'Your application is being reviewed. We\'ll notify you within 24-48 hours once approved.'
      })
    } else if (status === 'rejected') {
      setStatusMessage({
        type: 'rejected',
        message: 'Your host application was rejected. Please contact support for details.'
      })
    } else if (status === 'suspended') {
      setStatusMessage({
        type: 'suspended',
        message: 'Your account has been suspended. Please contact support.'
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/host/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if this is a guard response (GUEST trying to access HOST login)
        if (data.guard) {
          setGuard(data.guard)
          setIsLoading(false)
          return
        }

        // Handle specific status messages
        if (data.status) {
          switch (data.status) {
            case 'PENDING':
              setStatusMessage({
                type: 'pending',
                message: 'Your application is being reviewed. We\'ll notify you within 24-48 hours once approved.'
              })
              break
            case 'REJECTED':
              setStatusMessage({
                type: 'rejected',
                message: `Application rejected: ${data.reason || 'Please contact support for details'}`
              })
              break
            case 'SUSPENDED':
              setStatusMessage({
                type: 'suspended',
                message: `Account suspended: ${data.reason || 'Please contact support'}`
              })
              break
            default:
              setError(data.error || 'Login failed')
          }
        } else {
          setError(data.error || 'Invalid email or password')
        }
        return
      }

      // ========== CRITICAL: Use window.location.href for HARD redirect ==========
      // router.push() is a soft navigation that doesn't reload the page
      // This means AuthContext doesn't refresh and Header shows "Sign In"
      // Hard redirect ensures Header/MobileMenu/Dashboard are all synced
      const redirectUrl = data.redirect || '/host/dashboard'
      console.log('[Host Login] Hard redirect to:', redirectUrl)
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ========================================================================
  // GUARD SCREEN: GUEST user trying to access HOST login
  // ========================================================================
  if (guard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-transparent dark:border-gray-700">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {guard.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {guard.message}
                </p>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{email}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Guest Account</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push(guard.actions.primary.url)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  {guard.actions.primary.label}
                </button>
                {guard.actions.secondary && (
                  <button
                    onClick={() => router.push(guard.actions.secondary!.url)}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    {guard.actions.secondary.label}
                  </button>
                )}
                <button
                  onClick={() => {
                    setGuard(null)
                    setEmail('')
                    setPassword('')
                  }}
                  className="block w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-center"
                >
                  Use a Different Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-transparent dark:border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Host / Car Owner Login
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to manage your vehicles and earnings
              </p>
            </div>

            {/* Status Messages */}
            {statusMessage.type && (
              <div className={`mb-6 p-4 rounded-lg ${
                statusMessage.type === 'pending'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  : statusMessage.type === 'rejected'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}>
                <div className="flex items-start gap-3">
                  {statusMessage.type === 'pending' ? (
                    <IoTimeOutline className="text-2xl text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  ) : statusMessage.type === 'rejected' ? (
                    <IoCloseCircleOutline className="text-2xl text-red-600 dark:text-red-400 mt-0.5" />
                  ) : (
                    <IoAlertCircleOutline className="text-2xl text-orange-600 dark:text-orange-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      statusMessage.type === 'pending'
                        ? 'text-yellow-900 dark:text-yellow-200'
                        : statusMessage.type === 'rejected'
                        ? 'text-red-900 dark:text-red-200'
                        : 'text-orange-900 dark:text-orange-200'
                    }`}>
                      {statusMessage.type === 'pending'
                        ? 'Application Under Review'
                        : statusMessage.type === 'rejected'
                        ? 'Application Rejected'
                        : 'Account Suspended'}
                    </h3>
                    <p className={`text-sm ${
                      statusMessage.type === 'pending'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : statusMessage.type === 'rejected'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      {statusMessage.message}
                    </p>
                    {statusMessage.type === 'rejected' && (
                      <Link
                        href="/host/signup"
                        className="inline-block mt-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                      >
                        Apply again →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <OAuthButtons
              theme="host"
              roleHint="host"
              callbackUrl="/host/dashboard"
              showDivider={true}
              mode="login"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMailOutline className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="you@example.com"
                    required
                    suppressHydrationWarning={true}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoLockClosedOutline className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                    suppressHydrationWarning={true}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    suppressHydrationWarning={true}
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <IoEyeOutline className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link
                  href="/host/forgot-password"
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                suppressHydrationWarning={true}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New to ItWhip?{' '}
                <Link
                  href="/host/signup"
                  className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  Become a host
                </Link>
              </p>
            </div>

            {/* Role Selection Card */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/auth/login"
                className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <IoSearchOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Looking to Rent a Car?</p>
                      <p className="text-blue-600/80 dark:text-blue-400/80 text-xs">Guest / Renter Login</p>
                    </div>
                  </div>
                  <IoArrowForwardOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact our Quick Response Support
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Typical response within 1-2 hours • Available 7 days a week
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HostLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
      </div>
    }>
      <HostLoginContent />
    </Suspense>
  )
}