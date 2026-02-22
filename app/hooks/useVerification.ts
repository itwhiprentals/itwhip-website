'use client'

// app/hooks/useVerification.ts
// Manages the OTP verification lifecycle for Choe AI.
// Handles sending, verifying, and resending OTP codes via direct REST calls.

import { useState, useCallback } from 'react'

// =============================================================================
// TYPES
// =============================================================================

type OtpPurpose = 'CHECKOUT' | 'BOOKING_STATUS' | 'SENSITIVE_INFO'

interface VerificationState {
  isVisible: boolean
  email: string | null
  maskedEmail: string | null
  otpSent: boolean
  expiresAt: string | null
  isLoading: boolean
  error: string | null
  attemptsRemaining: number | null
  purpose: OtpPurpose
  verified: boolean
  verifiedEmail: string | null
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: VerificationState = {
  isVisible: false,
  email: null,
  maskedEmail: null,
  otpSent: false,
  expiresAt: null,
  isLoading: false,
  error: null,
  attemptsRemaining: null,
  purpose: 'CHECKOUT',
  verified: false,
  verifiedEmail: null,
}

// =============================================================================
// HOOK
// =============================================================================

export function useVerification(sessionId: string) {
  const [state, setState] = useState<VerificationState>(initialState)

  // ---------------------------------------------------------------------------
  // ACTION: Show the verification card
  // ---------------------------------------------------------------------------
  const show = useCallback((email: string | null, purpose: OtpPurpose) => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      email,
      purpose,
      error: null,
      verified: false,
      otpSent: false,
      maskedEmail: null,
    }))
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Hide the verification card
  // ---------------------------------------------------------------------------
  const hide = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }))
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Reset to initial state
  // ---------------------------------------------------------------------------
  const reset = useCallback(() => {
    setState(initialState)
    // Clear verification cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'choe_verified_email=;max-age=0;path=/'
      document.cookie = 'choe_verified_at=;max-age=0;path=/'
    }
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Send OTP to the given email
  // ---------------------------------------------------------------------------
  const sendOtp = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const res = await fetch('/api/ai/booking/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email, purpose: state.purpose }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to send code',
        }))
        return false
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        otpSent: true,
        maskedEmail: data.maskedEmail,
        expiresAt: data.expiresAt,
        email,
      }))
      return true
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }))
      return false
    }
  }, [sessionId, state.purpose])

  // ---------------------------------------------------------------------------
  // ACTION: Verify OTP code — returns verifiedEmail on success, null on failure
  // ---------------------------------------------------------------------------
  const verifyCode = useCallback(async (code: string): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const res = await fetch('/api/ai/booking/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: state.email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Verification failed',
          attemptsRemaining: data.attemptsRemaining ?? prev.attemptsRemaining,
        }))
        return null
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        verified: true,
        verifiedEmail: data.verifiedEmail,
      }))
      return data.verifiedEmail
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }))
      return null
    }
  }, [sessionId, state.email])

  // ---------------------------------------------------------------------------
  // ACTION: Resend OTP to the current email
  // ---------------------------------------------------------------------------
  const resend = useCallback(async () => {
    if (!state.email) return false
    setState(prev => ({ ...prev, otpSent: false, error: null, attemptsRemaining: null }))
    return sendOtp(state.email)
  }, [state.email, sendOtp])

  return {
    ...state,
    show,
    hide,
    reset,
    sendOtp,
    verifyCode,
    resend,
  }
}
