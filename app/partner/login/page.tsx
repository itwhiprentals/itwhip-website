// app/partner/login/page.tsx
// Partner Login Page - Enterprise-grade authentication

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoSunnyOutline,
  IoMoonOutline
} from 'react-icons/io5'

export default function PartnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial dark mode state
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/partner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        // ========== CRITICAL: Use window.location.href for HARD redirect ==========
        // router.push() is a soft navigation that doesn't reload the page
        // Hard redirect ensures Header/MobileMenu/Dashboard are all synced
        window.location.href = '/partner/dashboard'
        return
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
            Fleet Partner Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to manage your fleet
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

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
                  placeholder="partner@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

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
                  placeholder="Enter your password"
                  required
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

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/partner/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
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
                Not a partner yet?
              </span>
            </div>
          </div>

          {/* Apply Link */}
          <Link
            href="/partners/apply"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold rounded-lg transition-colors"
          >
            Apply to become a Fleet Partner
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
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
