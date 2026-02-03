// app/auth/phone-login/page.tsx
// Phone-based login - Turo/Uber style passwordless authentication

'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoRefreshOutline,
  IoPencilOutline
} from 'react-icons/io5'
import {
  getFirebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from '@/app/lib/firebase/config'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Firebase types
interface ConfirmationResult {
  verificationId?: string
  confirm: (verificationCode: string) => Promise<any>
}

function PhoneLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/dashboard'
  const roleHint = searchParams.get('roleHint') || 'guest'

  const [isDark, setIsDark] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [success, setSuccess] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Phone editing and attempt tracking
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [verificationAttempts, setVerificationAttempts] = useState(0)

  // Email collection for phone users
  const [requiresEmail, setRequiresEmail] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [emailData, setEmailData] = useState({ email: '', name: '' })
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)

  // Device fingerprinting
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  // Format phone for display as (XXX) XXX-XXXX
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return ''
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '')

    // Format progressively as user types
    if (cleaned.length >= 10) {
      // Full number: (123) 456-7890
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 6) {
      // Partial: (123) 456
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else if (cleaned.length >= 4) {
      // Partial: (123) 4
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else if (cleaned.length > 0) {
      // Starting: (123
      return `(${cleaned}`
    }

    return ''
  }

  // Convert to E.164 format for Firebase
  const formatPhoneE164 = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    return `+1${cleaned}` // Assuming US numbers
  }

  // Handle phone input with auto-formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const cleaned = input.replace(/\D/g, '')
    // Limit to 10 digits (US phone number)
    const limited = cleaned.slice(0, 10)
    // Store only digits in state
    setPhone(limited)
  }

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Detect system dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Set theme-color and body background for iOS safe areas
  useEffect(() => {
    const bgColor = isDark ? '#111827' : '#ffffff'
    let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'theme-color'
      document.head.appendChild(metaTag)
    }
    metaTag.content = bgColor
    const originalBg = document.body.style.backgroundColor
    document.body.style.backgroundColor = bgColor
    return () => {
      document.body.style.backgroundColor = originalBg
    }
  }, [isDark])

  // Initialize device fingerprinting on mount
  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        setDeviceFingerprint(result.visitorId)
        console.log('[Phone Login] Device fingerprint loaded:', result.visitorId)
      } catch (error) {
        console.error('[Phone Login] Failed to load fingerprint:', error)
      }
    }

    loadFingerprint()
  }, [])

  // Initialize reCAPTCHA
  const initializeRecaptcha = useCallback(async () => {
    if (recaptchaVerifierRef.current) {
      return
    }

    try {
      console.log('[Phone Login] Initializing reCAPTCHA...')

      if (!recaptchaContainerRef.current) {
        throw new Error('reCAPTCHA container not found')
      }

      const auth = getFirebaseAuth()

      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('[Phone Login] reCAPTCHA solved')
        },
        'expired-callback': () => {
          console.log('[Phone Login] reCAPTCHA expired')
          recaptchaVerifierRef.current = null
        }
      })

      await recaptchaVerifier.render()
      console.log('[Phone Login] reCAPTCHA rendered successfully')

      recaptchaVerifierRef.current = recaptchaVerifier
    } catch (err: any) {
      console.error('[Phone Login] Failed to initialize reCAPTCHA:', err)
      throw new Error(`reCAPTCHA failed: ${err.message || err}`)
    }
  }, [])

  // Send SMS verification code
  const handleSendCode = async () => {
    if (!phone) {
      setError('Phone number is required')
      return
    }

    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setIsSending(true)
    setError('')

    try {
      await initializeRecaptcha()

      if (!recaptchaVerifierRef.current) {
        throw new Error('Failed to initialize reCAPTCHA')
      }

      const auth = getFirebaseAuth()
      const formattedPhone = formatPhoneE164(phone)

      console.log('[Phone Login] Sending code to:', formattedPhone)

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setCodeSent(true)
      setResendCooldown(60)

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)

    } catch (err: any) {
      console.error('[Phone Login] Send code error:', err)

      // Increment attempt counter
      const newAttempts = verificationAttempts + 1
      setVerificationAttempts(newAttempts)

      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please check and try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.')
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.')
      }

      // Reset reCAPTCHA on error
      recaptchaVerifierRef.current = null
    } finally {
      setIsSending(false)
    }
  }

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerifyCode(newCode.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Verify code and log in
  const handleVerifyCode = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (!confirmationResult) {
      setError('Please request a new code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // Verify code with Firebase
      console.log('[Phone Login] Verifying code...')
      const result = await confirmationResult.confirm(codeToVerify)
      const idToken = await result.user.getIdToken()

      console.log('[Phone Login] Firebase verification successful, logging in...')

      // Call our phone login API to create/authenticate user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add device fingerprint if available
      if (deviceFingerprint) {
        headers['X-Fingerprint'] = deviceFingerprint
      }

      const response = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          phone: formatPhoneE164(phone),
          roleHint
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      console.log('[Phone Login] Login successful:', data)

      // Check if email collection is required
      if (data.requiresEmail) {
        setRequiresEmail(true)
        setUserId(data.userId || null)
        return
      }

      // Success! Show success screen briefly then redirect
      setSuccess(true)
      setTimeout(() => {
        window.location.href = returnTo
      }, 1500)

    } catch (err: any) {
      console.error('[Phone Login] Verification error:', err)
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid code. Please check and try again.')
      } else if (err.code === 'auth/code-expired') {
        setError('Code expired. Please request a new one.')
      } else {
        setError(err.message || 'Verification failed. Please try again.')
      }
      // Clear code inputs on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    setCode(['', '', '', '', '', ''])
    setConfirmationResult(null)
    setCodeSent(false)

    // Reset reCAPTCHA
    if (recaptchaVerifierRef.current) {
      try {
        await (recaptchaVerifierRef.current as any).clear()
      } catch (e) {
        console.log('[Phone Login] ReCAPTCHA clear error (non-fatal):', e)
      }
      recaptchaVerifierRef.current = null
    }

    // Send new code
    await handleSendCode()
  }

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEmail(true)
    setError('')

    try {
      const response = await fetch('/api/auth/phone-login/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: formatPhoneE164(phone),
          email: emailData.email,
          name: emailData.name || null,
          userId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save email')
      }

      // Redirect to email verification page or dashboard
      if (data.requiresEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(emailData.email)}`)
      } else {
        window.location.href = returnTo
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save email')
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  // Email collection modal
  if (requiresEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Account</h2>
          <p className="text-gray-400 mb-6">
            To finish setting up your account, please provide your email address. We&apos;ll send you a verification code.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={emailData.name}
                onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white"
                placeholder="Your name"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingEmail}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoCheckmarkCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Login Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Back Button */}
      <div className="pt-12 px-4">
        <Link
          href={roleHint === 'host' ? '/host/signup' : '/auth/login'}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ItWhip"
                width={60}
                height={60}
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {codeSent ? 'Verify Your Number' : 'Phone Login'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {codeSent
                ? `Enter the 6-digit code sent to ${formatPhoneDisplay(phone)}`
                : 'Enter your phone number to receive a verification code'
              }
            </p>
          </div>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} />

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <IoAlertCircleOutline className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!codeSent ? (
            <>
              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="(123) 456-7890"
                    disabled={isSending}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We&apos;ll send you a one-time verification code via SMS
                </p>
              </div>

              {/* Send Code Button */}
              <button
                onClick={handleSendCode}
                disabled={isSending}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Edit Phone Number */}
              {!isEditingPhone && (
                <button
                  onClick={() => {
                    setIsEditingPhone(true)
                    setCodeSent(false)
                    setConfirmationResult(null)
                    setCode(['', '', '', '', '', ''])
                  }}
                  className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <span className="text-sm">{formatPhoneDisplay(phone)}</span>
                  <IoPencilOutline className="w-4 h-4" />
                </button>
              )}

              {/* Code Inputs */}
              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isVerifying}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleVerifyCode()}
                disabled={isVerifying || code.some(d => !d)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Login</span>
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    <IoRefreshOutline className="w-4 h-4" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to ItWhip&apos;s Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhoneLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent" />
      </div>
    }>
      <PhoneLoginContent />
    </Suspense>
  )
}
