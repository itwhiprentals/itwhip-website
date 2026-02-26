// app/partner/requests/[id]/components/AgreementPreferenceStep.tsx
// Agreement preference selection step for recruited host onboarding
// Options: Use ItWhip's Agreement, Use My Own, or Use Both

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import AgreementUpload from './AgreementUpload'
import AgreementFullPreview from './AgreementFullPreview'
import TestEsignButton from './TestEsignButton'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

type AgreementPref = 'ITWHIP' | 'OWN' | 'BOTH'

interface RequestData {
  id: string
  guestName: string | null
  offeredRate: number | null
  startDate: string | null
  endDate: string | null
  durationDays: number | null
  pickupCity: string | null
  pickupState: string | null
  totalAmount: number | null
  hostEarnings: number | null
}

interface AgreementPreferenceStepProps {
  onComplete: (preference: AgreementPref) => void
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
  }
  /** When true, renders standalone (no Continue button — used in edit modal) */
  standalone?: boolean
  onSaveStandalone?: (preference: AgreementPref) => void
  /** Request data for preview context */
  requestData?: RequestData
  /** Host name for preview */
  hostName?: string
  /** Host email for test e-sign hint */
  hostEmail?: string
}

export default function AgreementPreferenceStep({
  onComplete,
  existingAgreement,
  standalone = false,
  onSaveStandalone,
  requestData,
  hostName,
  hostEmail
}: AgreementPreferenceStepProps) {
  const t = useTranslations('PartnerRequestDetail')
  const [selected, setSelected] = useState<AgreementPref>('ITWHIP')
  const [saving, setSaving] = useState(false)
  const [uploaded, setUploaded] = useState(!!existingAgreement?.url)
  const [showPreview, setShowPreview] = useState(false)
  const [testCount, setTestCount] = useState(0)

  // Fetch current test count on mount
  useEffect(() => {
    fetchTestCount()
  }, [])

  const fetchTestCount = async () => {
    try {
      const response = await fetch('/api/partner/onboarding/agreement-preference')
      if (response.ok) {
        const data = await response.json()
        if (data.testEsignCount != null) {
          setTestCount(data.testEsignCount)
        }
      }
    } catch {
      // Non-critical — count defaults to 0
    }
  }

  const handleContinue = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/partner/onboarding/agreement-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference: selected })
      })

      if (!response.ok) {
        console.error('Failed to save agreement preference')
      }

      if (standalone && onSaveStandalone) {
        onSaveStandalone(selected)
      } else {
        onComplete(selected)
      }
    } catch (error) {
      console.error('Error saving agreement preference:', error)
      // Non-blocking: proceed even if save fails
      if (standalone && onSaveStandalone) {
        onSaveStandalone(selected)
      } else {
        onComplete(selected)
      }
    } finally {
      setSaving(false)
    }
  }

  const options: Array<{
    value: AgreementPref
    icon: typeof IoShieldCheckmarkOutline
    title: string
    description: string
    tag?: string
    tagColor?: string
  }> = [
    {
      value: 'ITWHIP',
      icon: IoShieldCheckmarkOutline,
      title: t('optionItwhip'),
      description: t('optionItwhipDesc'),
      tag: t('optionItwhipTag'),
      tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      value: 'OWN',
      icon: IoDocumentTextOutline,
      title: t('optionOwn'),
      description: t('optionOwnDesc')
    },
    {
      value: 'BOTH',
      icon: IoLayersOutline,
      title: t('optionBoth'),
      description: t('optionBothDesc'),
      tag: t('optionBothTag'),
      tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ]

  // Show test button when: ITWHIP selected, or OWN/BOTH with uploaded agreement
  const canShowTest = selected === 'ITWHIP' || ((selected === 'OWN' || selected === 'BOTH') && uploaded)

  // Default request data fallback
  const defaultRequestData: RequestData = {
    id: '',
    guestName: null,
    offeredRate: null,
    startDate: null,
    endDate: null,
    durationDays: null,
    pickupCity: null,
    pickupState: null,
    totalAmount: null,
    hostEarnings: null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('agreementPreferenceTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('agreementPreferenceSubtitle')}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.value

          return (
            <div key={option.value}>
              <button
                type="button"
                onClick={() => setSelected(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-orange-500 dark:border-orange-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 dark:bg-orange-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${
                        isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </span>
                      {option.tag && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${option.tagColor}`}>
                          {option.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>

              {/* Preview button + full preview for ITWHIP and BOTH */}
              {isSelected && (option.value === 'ITWHIP' || option.value === 'BOTH') && (
                <div className="mt-2 space-y-2">
                  {showPreview ? (
                    <AgreementFullPreview
                      requestData={requestData || defaultRequestData}
                      hostName={hostName}
                      onClose={() => setShowPreview(false)}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        {t('previewItwhipAgreement')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Agreement upload for OWN and BOTH */}
              {isSelected && (option.value === 'OWN' || option.value === 'BOTH') && (
                <div className="mt-2 space-y-2">
                  <AgreementUpload
                    onUploadSuccess={() => setUploaded(true)}
                    existingAgreement={existingAgreement}
                  />
                  {!uploaded && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      {t('uploadLater')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Test E-Sign Button */}
      {canShowTest && (
        <TestEsignButton
          preference={selected}
          testCount={testCount}
          onTestSent={(newCount) => setTestCount(newCount)}
          hostEmail={hostEmail}
        />
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={saving}
        className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <IoCheckmarkCircleOutline className="w-5 h-5" />
        )}
        {saving ? t('saving') : standalone ? t('saveChanges') : t('continue')}
      </button>
    </div>
  )
}
