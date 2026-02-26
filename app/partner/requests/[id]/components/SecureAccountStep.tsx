// app/partner/requests/[id]/components/SecureAccountStep.tsx
// Step 1: Secure account — collect phone/password, then verify phone via Firebase SMS
// Three views: Form → Phone Verification → Summary (when revisiting)

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoMailOutline,
  IoCallOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoRefreshOutline,
  IoCreateOutline
} from 'react-icons/io5'
import {
  getFirebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from '@/app/lib/firebase/config'
import type { ConfirmationResult } from 'firebase/auth'

interface MissingFields {
  needsPhone: boolean
  needsEmail: boolean
  needsPassword: boolean
  needsEmailVerification: boolean
  needsPhoneVerification: boolean
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

type StepView = 'form' | 'verify-phone' | 'summary'

export default function SecureAccountStep({
  hostData,
  missingFields,
  onComplete
}: SecureAccountStepProps) {
  const t = useTranslations('PartnerRequestDetail')

  // Determine initial view
  const getInitialView = (): StepView => {
    const nothingMissing = !missingFields.needsPhone && !missingFields.needsEmail &&
      !missingFields.needsPassword && !missingFields.needsPhoneVerification
    if (nothingMissing) return 'summary'
    return 'form'
  }

  const [view, setView] = useState<StepView>(getInitialView)

  // Format initial phone from hostData to display format
  const formatInitialPhone = (raw: string) => {
    if (!raw) return ''
    let digits = raw.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return raw
  }

  // Form state
  const [phone, setPhone] = useState(formatInitialPhone(hostData.phone || ''))
  const [email, setEmail] = useState(hostData.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  // Form UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [emailVerified] = useState(!missingFields.needsEmailVerification && !missingFields.needsEmail)
  const [changingPassword, setChangingPassword] = useState(false)

  // Phone verification state (Firebase)
  const [phoneCode, setPhoneCode] = useState(['', '', '', '', '', ''])
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(!missingFields.needsPhoneVerification && !missingFields.needsPhone)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Mount reCAPTCHA container on document.body (outside BottomSheet overflow)
  // and cleanup on unmount
  useEffect(() => {
    let container = document.getElementById('secure-recaptcha-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'secure-recaptcha-container'
      document.body.appendChild(container)
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch {}
        recaptchaVerifierRef.current = null
      }
      const el = document.getElementById('secure-recaptcha-container')
      if (el) el.remove()
    }
  }, [])

  // Format phone for E.164 (Firebase requires this)
  const formatPhoneE164 = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 10) return `+1${cleaned}`
    if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`
    if (phoneNumber.startsWith('+')) return phoneNumber
    return `+1${cleaned}`
  }

  // Format phone for display: +1 (000)-000-0000
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return ''
    let cleaned = phoneNumber.replace(/\D/g, '')
    // Strip leading 1 for consistent handling
    if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.slice(1)
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  // Live-format phone input as user types: +1 (000)-000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    // Strip leading 1 country code if user typed it
    let digits = raw
    if (digits.length > 10 && digits.startsWith('1')) digits = digits.slice(1)
    digits = digits.slice(0, 10)

    if (digits.length === 0) { setPhone(''); return }

    let formatted = '+1 ('
    formatted += digits.slice(0, 3)
    if (digits.length >= 3) formatted += ')'
    if (digits.length > 3) formatted += '-' + digits.slice(3, 6)
    if (digits.length > 6) formatted += '-' + digits.slice(6)

    setPhone(formatted)
  }

  // Initialize reCAPTCHA for Firebase phone auth
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const initializeRecaptcha = useCallback(async () => {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear() } catch {}
      recaptchaVerifierRef.current = null
    }

    const container = document.getElementById('secure-recaptcha-container')
    if (container) container.innerHTML = ''

    const auth = getFirebaseAuth()

    // Localhost workaround: Firebase reCAPTCHA Enterprise fails on localhost
    // (known Firebase bug). Disable app verification for local dev only.
    if (isLocalhost) {
      (auth.settings as any).appVerificationDisabledForTesting = true
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'secure-recaptcha-container', {
      size: 'invisible',
      callback: () => console.log('[SecureAccount] reCAPTCHA solved'),
      'expired-callback': () => {
        setError(t('bsRecaptchaExpired'))
        recaptchaVerifierRef.current = null
      }
    })

    // Only render reCAPTCHA in production — on localhost it auto-resolves
    if (!isLocalhost) {
      await recaptchaVerifierRef.current.render()
    }
  }, [t, isLocalhost])

  // Send phone verification code via Firebase
  const handleSendPhoneCode = useCallback(async () => {
    setSendingPhoneCode(true)
    setError('')

    try {
      await initializeRecaptcha()
      if (!recaptchaVerifierRef.current) throw new Error('reCAPTCHA failed')

      const auth = getFirebaseAuth()
      const formattedPhone = formatPhoneE164(phone)
      console.log('[SecureAccount] Sending SMS to:', formattedPhone)

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setPhoneCodeSent(true)
      setResendCooldown(60)

      setTimeout(() => phoneInputRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      console.error('[SecureAccount] Send phone code error:', err)
      if (err.code === 'auth/invalid-phone-number') {
        setError(t('bsInvalidPhoneNumber'))
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('bsTooManyAttempts'))
      } else {
        setError(err.message || t('bsFailedToSendPhoneCode'))
      }
      recaptchaVerifierRef.current = null
    } finally {
      setSendingPhoneCode(false)
    }
  }, [phone, initializeRecaptcha, t])

  // Track whether code has been sent in the verify-phone view
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)

  // Verify phone code with Firebase → then save to our API
  const handleVerifyPhone = useCallback(async () => {
    const fullCode = phoneCode.join('')
    if (fullCode.length !== 6 || !confirmationResult) return

    setVerifyingPhone(true)
    setError('')

    try {
      const credential = await confirmationResult.confirm(fullCode)
      if (!credential.user) throw new Error('Verification failed')

      const idToken = await credential.user.getIdToken()

      // Save verified phone to our backend
      const response = await fetch('/api/partner/onboarding/secure-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyPhone',
          idToken,
          phone: formatPhoneE164(phone)
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to verify phone')

      setPhoneVerified(true)
      // Phone verified — step complete, advance to Agreement
      onComplete()
    } catch (err: any) {
      console.error('[SecureAccount] Phone verification error:', err)
      if (err.code === 'auth/invalid-verification-code') {
        setError(t('bsInvalidPhoneCode'))
      } else if (err.code === 'auth/code-expired') {
        setError(t('bsPhoneCodeExpired'))
      } else {
        setError(err.message || t('bsPhoneVerificationFailed'))
      }
      setPhoneCode(['', '', '', '', '', ''])
      phoneInputRefs.current[0]?.focus()
    } finally {
      setVerifyingPhone(false)
    }
  }, [phoneCode, confirmationResult, phone, onComplete, t])

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (phoneCode.every(d => d !== '') && !verifyingPhone && view === 'verify-phone') {
      handleVerifyPhone()
    }
  }, [phoneCode, view])

  // Phone code input handlers
  const handlePhoneCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCode = [...phoneCode]
    newCode[index] = digit
    setPhoneCode(newCode)
    setError('')
    if (digit && index < 5) phoneInputRefs.current[index + 1]?.focus()
  }

  const handlePhoneCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !phoneCode[index] && index > 0) {
      phoneInputRefs.current[index - 1]?.focus()
    }
  }

  const handlePhoneCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...phoneCode]
    for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i]
    setPhoneCode(newCode)
    const nextEmpty = newCode.findIndex(d => d === '')
    phoneInputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
  }

  // Resend phone code
  const handleResendPhoneCode = async () => {
    if (resendCooldown > 0) return
    setConfirmationResult(null)
    setPhoneCodeSent(false)
    setPhoneCode(['', '', '', '', '', ''])
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear() } catch {}
      recaptchaVerifierRef.current = null
    }
    await handleSendPhoneCode()
  }

  // Email verification code handler (existing)
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

  // Form submit — saves phone + password, then transitions to phone verification
  const handleSubmit = async () => {
    setError('')

    // Validate password (required when new, or when user is changing it)
    const needsPasswordInput = missingFields.needsPassword || changingPassword
    if (needsPasswordInput) {
      if (password.length < 8) {
        setError(t('bsPasswordMinLength'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('bsPasswordsNoMatch'))
        return
      }
    }

    // Validate phone
    if ((missingFields.needsPhone || missingFields.needsPhoneVerification) && !phone.trim()) {
      setError(t('bsPhoneRequired'))
      return
    }

    if (missingFields.needsEmail && !email.trim()) {
      setError(t('bsEmailRequired'))
      return
    }

    if (missingFields.needsEmail && !emailVerified && !verificationCode) {
      setError(t('bsVerificationCodeRequired'))
      return
    }

    setSaving(true)

    try {
      // Save password + email (phone saved separately via verifyPhone)
      const response = await fetch('/api/partner/onboarding/secure-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'secureAccount',
          phone: phone.trim() || undefined,
          email: missingFields.needsEmail ? email.trim() : undefined,
          password: (missingFields.needsPassword || changingPassword) ? password : undefined,
          verificationCode: verificationCode || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        // If phone needs verification, go to verify screen
        if (!phoneVerified) {
          setView('verify-phone')
        } else {
          // Phone already verified, just advance
          onComplete()
        }
      } else {
        setError(data.error || t('bsFailedToSecureAccount'))
      }
    } catch {
      setError(t('bsFailedToSecureAccount'))
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────
  // VIEW: Phone Verification (Firebase SMS)
  // ─────────────────────────────────────────────────────────
  if (view === 'verify-phone') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCallOutline className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('bsVerifyYourPhone')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {phoneCodeSent
              ? t('bsCodeSentTo', { phone: formatPhoneDisplay(phone) })
              : t('bsWillSendCodeTo', { phone: formatPhoneDisplay(phone) })
            }
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!phoneCodeSent ? (
          <>
            {/* Send Code Button — user click triggers reCAPTCHA */}
            <button
              onClick={handleSendPhoneCode}
              disabled={sendingPhoneCode}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendingPhoneCode ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('bsSendingCode')}
                </>
              ) : (
                t('bsSendVerificationCode')
              )}
            </button>
          </>
        ) : (
          <>
            {/* 6-digit code inputs */}
            <div className="flex justify-center gap-2">
              {phoneCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { phoneInputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePhoneCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handlePhoneCodeKeyDown(index, e)}
                  onPaste={handlePhoneCodePaste}
                  disabled={verifyingPhone}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-colors"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify spinner */}
            {verifyingPhone && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                {t('bsVerifyingPhone')}
              </div>
            )}

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t('bsDidntReceiveCode')}
              </p>
              <button
                onClick={handleResendPhoneCode}
                disabled={sendingPhoneCode || resendCooldown > 0}
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-sm disabled:opacity-50"
              >
                {resendCooldown > 0 ? (
                  <span>{t('bsResendIn', { seconds: resendCooldown })}</span>
                ) : (
                  <>
                    <IoRefreshOutline className="w-4 h-4" />
                    <span>{t('bsResendCode')}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Skip for now */}
        <button
          onClick={onComplete}
          className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
        >
          {t('bsSkipForNow')}
        </button>

        {/* SMS notice */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {t('bsSmsNotice')}
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // VIEW: Summary (when revisiting completed step)
  // ─────────────────────────────────────────────────────────
  if (view === 'summary') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <IoShieldCheckmarkOutline className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('bsAccountSecured')}
          </h3>
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('bsEmailVerified')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 truncate">{hostData.email}</p>
          </div>
        </div>

        {/* Phone row */}
        {phoneVerified && phone ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('bsPhoneVerified')}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">{formatPhoneDisplay(phone)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <IoCallOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('bsPhoneNotVerified')}
              </p>
              {phone && <p className="text-xs text-gray-500 dark:text-gray-400">{formatPhoneDisplay(phone)}</p>}
            </div>
            <button
              onClick={() => setView('form')}
              className="text-xs text-orange-600 dark:text-orange-400 font-medium"
            >
              {t('bsVerify')}
            </button>
          </div>
        )}

        {/* Password row */}
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('bsPasswordSet')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-mono tracking-widest">{'••••••••'}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setView('form')}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <IoCreateOutline className="w-5 h-5" />
            {t('edit')}
          </button>
          <button
            onClick={() => {
              // If phone not verified, trigger verification before advancing
              if (!phoneVerified) {
                setView('verify-phone')
              } else {
                onComplete()
              }
            }}
            className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('continue')}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // VIEW: Form (enter phone, password, email)
  // ─────────────────────────────────────────────────────────
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

      {/* Email badge (verified via recruitment link) */}
      {!missingFields.needsEmail && hostData.email && (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          missingFields.needsEmailVerification
            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          {missingFields.needsEmailVerification ? (
            <IoMailOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          ) : (
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${
              missingFields.needsEmailVerification
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-green-800 dark:text-green-200'
            }`}>
              {missingFields.needsEmailVerification ? t('bsEmailOnFile') : t('bsEmailVerified')}
            </p>
            <p className={`text-xs ${
              missingFields.needsEmailVerification
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-green-600 dark:text-green-400'
            }`}>{hostData.email}</p>
          </div>
        </div>
      )}

      {/* Email input (when new email needed) */}
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

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          <IoCallOutline className="w-4 h-4 inline mr-1.5" />
          {t('bsPhoneNumber')}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+1 (000)-000-0000"
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {t('bsPhoneVerifyHint')}
        </p>
      </div>

      {/* Password */}
      {missingFields.needsPassword || changingPassword ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <IoLockClosedOutline className="w-4 h-4 inline mr-1.5" />
              {changingPassword ? t('bsNewPassword') : t('bsCreatePassword')}
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
          {changingPassword && (
            <button
              type="button"
              onClick={() => { setChangingPassword(false); setPassword(''); setConfirmPassword('') }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t('bsCancelPasswordChange')}
            </button>
          )}
        </div>
      ) : !missingFields.needsPassword ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('bsPasswordSet')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-mono tracking-widest">{'••••••••'}</p>
          </div>
          <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="text-xs text-orange-600 dark:text-orange-400 font-medium"
          >
            {t('bsChangePassword')}
          </button>
        </div>
      ) : null}

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
