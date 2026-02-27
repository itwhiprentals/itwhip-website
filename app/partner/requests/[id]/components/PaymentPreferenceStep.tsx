// app/partner/requests/[id]/components/PaymentPreferenceStep.tsx
// Step 3: Payment preference — Cash vs Platform (selection only, Stripe setup deferred to after Add Car)

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCashOutline,
  IoCardOutline,
  IoAlertCircleOutline
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
  requestData,
  onComplete
}: PaymentPreferenceStepProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = async (preference: 'CASH' | 'PLATFORM') => {
    setSaving(true)
    setError('')
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
      onComplete(preference)
    } catch {
      setError(t('bsFailedToSavePreference'))
    } finally {
      setSaving(false)
    }
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
        onClick={() => handleSelect('CASH')}
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
        onClick={() => handleSelect('PLATFORM')}
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
              {t('bsStripeSetupAfterCar')}
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
