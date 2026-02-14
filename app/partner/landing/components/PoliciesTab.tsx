// app/partner/landing/components/PoliciesTab.tsx
// Rental policies editor tab

'use client'

import { useTranslations } from 'next-intl'
import { IoSaveOutline } from 'react-icons/io5'
import { LandingPageData, Policies } from './types'

interface PoliciesTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

// Key-only array — labels and placeholders resolved via t() at render time
const POLICY_FIELDS: { id: keyof Policies; labelKey: string; placeholderKey: string; rows: number }[] = [
  {
    id: 'refundPolicy',
    labelKey: 'refundPolicy',
    placeholderKey: 'refundPolicyPlaceholder',
    rows: 4
  },
  {
    id: 'cancellationPolicy',
    labelKey: 'cancellationPolicy',
    placeholderKey: 'cancellationPolicyPlaceholder',
    rows: 4
  },
  {
    id: 'bookingRequirements',
    labelKey: 'bookingRequirements',
    placeholderKey: 'bookingRequirementsPlaceholder',
    rows: 4
  },
  {
    id: 'additionalTerms',
    labelKey: 'additionalTerms',
    placeholderKey: 'additionalTermsPlaceholder',
    rows: 4
  }
]

export default function PoliciesTab({ data, onChange, onSave, isSaving }: PoliciesTabProps) {
  const t = useTranslations('PartnerLanding')

  const updatePolicy = (field: keyof Policies, value: string) => {
    onChange({
      policies: {
        ...data.policies,
        [field]: value
      }
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('rentalPolicies')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('policiesDescription')}
        </p>
      </div>

      <div className="space-y-6">
        {POLICY_FIELDS.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t(field.labelKey)}
            </label>
            <textarea
              value={data.policies[field.id]}
              onChange={(e) => updatePolicy(field.id, e.target.value)}
              rows={field.rows}
              placeholder={t(field.placeholderKey)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>{t('importantLabel')}</strong> {t('policiesInfoNote')}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? t('saving') : t('savePolicies')}
        </button>
      </div>
    </div>
  )
}
