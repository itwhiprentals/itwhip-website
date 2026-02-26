// app/partner/requests/[id]/components/AgreementPreferenceStep.tsx
// Agreement preference selection step for recruited host onboarding
// Options: Use ItWhip's Agreement, Use My Own, or Use Both

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import AgreementUpload from './AgreementUpload'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

type AgreementPref = 'ITWHIP' | 'OWN' | 'BOTH'

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
}

export default function AgreementPreferenceStep({
  onComplete,
  existingAgreement,
  standalone = false,
  onSaveStandalone
}: AgreementPreferenceStepProps) {
  const t = useTranslations('PartnerRequestDetail')
  const [selected, setSelected] = useState<AgreementPref>('ITWHIP')
  const [saving, setSaving] = useState(false)
  const [uploaded, setUploaded] = useState(!!existingAgreement?.url)

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

              {/* Expanded content when selected */}
              {isSelected && option.value === 'ITWHIP' && (
                <div className="mt-2 ml-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => window.open('/agreement/preview', '_blank')}
                    className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                  >
                    <IoEyeOutline className="w-4 h-4" />
                    {t('previewItwhipAgreement')}
                  </button>
                </div>
              )}

              {isSelected && option.value === 'OWN' && (
                <div className="mt-2 ml-8 space-y-2">
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

              {isSelected && option.value === 'BOTH' && (
                <div className="mt-2 ml-8 space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => window.open('/agreement/preview', '_blank')}
                      className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                    >
                      <IoEyeOutline className="w-4 h-4" />
                      {t('previewItwhipAgreement')}
                    </button>
                  </div>
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
