// app/auth/reset-password/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

function ResetPasswordForm() {
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
      setError(t('invalidResetToken'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/auth/login')
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
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  ItWhip
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 mb-6">
              <IoWarningOutline className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">{t('invalidResetLink')}</h2>
              <p className="text-gray-400 mb-4">
                {t('resetLinkExpired')}
              </p>
            </div>

            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              {t('requestNewResetLink')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  ItWhip
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8">
              <IoCheckmarkCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">{t('passwordResetSuccess')}</h2>
              <p className="text-gray-400 mb-6">
                {t('passwordUpdated')}
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                ItWhip
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            {t('backToLogin')}
          </Link>

          {/* ✅ CHANGED: rounded-xl → rounded-lg */}
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoLockClosedOutline className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {t('createNewPassword')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('enterNewPassword')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center">
                  <IoWarningOutline className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                    placeholder={t('atLeast6Chars')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
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
                    {t('passwordStrength', { strength: passwordStrength.text })}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                    placeholder={t('confirmYourPassword')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
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
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-green-500/20"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    {t('resettingPassword')}
                  </>
                ) : (
                  t('resetPassword')
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-start text-xs text-gray-400">
                <IoShieldCheckmarkOutline className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  {t('resetLinkExpires1h')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}