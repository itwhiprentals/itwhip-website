// app/host/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthPageLayout from '@/app/components/auth/AuthPageLayout'
import PhoneLoginButton from '@/app/components/auth/PhoneLoginButton'
import OAuthButtonsMinimal from '@/app/components/auth/OAuthButtonsMinimal'
import EmailLoginExpand from '@/app/components/auth/EmailLoginExpand'
import {
  IoAlertCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoPersonOutline
} from 'react-icons/io5'

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
  const [error, setError] = useState('')
  const [guard, setGuard] = useState<GuardResponse | null>(null)
  const [guardEmail, setGuardEmail] = useState('')
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
    } else if (errorParam === 'hidden-email') {
      setError('For car rentals, we need your real email address. Please sign in with Apple again and select "Share My Email".')
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

  // Guard Screen
  if (guard) {
    return (
      <AuthPageLayout hostMode title="Account Notice">
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
                <p className="text-gray-400 text-sm">Guest Account</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(guard.actions.primary.url)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
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
    <AuthPageLayout
      hostMode
      subtitle="Sign in to manage your vehicles and earnings"
    >
      {/* Status Messages */}
      {statusMessage.type && (
        <div className={`p-4 rounded-lg mb-2 ${
          statusMessage.type === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/50' :
          statusMessage.type === 'rejected' ? 'bg-red-500/10 border border-red-500/50' :
          'bg-orange-500/10 border border-orange-500/50'
        }`}>
          <div className="flex items-start gap-3">
            {statusMessage.type === 'pending' && <IoTimeOutline className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
            {statusMessage.type === 'rejected' && <IoCloseCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {statusMessage.type === 'suspended' && <IoAlertCircleOutline className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />}
            <p className={`text-sm ${
              statusMessage.type === 'pending' ? 'text-yellow-400' :
              statusMessage.type === 'rejected' ? 'text-red-400' :
              'text-orange-400'
            }`}>
              {statusMessage.message}
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg mb-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Phone - Primary */}
      <PhoneLoginButton hostMode />

      {/* OAuth - Apple & Google */}
      <OAuthButtonsMinimal roleHint="host" mode="login" />

      {/* Email - Expandable */}
      <EmailLoginExpand mode="login" hostMode />

      {/* Signup Link */}
      <div className="pt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Don't have a host account?{' '}
          <Link href="/host/signup" className="text-green-600 dark:text-green-400 hover:underline font-medium">
            Apply to become a host
          </Link>
        </p>
      </div>

      {/* Guest Portal Link */}
      <div className="pt-4">
        <Link
          href="/auth/login"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors border border-gray-300 dark:border-gray-600 text-sm"
        >
          Looking to rent a car? Sign in as Guest →
        </Link>
      </div>
    </AuthPageLayout>
  )
}

export default function HostLoginPage() {
  return (
    <Suspense fallback={
      <AuthPageLayout hostMode>
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AuthPageLayout>
    }>
      <HostLoginContent />
    </Suspense>
  )
}
