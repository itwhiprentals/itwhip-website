// app/partners/apply/start/page.tsx
// Simplified Partner Signup - Name, Email, Password only
// Additional details (company, fleet, insurance) can be added in settings later

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'
import { useSession } from 'next-auth/react'
import OAuthButtons from '@/app/components/auth/OAuthButtons'

function PartnerSignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const inviteToken = searchParams.get('token')
  const isOAuthUser = searchParams.get('oauth') === 'true' && session?.user

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)

    // Pre-fill from OAuth session if available
    if (isOAuthUser && session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [isOAuthUser, session])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Client-side validation - OAuth users skip password checks
    if (!isOAuthUser) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service')
      setLoading(false)
      return
    }

    try {
      const requestBody: any = {
        name,
        email,
        inviteToken
      }

      // Only include password for non-OAuth users
      if (!isOAuthUser && password) {
        requestBody.password = password
      }

      // Mark as OAuth user if applicable
      if (isOAuthUser) {
        requestBody.isOAuthUser = true
        requestBody.oauthUserId = (session?.user as any)?.id
      }

      const response = await fetch('/api/partner/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // If there's an invite token, redirect to view the invitation
        // Otherwise redirect to partner login
        setTimeout(() => {
          if (inviteToken) {
            window.location.href = `/invite/view/${inviteToken}`
          } else {
            window.location.href = '/partner/login?registered=true'
          }
        }, 2000)
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <IoCheckmarkCircleOutline className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Account Created!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {inviteToken
                ? 'Redirecting you to view the invitation...'
                : 'Redirecting you to login...'}
            </p>
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <IoArrowBackOutline className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {isDark ? (
          <>
            <IoSunnyOutline className="w-5 h-5" />
            <span className="text-sm font-medium">Light</span>
          </>
        ) : (
          <>
            <IoMoonOutline className="w-5 h-5" />
            <span className="text-sm font-medium">Dark</span>
          </>
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 mt-8">
          <div className="inline-flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="ItWhip"
              width={80}
              height={80}
              className="dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt="ItWhip"
              width={80}
              height={80}
              className="hidden dark:block"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            {inviteToken ? 'Join as Car Owner' : 'Become a Partner'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {inviteToken
              ? 'Create your account to manage your vehicles'
              : 'Create an account to start earning with your fleet'}
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Invite Token Notice */}
            {inviteToken && !isOAuthUser && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  You&apos;ve been invited to join ItWhip as a car owner. Create your account to view and respond to the invitation.
                </p>
              </div>
            )}

            {/* OAuth Welcome Message */}
            {isOAuthUser && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Welcome, {session?.user?.name || 'Partner'}! Complete your registration below.
                </p>
              </div>
            )}

            {/* Google OAuth - Only show for non-OAuth users */}
            {!isOAuthUser && (
              <OAuthButtons
                theme="host"
                roleHint="partner"
                callbackUrl={inviteToken ? `/partners/apply/start?token=${inviteToken}` : '/partner/dashboard'}
                showDivider={true}
                mode="signup"
              />
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Fields - Only for non-OAuth users */}
            {!isOAuthUser && (
              <>
                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="w-5 h-5" />
                      ) : (
                        <IoEyeOutline className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline className="w-5 h-5" />
                      ) : (
                        <IoEyeOutline className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <IoArrowForwardOutline className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href={inviteToken ? `/partner/login?token=${inviteToken}` : '/partner/login'}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold rounded-lg transition-colors"
          >
            Sign In Instead
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>

        {/* Support Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <a href="mailto:partners@itwhip.com" className="text-orange-600 hover:underline">
              Contact Partner Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PartnerApplicationForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PartnerSignupForm />
    </Suspense>
  )
}
