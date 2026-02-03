'use client'

import { useState } from 'react'
import PasswordVerification from './PasswordVerification'
import EmailOtpVerification from './EmailOtpVerification'
import VerifyLinkSuccess from './VerifyLinkSuccess'

interface VerifyLinkInfo {
  maskedEmail: string
  maskedPhone: string | null
  hasPassword: boolean
  hasPhone: boolean
  providerName: string
  userName: string | null
}

interface VerifyLinkFormProps {
  token: string
  info: VerifyLinkInfo
}

type VerificationMethod = 'password' | 'email-otp'

export default function VerifyLinkForm({ token, info }: VerifyLinkFormProps) {
  const [method, setMethod] = useState<VerificationMethod>(
    info.hasPassword ? 'password' : 'email-otp'
  )
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSuccess = () => {
    setError('')
    setSuccess(true)
  }

  const handleError = (message: string) => {
    setError(message)
  }

  if (success) {
    return <VerifyLinkSuccess providerName={info.providerName} />
  }

  // Available methods
  const methods: { key: VerificationMethod; label: string; available: boolean }[] = [
    { key: 'password', label: 'Password', available: info.hasPassword },
    { key: 'email-otp', label: 'Email Code', available: true },
  ]

  const availableMethods = methods.filter(m => m.available)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block bg-blue-500/20 border border-blue-500/50 rounded-full p-3 mb-4">
          {info.providerName === 'Apple' ? (
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-semibold text-white">
          Verify Your Identity
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Confirm it&apos;s you before linking {info.providerName} to your account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Method tabs (only if more than one option) */}
      {availableMethods.length > 1 && (
        <div className="flex rounded-lg bg-gray-800/80 p-1">
          {availableMethods.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMethod(m.key); setError('') }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                method === m.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Verification method */}
      {method === 'password' && (
        <PasswordVerification
          token={token}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
      {method === 'email-otp' && (
        <EmailOtpVerification
          token={token}
          maskedEmail={info.maskedEmail}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {/* Alternative action */}
      <div className="text-center pt-2 border-t border-gray-700">
        <a
          href="/auth/login"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Sign in with a different method
        </a>
      </div>
    </div>
  )
}
