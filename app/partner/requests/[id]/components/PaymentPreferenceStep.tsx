// app/partner/requests/[id]/components/PaymentPreferenceStep.tsx
// Step 2: Payment preference — Cash vs Platform (Stripe Connect)

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCashOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface PaymentPreferenceStepProps {
  hostData: {
    id: string
    name: string
  }
  requestData: {
    hostEarnings: number | null
    durationDays: number | null
  }
  onComplete: (preference: 'CASH' | 'PLATFORM') => void
}

export default function PaymentPreferenceStep({
  hostData,
  requestData,
  onComplete
}: PaymentPreferenceStepProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [stripePolling, setStripePolling] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [pollingSeconds, setPollingSeconds] = useState(0)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const savePreference = async (preference: 'CASH' | 'PLATFORM') => {
    try {
      const response = await fetch('/api/partner/onboarding/payment-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference })
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save preference')
      }
    } catch (err: any) {
      console.error('Failed to save payment preference:', err)
      // Non-blocking — preference save failure shouldn't block the flow
    }
  }

  const handleCashSelect = async () => {
    setSaving(true)
    setError('')
    try {
      await savePreference('CASH')
      onComplete('CASH')
    } catch {
      setError(t('bsFailedToSavePreference'))
    } finally {
      setSaving(false)
    }
  }

  const handlePlatformSelect = async () => {
    setSaving(true)
    setError('')

    try {
      await savePreference('PLATFORM')

      // Create Stripe Connect and open in new tab
      const response = await fetch('/api/partner/banking/connect', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.onboardingRequired === false) {
        // Already connected
        setStripeConnected(true)
        setTimeout(() => onComplete('PLATFORM'), 1500)
        return
      }

      if (data.success && data.onboardingUrl) {
        // Open Stripe in new tab
        window.open(data.onboardingUrl, '_blank')
        // Start polling
        startPolling()
      } else {
        setError(data.error || t('bsFailedToConnectStripe'))
      }
    } catch {
      setError(t('bsFailedToConnectStripe'))
    } finally {
      setSaving(false)
    }
  }

  const startPolling = useCallback(() => {
    setStripePolling(true)
    setPollingSeconds(0)

    // Timer for display
    timerRef.current = setInterval(() => {
      setPollingSeconds(prev => prev + 1)
    }, 1000)

    // Poll Stripe status every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/partner/banking/connect')
        const data = await response.json()

        if (data.payoutsEnabled || data.chargesEnabled) {
          // Success!
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          if (timerRef.current) clearInterval(timerRef.current)
          setStripePolling(false)
          setStripeConnected(true)
          setTimeout(() => onComplete('PLATFORM'), 1500)
        }
      } catch {
        // Silently continue polling
      }
    }, 5000)
  }, [onComplete])

  const handleSkipStripe = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    setStripePolling(false)
    onComplete('PLATFORM')
  }

  // Stripe polling state
  if (stripePolling) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('bsWaitingForStripe')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('bsCompleteStripeInOtherTab')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <IoTimeOutline className="w-4 h-4" />
          <span>{Math.floor(pollingSeconds / 60)}:{(pollingSeconds % 60).toString().padStart(2, '0')}</span>
        </div>

        {pollingSeconds >= 60 && (
          <button
            onClick={handleSkipStripe}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
          >
            {t('bsSkipStripeForNow')}
          </button>
        )}
      </div>
    )
  }

  // Stripe connected success
  if (stripeConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('bsPayoutConnected')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('bsPayoutConnectedDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('bsChoosePaymentMethod')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('bsChoosePaymentDesc')}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Cash Option */}
      <button
        onClick={handleCashSelect}
        disabled={saving}
        className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-colors text-left group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
            <IoCashOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('bsCashOption')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('bsCashOptionDesc')}
            </p>
            {requestData.hostEarnings && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                {t('bsNoFees')}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Platform Option */}
      <button
        onClick={handlePlatformSelect}
        disabled={saving}
        className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
            <IoCardOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('bsPlatformOption')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('bsPlatformOptionDesc')}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
              {t('bsRequiresStripe')}
            </div>
          </div>
        </div>
      </button>

      {/* Loading overlay */}
      {saving && (
        <div className="flex items-center justify-center py-2">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
