// app/partner/requests/[id]/components/TestEsignButton.tsx
// Test e-sign button with attempt tracking (max 3 tests)
// Calls existing /api/partner/onboarding/agreement/test endpoint

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IoMailOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'

type AgreementPref = 'ITWHIP' | 'OWN' | 'BOTH'

interface TestEsignButtonProps {
  preference: AgreementPref
  testCount: number
  maxTests?: number
  onTestSent: (newCount: number) => void
  disabled?: boolean
  hostEmail?: string
}

export default function TestEsignButton({
  preference,
  testCount,
  maxTests = 3,
  onTestSent,
  disabled = false,
  hostEmail
}: TestEsignButtonProps) {
  const t = useTranslations('PartnerRequestDetail')
  const [sending, setSending] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [error, setError] = useState('')

  const isMaxed = testCount >= maxTests
  const isDisabled = disabled || sending || isMaxed

  const handleSendTest = async () => {
    if (isDisabled) return
    setSending(true)
    setError('')
    setJustSent(false)

    try {
      const response = await fetch('/api/partner/onboarding/agreement/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(t('testEsignMaxReached'))
        } else {
          setError(data.error || t('testEsignFailed'))
        }
        return
      }

      const newCount = data.testCount || testCount + 1
      onTestSent(newCount)
      setJustSent(true)

      // Reset "just sent" indicator after 5 seconds
      setTimeout(() => setJustSent(false), 5000)
    } catch {
      setError(t('testEsignFailed'))
    } finally {
      setSending(false)
    }
  }

  // Button label logic
  const getLabel = () => {
    if (sending) return t('testEsignSending')
    if (isMaxed) return t('testEsignUsed', { count: testCount, max: maxTests })
    if (justSent) return t('testEsignSent', { count: testCount, max: maxTests })
    if (testCount > 0) return t('testEsignAgain', { count: testCount, max: maxTests })
    return t('testEsignSend')
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSendTest}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          isMaxed
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : justSent
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
      >
        {sending ? (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : justSent ? (
          <IoCheckmarkCircleOutline className="w-4 h-4" />
        ) : (
          <IoMailOutline className="w-4 h-4" />
        )}
        {getLabel()}
      </button>

      {/* Email hint */}
      {!isMaxed && !error && hostEmail && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {t('testEsignEmailHint', { email: hostEmail })}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}
