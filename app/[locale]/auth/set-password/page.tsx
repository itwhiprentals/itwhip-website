// app/auth/set-password/page.tsx
// Page for converted guests to set their initial password (they don't have one yet)
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoArrowBackOutline,
  IoSunnyOutline,
  IoMoonOutline
} from 'react-icons/io5'

function SetPasswordForm() {
  const t = useTranslations('Auth')
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
  const [isDark, setIsDark] = useState(false)

  const token = searchParams.get('token')
  const redirectTo = searchParams.get('redirect')

  // Initialize dark mode from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setError('Invalid or missing setup link')
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
      { strength: 1, text: t('strengthWeak'), color: 'text-red-400' },
      { strength: 2, text: t('strengthFair'), color: 'text-orange-400' },
      { strength: 3, text: t('strengthGood'), color: 'text-yellow-400' },
      { strength: 4, text: t('strengthStrong'), color: 'text-green-400' },
      { strength: 5, text: t('strengthVeryStrong'), color: 'text-green-500' }
    ]

    return levels[strength]
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError(t('fillAllFields'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordMin6'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (!token) {
      setError(t('invalidSetupLink'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password setup failed')
      }

      setSuccess(true)

      setTimeout(() => {
        router.push(redirectTo || '/auth/login')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      // Check if it's a token error
      if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
        setTokenValid(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ItWhip"
                  width={100}
                  height={28}
                  className="h-7 w-auto dark:hidden"
                />
                <Image
                  src="/logo-white.png"
                  alt="ItWhip"
                  width={100}
                  height={28}
                  className="h-7 w-auto hidden dark:block"
                />
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? t('switchToLight') : t('switchToDark')}
              >
                {isDark ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-6 mb-5">
              <IoWarningOutline className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t('invalidSetupLink')}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {t('setupLinkExpired')}
              </p>
              <p className="text-gray-500 text-xs">
                {t('checkEmailLatest')}
              </p>
            </div>

            <Link
              href="/auth/login"
              className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors"
            >
              <IoArrowBackOutline className="w-4 h-4 mr-1.5" />
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ItWhip"
                  width={100}
                  height={28}
                  className="h-7 w-auto dark:hidden"
                />
                <Image
                  src="/logo-white.png"
                  alt="ItWhip"
                  width={100}
                  height={28}
                  className="h-7 w-auto hidden dark:block"
                />
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? t('switchToLight') : t('switchToDark')}
              >
                {isDark ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center">
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-6">
              <IoCheckmarkCircle className="w-10 h-10 text-green-500 dark:text-green-400 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('accountSecured')}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
                {redirectTo ? t('redirectingToBooking') : t('passwordSetRedirect')}
              </p>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 dark:border-green-400 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="ItWhip"
                width={100}
                height={28}
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/logo-white.png"
                alt="ItWhip"
                width={100}
                height={28}
                className="h-7 w-auto hidden dark:block"
              />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-5">
              <div className="w-11 h-11 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoLockClosedOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {t('secureYourAccount')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {t('setPasswordDesc')}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <div className="flex items-center">
                  <IoWarningOutline className="w-4 h-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
                  <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('createPassword')}
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    placeholder={t('atLeast6Chars')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="w-4 h-4" />
                    ) : (
                      <IoEyeOutline className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <p className={`text-[10px] mt-1.5 ${passwordStrength.color}`}>
                    {t('strengthLabel', { strength: passwordStrength.text })}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    placeholder={t('confirmYourPassword')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <IoEyeOffOutline className="w-4 h-4" />
                    ) : (
                      <IoEyeOutline className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] mt-1.5 text-red-500 dark:text-red-400">
                    {t('passwordsDoNotMatch')}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {t('settingPassword')}
                  </>
                ) : (
                  t('setPassword')
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-[10px] text-gray-400 dark:text-gray-500">
              {t('linkExpires7Days')}
            </p>
          </div>

          <p className="text-center mt-5 text-gray-500 text-xs">
            {t('alreadyHavePassword')}{' '}
            <Link href="/auth/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-400"></div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  )
}
