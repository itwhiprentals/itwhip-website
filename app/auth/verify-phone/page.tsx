// app/auth/verify-phone/page.tsx
'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoPhonePortraitOutline,
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
import type { ConfirmationResult } from 'firebase/auth'

function VerifyPhoneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const returnTo = searchParams.get('returnTo') || '/dashboard'
  const roleHint = searchParams.get('roleHint') || 'guest'

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [success, setSuccess] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Phone editing and skip logic
  const [editablePhone, setEditablePhone] = useState(phone)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const [forceSkip, setForceSkip] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  // Format phone for display
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return ''
    // Format as (XXX) XXX-XXXX for US numbers
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phoneNumber
  }

  // Format phone for Firebase (E.164 format)
  const formatPhoneE164 = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    } else if (phoneNumber.startsWith('+')) {
      return phoneNumber
    }
    return `+1${cleaned}`
  }

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null
      }
    }
  }, [])

  // Initialize reCAPTCHA
  const initializeRecaptcha = useCallback(async () => {
    // Clear existing verifier first
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch (e) {
        // Ignore
      }
      recaptchaVerifierRef.current = null
    }

    // Clear the container manually
    const container = document.getElementById('recaptcha-container')
    if (container) {
      container.innerHTML = ''
    }

    try {
      const auth = getFirebaseAuth()
      console.log('[Phone Verify] Creating RecaptchaVerifier...')
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('[Phone Verify] reCAPTCHA solved')
        },
        'expired-callback': () => {
          console.log('[Phone Verify] reCAPTCHA expired')
          setError('reCAPTCHA expired. Please try again.')
          recaptchaVerifierRef.current = null
        }
      })
      // Render the reCAPTCHA
      console.log('[Phone Verify] Rendering reCAPTCHA...')
      await recaptchaVerifierRef.current.render()
      console.log('[Phone Verify] reCAPTCHA rendered successfully')
    } catch (err: any) {
      console.error('[Phone Verify] Failed to initialize reCAPTCHA:', err)
      throw new Error(`reCAPTCHA failed: ${err.message || err}`)
    }
  }, [])

  // Send verification code
  const handleSendCode = async () => {
    const phoneToVerify = editablePhone || phone
    if (!phoneToVerify) {
      setError('Phone number is required')
      return
    }

    setIsSending(true)
    setError('')

    try {
      console.log('[Phone Verify] Initializing reCAPTCHA...')
      await initializeRecaptcha()
      console.log('[Phone Verify] reCAPTCHA initialized:', !!recaptchaVerifierRef.current)

      if (!recaptchaVerifierRef.current) {
        throw new Error('Failed to initialize reCAPTCHA')
      }

      const auth = getFirebaseAuth()
      const formattedPhone = formatPhoneE164(phoneToVerify)

      console.log('[Phone Verify] Sending code to:', formattedPhone)

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setCodeSent(true)
      setResendCooldown(60)

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)

    } catch (err: any) {
      console.error('[Phone Verify] Send code error:', err)

      // Increment attempt counter
      const newAttempts = verificationAttempts + 1
      setVerificationAttempts(newAttempts)

      // Force skip after 2 failures
      if (newAttempts >= 2) {
        setForceSkip(true)
        setError('Unable to send verification code after multiple attempts. You can skip phone verification and complete it later in your profile settings.')
      } else {
        // Handle specific Firebase errors
        if (err.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. You can edit it or try again.')
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many attempts. Please try again later or skip for now.')
        } else if (err.code === 'auth/quota-exceeded') {
          setError('SMS quota exceeded. Please try again later or skip for now.')
        } else {
          setError(err.message || 'Failed to send verification code. Please try again or skip for now.')
        }
      }

      // Reset reCAPTCHA on error
      recaptchaVerifierRef.current = null
    } finally {
      setIsSending(false)
    }
  }

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.every(digit => digit !== '') && !isVerifying && codeSent) {
      handleVerify()
    }
  }, [code, codeSent])

  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError('')

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)
    const nextEmptyIndex = newCode.findIndex(d => d === '')
    inputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus()
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
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
      // Verify the code with Firebase
      const credential = await confirmationResult.confirm(fullCode)

      if (!credential.user) {
        throw new Error('Verification failed')
      }

      // Get the ID token to send to our server
      const idToken = await credential.user.getIdToken()

      // Send token to our API to update the database
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          phone: formatPhoneE164(phone),
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update phone verification status')
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push(returnTo)
      }, 2000)

    } catch (err: any) {
      console.error('[Phone Verify] Verification error:', err)

      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code')
      } else if (err.code === 'auth/code-expired') {
        setError('Code has expired. Please request a new one.')
      } else {
        setError(err.message || 'Verification failed')
      }

      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    // Reset state for new code
    setConfirmationResult(null)
    setCodeSent(false)
    setCode(['', '', '', '', '', ''])

    // Clear existing reCAPTCHA
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch (e) {
        // Ignore
      }
      recaptchaVerifierRef.current = null
    }

    // Send new code
    await handleSendCode()
  }

  // Handle skip phone verification
  const handleSkip = async () => {
    try {
      // Update user record to mark phone verification as skipped
      await fetch('/api/auth/skip-phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      console.log('[Phone Verify] User skipped phone verification')

      // Redirect to returnTo destination
      router.push(returnTo)
    } catch (err) {
      console.error('[Phone Verify] Failed to skip verification:', err)
      // Still redirect even if update fails
      router.push(returnTo)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoCheckmarkCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Phone Verified!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your phone number has been successfully verified. Redirecting...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8"
        >
          <IoArrowBackOutline className="w-5 h-5 mr-2" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoPhonePortraitOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Verify Your Phone
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {codeSent ? (
              <>
                We sent a 6-digit code to{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPhoneDisplay(phone)}
                </span>
              </>
            ) : (
              <>
                We&apos;ll send a verification code to{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPhoneDisplay(phone)}
                </span>
              </>
            )}
          </p>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} />

          {!codeSent ? (
            <>
              {/* Editable Phone Number Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formatPhoneDisplay(editablePhone)}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    disabled={!isEditingPhone}
                    className={`w-full px-4 py-3 pr-12 text-base border-2 rounded-lg transition-all ${
                      isEditingPhone
                        ? 'border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title={isEditingPhone ? 'Lock phone number' : 'Edit phone number'}
                  >
                    <IoPencilOutline className="w-5 h-5" />
                  </button>
                </div>
                {isEditingPhone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Edit your phone number if needed, then click "Send Verification Code"
                  </p>
                )}
              </div>

              {/* Force Skip Warning */}
              {forceSkip && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      We're having trouble sending the verification code. You can skip this step and verify your phone later in your profile settings.
                    </p>
                  </div>
                </div>
              )}

              {/* Send Code Button */}
              <button
                onClick={handleSendCode}
                disabled={isSending || forceSkip}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                disabled={isSending}
                className="w-full py-3 mt-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forceSkip ? 'Continue Without Verification' : 'Skip for Now'}
              </button>
            </>
          ) : (
            <>
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
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isVerifying}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || code.some(d => d === '')}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Phone</span>
                )}
              </button>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Didn&apos;t receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={isSending || resendCooldown > 0}
                  className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                      <span>Sending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <>
                      <IoRefreshOutline className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-4">
              <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* SMS notice */}
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
            Standard SMS rates may apply
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent" />
      </div>
    }>
      <VerifyPhoneContent />
    </Suspense>
  )
}
