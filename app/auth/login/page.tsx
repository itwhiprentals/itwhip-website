// app/auth/login/page.tsx
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
  IoCarOutline,
  IoArrowForwardOutline,
  IoAlertCircleOutline,
  IoPersonOutline
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

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [guard, setGuard] = useState<GuardResponse | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Handle OAuth error params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'no_account') {
      setError('No account found with this email. Please sign up first.')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if this is a guard response (HOST trying to access GUEST login)
        if (data.guard) {
          setGuard(data.guard)
          setIsLoading(false)
          return
        }
        throw new Error(data.error || 'Login failed')
      }

      // Success! Redirect based on role
      console.log('Login successful:', data.user)

      // Check if this is an account linking flow
      const linkingIntentStr = sessionStorage.getItem('linkingIntent')
      if (linkingIntentStr) {
        try {
          const linkingIntent = JSON.parse(linkingIntentStr)
          console.log('[Login] Account linking flow detected:', linkingIntent)

          // Clear the intent
          sessionStorage.removeItem('linkingIntent')

          // Redirect back to the linking page to complete the link
          const returnTo = searchParams.get('returnTo')
          if (returnTo) {
            router.push(returnTo)
            return
          }
        } catch (e) {
          console.error('[Login] Failed to parse linking intent:', e)
          sessionStorage.removeItem('linkingIntent')
        }
      }

      // ========== CRITICAL: Use window.location.href for HARD redirect ==========
      // router.push() is a soft navigation that doesn't reload the page
      // This means AuthContext doesn't refresh and Header shows "Sign In"
      // Hard redirect ensures Header/MobileMenu/Dashboard are all synced
      let redirectUrl = '/dashboard'
      switch(data.user.role) {
        case 'ADMIN':
          redirectUrl = '/admin/dashboard'
          break
        case 'DRIVER':
          redirectUrl = '/driver/dashboard'
          break
        case 'HOTEL':
          redirectUrl = '/hotel/dashboard'
          break
        case 'CLAIMED':     // Users who claimed guest bookings
        case 'STARTER':     // Basic tier users
        case 'BUSINESS':    // Business tier users
        case 'ENTERPRISE':  // Enterprise tier users
        case 'GUEST':       // Legacy guest role if any
        case 'ANONYMOUS':   // Anonymous users who registered
          redirectUrl = '/dashboard'
          break
        default:
          redirectUrl = '/dashboard' // Guest dashboard as fallback
      }
      console.log('[Login] Hard redirect to:', redirectUrl)
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // ========================================================================
  // GUARD SCREEN: HOST user trying to access GUEST login
  // ========================================================================
  if (guard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {guard.title}
                </h1>
                <p className="text-gray-400 mb-4">
                  {guard.message}
                </p>
              </div>

              {/* User Info */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{formData.email}</p>
                    <p className="text-gray-400 text-sm">Host Account</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push(guard.actions.primary.url)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  {guard.actions.primary.label}
                </button>
                {guard.actions.secondary && (
                  <button
                    onClick={() => router.push(guard.actions.secondary!.url)}
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    {guard.actions.secondary.label}
                  </button>
                )}
                <button
                  onClick={() => {
                    setGuard(null)
                    setFormData({ email: '', password: '' })
                  }}
                  className="block w-full py-2 text-sm text-gray-400 hover:text-white transition-colors text-center"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Guest / Renter Login
              </h1>
              <p className="text-gray-400">
                Sign in to book cars and manage your trips
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <OAuthButtons
              theme="guest"
              roleHint="guest"
              callbackUrl="/dashboard"
              showDivider={true}
              mode="login"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMailOutline className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white placeholder-gray-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoLockClosedOutline className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    ) : (
                      <IoEyeOutline className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Role Selection Card */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <Link
                href="/host/login"
                className="block p-4 bg-gradient-to-r from-green-900/40 to-green-800/30 border border-green-700/50 rounded-lg hover:border-green-500 hover:bg-green-800/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
                      <IoCarOutline className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Are You a Car Owner?</p>
                      <p className="text-green-400/80 text-xs">Host Portal Login</p>
                    </div>
                  </div>
                  <IoArrowForwardOutline className="w-5 h-5 text-green-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Need help? Contact our Quick Response Support
            </p>
            <p className="text-xs text-gray-500">
              Typical response within 1-2 hours • Available 7 days a week
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <LoginContent />
    </Suspense>
  )
}
