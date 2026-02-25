// app/partner/requests/[id]/components/SecureAccountStep.tsx
// Step 1: Secure account — collect missing phone/email + set password

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoMailOutline,
  IoCallOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface MissingFields {
  needsPhone: boolean
  needsEmail: boolean
  needsPassword: boolean
  needsEmailVerification: boolean
}

interface SecureAccountStepProps {
  hostData: {
    id: string
    name: string
    email: string
    hasPassword: boolean
    phone?: string
  }
  missingFields: MissingFields
  onComplete: () => void
}

export default function SecureAccountStep({
  hostData,
  missingFields,
  onComplete
}: SecureAccountStepProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [phone, setPhone] = useState(hostData.phone || '')
  const [email, setEmail] = useState(hostData.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [emailVerified, setEmailVerified] = useState(!missingFields.needsEmailVerification && !missingFields.needsEmail)

  // If nothing is missing, auto-complete this step
  const nothingMissing = !missingFields.needsPhone && !missingFields.needsEmail && !missingFields.needsPassword && !missingFields.needsEmailVerification
  if (nothingMissing) {
    // Render a success state and auto-advance
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('bsAccountSecured')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('bsAccountSecuredDesc')}
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          {t('bsContinue')}
        </button>
      </div>
    )
  }

  const handleSendVerificationCode = async () => {
    if (!email) return
    setSendingCode(true)
    setError('')

    try {
      const response = await fetch('/api/partner/onboarding/secure-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendVerificationCode', email })
      })

      const data = await response.json()

      if (data.success) {
        setCodeSent(true)
      } else {
        setError(data.error || t('bsFailedToSendCode'))
      }
    } catch {
      setError(t('bsFailedToSendCode'))
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async () => {
    setError('')

    // Validate
    if (missingFields.needsPassword) {
      if (password.length < 8) {
        setError(t('bsPasswordMinLength'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('bsPasswordsNoMatch'))
        return
      }
    }

    if (missingFields.needsPhone && !phone.trim()) {
      setError(t('bsPhoneRequired'))
      return
    }

    if (missingFields.needsEmail && !email.trim()) {
      setError(t('bsEmailRequired'))
      return
    }

    if ((missingFields.needsEmail || missingFields.needsEmailVerification) && !emailVerified && !verificationCode) {
      setError(t('bsVerificationCodeRequired'))
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/partner/onboarding/secure-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'secureAccount',
          phone: missingFields.needsPhone ? phone.trim() : undefined,
          email: missingFields.needsEmail ? email.trim() : undefined,
          password: missingFields.needsPassword ? password : undefined,
          verificationCode: verificationCode || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        onComplete()
      } else {
        setError(data.error || t('bsFailedToSecureAccount'))
      }
    } catch {
      setError(t('bsFailedToSecureAccount'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('bsSecureYourAccount')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('bsSecureAccountDesc')}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Phone Number */}
      {missingFields.needsPhone && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <IoCallOutline className="w-4 h-4 inline mr-1.5" />
            {t('bsPhoneNumber')}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('bsPhonePlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('bsPhoneHint')}
          </p>
        </div>
      )}

      {/* Email Address */}
      {missingFields.needsEmail && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <IoMailOutline className="w-4 h-4 inline mr-1.5" />
            {t('bsEmailAddress')}
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('bsEmailPlaceholder')}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleSendVerificationCode}
              disabled={sendingCode || !email || codeSent}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {codeSent ? t('bsCodeSent') : sendingCode ? '...' : t('bsSendCode')}
            </button>
          </div>

          {/* Verification Code Input */}
          {codeSent && !emailVerified && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('bsEnterVerificationCode')}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-32 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center tracking-widest font-mono"
              />
            </div>
          )}
        </div>
      )}

      {/* Existing email - just show as confirmed */}
      {!missingFields.needsEmail && hostData.email && (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('bsEmailVerified')}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{hostData.email}</p>
          </div>
        </div>
      )}

      {/* Password */}
      {missingFields.needsPassword && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <IoLockClosedOutline className="w-4 h-4 inline mr-1.5" />
              {t('bsCreatePassword')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('bsPasswordPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('bsConfirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('bsConfirmPasswordPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{t('bsPasswordsNoMatch')}</p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <IoShieldCheckmarkOutline className="w-5 h-5" />
        )}
        {saving ? t('bsSaving') : t('bsSecureAndContinue')}
      </button>
    </div>
  )
}
