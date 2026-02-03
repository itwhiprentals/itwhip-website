'use client'

import { useState, useRef, useEffect } from 'react'

interface EmailOtpVerificationProps {
  token: string
  maskedEmail: string
  onSuccess: (data: any) => void
  onError: (message: string) => void
}

export default function EmailOtpVerification({ token, maskedEmail, onSuccess, onError }: EmailOtpVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const sendCode = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/auth/verify-link/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type: 'email' }),
      })
      const data = await res.json()

      if (!res.ok) {
        onError(data.error || 'Failed to send code')
        return
      }

      setSent(true)
      setCooldown(60)
      // Focus first input
      inputRefs.current[0]?.focus()
    } catch {
      onError('Failed to send verification code')
    } finally {
      setSending(false)
    }
  }

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join('')
    if (fullCode.length === 6) {
      submitCode(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newCode = [...code]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)

    if (pasted.length === 6) {
      submitCode(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  const submitCode = async (fullCode: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-link/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type: 'email-otp', value: fullCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        onError(data.error || 'Verification failed')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      onSuccess(data)
    } catch {
      onError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          We&apos;ll send a 6-digit verification code to <span className="text-white font-medium">{maskedEmail}</span>
        </p>
        <button
          onClick={sendCode}
          disabled={sending}
          className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Code to Email
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Enter the 6-digit code sent to <span className="text-white font-medium">{maskedEmail}</span>
      </p>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className="w-11 h-12 text-center text-lg font-semibold border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white"
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={sendCode}
          disabled={cooldown > 0 || sending}
          className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}
