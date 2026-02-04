// app/auth/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthPageLayout from '@/app/components/auth/AuthPageLayout'
import PhoneLoginButton from '@/app/components/auth/PhoneLoginButton'
import OAuthButtonsMinimal from '@/app/components/auth/OAuthButtonsMinimal'
import EmailLoginExpand from '@/app/components/auth/EmailLoginExpand'
import { IoAlertCircleOutline, IoPersonOutline } from 'react-icons/io5'

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
  const [error, setError] = useState('')
  const [guard, setGuard] = useState<GuardResponse | null>(null)
  const [guardEmail, setGuardEmail] = useState('')

  // Handle OAuth error params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'no_account') {
      setError('No account found with this email. Please sign up first.')
    } else if (errorParam === 'hidden-email') {
      setError('For car rentals, we need your real email address. Please sign in with Apple again and select "Share My Email".')
    } else if (errorParam === 'account-mismatch') {
      setError('There was a problem linking this account. Please try a different sign-in method.')
    }
  }, [searchParams])

  // Guard screen handler (passed to EmailLoginExpand via context or callback)
  const handleGuard = (guardData: GuardResponse, email: string) => {
    setGuard(guardData)
    setGuardEmail(email)
  }

  // Guard Screen
  if (guard) {
    return (
      <AuthPageLayout title="Account Notice">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <IoAlertCircleOutline className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">{guard.title}</h2>
          <p className="text-gray-400 mb-6">{guard.message}</p>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <IoPersonOutline className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{guardEmail}</p>
                <p className="text-gray-400 text-sm">Host Account</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(guard.actions.primary.url)}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all"
            >
              {guard.actions.primary.label}
            </button>
            {guard.actions.secondary && (
              <button
                onClick={() => router.push(guard.actions.secondary!.url)}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
              >
                {guard.actions.secondary.label}
              </button>
            )}
            <button
              onClick={() => {
                setGuard(null)
                setGuardEmail('')
              }}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Use a Different Account
            </button>
          </div>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout subtitle="Sign into your Guest account to book cars and manage your trips">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg mb-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Phone - Primary */}
      <PhoneLoginButton />

      {/* OAuth - Apple & Google */}
      <OAuthButtonsMinimal roleHint="guest" mode="login" />

      {/* Email - Expandable */}
      <EmailLoginExpand mode="login" onGuard={handleGuard} />

      {/* Forgot Password Link */}
      <div className="text-center">
        <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Forgot your password?
        </Link>
      </div>

      {/* Signup Link */}
      <div className="pt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Don't have a Guest account?{' '}
          <Link href="/auth/signup" className="text-green-600 dark:text-green-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      {/* Host Portal Link */}
      <div className="pt-4">
        <Link
          href="/host/login"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors border border-gray-700 text-sm"
        >
          Are you a car owner? Sign in to Host Portal →
        </Link>
      </div>
    </AuthPageLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthPageLayout>
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AuthPageLayout>
    }>
      <LoginContent />
    </Suspense>
  )
}
