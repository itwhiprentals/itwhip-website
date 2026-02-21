'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  IoShieldCheckmark,
  IoCheckmarkCircle,
  IoMail,
  IoReload,
  IoSync,
} from 'react-icons/io5'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VerificationCardProps {
  email: string | null            // pre-filled email (logged-in user) or null
  maskedEmail: string | null      // "j***@gmail.com" after OTP is sent
  otpSent: boolean                // false = email-input state, true = code-input state
  expiresAt: string | null        // ISO timestamp for countdown
  purpose: 'CHECKOUT' | 'BOOKING_STATUS' | 'SENSITIVE_INFO'
  onSendOtp: (email: string) => void
  onVerifyCode: (code: string) => void
  onResend: () => void
  isLoading: boolean
  error: string | null
  attemptsRemaining: number | null
  verified: boolean               // true = success flash
}

// ---------------------------------------------------------------------------
// Purpose → human-readable labels
// ---------------------------------------------------------------------------

const PURPOSE_TITLES: Record<VerificationCardProps['purpose'], string> = {
  CHECKOUT: 'Verify Your Identity',
  BOOKING_STATUS: 'Verify to Continue',
  SENSITIVE_INFO: 'Verify to Continue',
}

const PURPOSE_SUBTITLES: Record<VerificationCardProps['purpose'], string> = {
  CHECKOUT: 'complete your checkout securely',
  BOOKING_STATUS: 'view your booking details',
  SENSITIVE_INFO: 'access this information',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format remaining seconds as MM:SS */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Calculate seconds remaining until `expiresAt` */
function secondsUntil(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VerificationCard({
  email,
  maskedEmail,
  otpSent,
  expiresAt,
  purpose,
  onSendOtp,
  onVerifyCode,
  onResend,
  isLoading,
  error,
  attemptsRemaining,
  verified,
}: VerificationCardProps) {
  // -- Local state -----------------------------------------------------------
  const [emailInput, setEmailInput] = useState(email ?? '')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Track whether auto-send has fired (logged-in user)
  const autoSentRef = useRef(false)
  const codeInputRef = useRef<HTMLInputElement>(null)

  // -- Auto-send for logged-in users -----------------------------------------
  useEffect(() => {
    if (email && !otpSent && !autoSentRef.current && !verified) {
      autoSentRef.current = true
      onSendOtp(email)
    }
  }, [email, otpSent, verified, onSendOtp])

  // -- Countdown timer from expiresAt ----------------------------------------
  useEffect(() => {
    if (!expiresAt || verified) {
      setCountdown(null)
      return
    }

    // Initialise immediately
    setCountdown(secondsUntil(expiresAt))

    const interval = setInterval(() => {
      const remaining = secondsUntil(expiresAt)
      setCountdown(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, verified])

  // -- Resend cooldown (60 seconds after OTP is sent) ------------------------
  useEffect(() => {
    if (!otpSent) return

    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [otpSent])

  // -- Focus code input when switching to OTP state --------------------------
  useEffect(() => {
    if (otpSent && !verified) {
      // Small delay to ensure DOM has rendered
      setTimeout(() => codeInputRef.current?.focus(), 100)
    }
  }, [otpSent, verified])

  // -- Auto-submit when 6 digits entered -------------------------------------
  const handleCodeChange = useCallback(
    (value: string) => {
      // Allow only digits
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setCode(digits)

      if (digits.length === 6) {
        onVerifyCode(digits)
      }
    },
    [onVerifyCode],
  )

  // -- Email form submission -------------------------------------------------
  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = emailInput.trim()
      if (trimmed) onSendOtp(trimmed)
    },
    [emailInput, onSendOtp],
  )

  // -- Resend handler --------------------------------------------------------
  const handleResend = useCallback(() => {
    if (resendCooldown > 0 || isLoading) return
    setCode('')
    onResend()
  }, [resendCooldown, isLoading, onResend])

  const isExpired = countdown !== null && countdown <= 0

  // =========================================================================
  // STATE 3: Verified success flash
  // =========================================================================
  if (verified) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <IoCheckmarkCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Identity verified
          </span>
        </div>
      </div>
    )
  }

  // =========================================================================
  // Card wrapper (shared between State 1 & 2)
  // =========================================================================
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      {/* -- Header --------------------------------------------------------- */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
        <IoShieldCheckmark size={16} className="text-purple-600" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {PURPOSE_TITLES[purpose]}
        </h4>
      </div>

      <div className="p-4">
        {/* -- Subtitle ----------------------------------------------------- */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          We need to verify your email to {PURPOSE_SUBTITLES[purpose]}
        </p>

        {/* ================================================================= */}
        {/* STATE 1: Email input                                               */}
        {/* ================================================================= */}
        {!otpSent && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="relative">
              <IoMail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
                           disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailInput.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold
                         text-white bg-purple-600 rounded-md hover:bg-purple-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <IoSync size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </button>

            {/* Error display */}
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
          </form>
        )}

        {/* ================================================================= */}
        {/* STATE 2: Code input                                                */}
        {/* ================================================================= */}
        {otpSent && (
          <div className="space-y-3">
            {/* Masked email display */}
            {maskedEmail && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <IoMail size={14} className="text-purple-500 flex-shrink-0" />
                <span>Code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{maskedEmail}</span></span>
              </div>
            )}

            {/* 6-digit code input */}
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="000000"
              disabled={isLoading || isExpired}
              className="w-full text-center tracking-widest text-2xl font-mono py-3
                         border border-gray-200 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder:text-gray-300 dark:placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
                         disabled:opacity-50"
            />

            {/* Loading indicator during verification */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <IoSync size={12} className="animate-spin" />
                <span>Verifying...</span>
              </div>
            )}

            {/* Countdown timer */}
            {countdown !== null && (
              <div className="flex items-center justify-between text-xs">
                {isExpired ? (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    Code expired
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 tabular-nums">
                    Expires in {formatCountdown(countdown)}
                  </span>
                )}

                {/* Resend link */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="flex items-center gap-1 text-purple-600 dark:text-purple-400
                             hover:text-purple-700 dark:hover:text-purple-300
                             disabled:text-gray-300 dark:disabled:text-gray-600
                             disabled:cursor-not-allowed transition-colors"
                >
                  <IoReload size={12} />
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
                </button>
              </div>
            )}

            {/* Error display */}
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}

            {/* Attempts remaining helper text */}
            {attemptsRemaining !== null && attemptsRemaining < 5 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
