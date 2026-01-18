// app/partner/landing/components/PoliciesTab.tsx
// Rental policies editor tab

'use client'

import { IoSaveOutline } from 'react-icons/io5'
import { LandingPageData, Policies } from './types'

interface PoliciesTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

const POLICY_FIELDS = [
  {
    id: 'refundPolicy' as keyof Policies,
    label: 'Refund Policy',
    placeholder: 'Describe your refund policy...',
    rows: 4
  },
  {
    id: 'cancellationPolicy' as keyof Policies,
    label: 'Cancellation Policy',
    placeholder: 'Describe your cancellation policy...',
    rows: 4
  },
  {
    id: 'bookingRequirements' as keyof Policies,
    label: 'Booking Requirements',
    placeholder: "What do renters need to provide? (e.g., valid driver's license, insurance proof, etc.)",
    rows: 4
  },
  {
    id: 'additionalTerms' as keyof Policies,
    label: 'Additional Terms',
    placeholder: 'Any other terms, conditions, or information...',
    rows: 4
  }
]

export default function PoliciesTab({ data, onChange, onSave, isSaving }: PoliciesTabProps) {
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
          Rental Policies
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Define your rental policies. These will be displayed on your landing page to help renters understand your terms.
        </p>
      </div>

      <div className="space-y-6">
        {POLICY_FIELDS.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <textarea
              value={data.policies[field.id]}
              onChange={(e) => updatePolicy(field.id, e.target.value)}
              rows={field.rows}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Important:</strong> These policies are displayed to renters on your landing page.
          Make sure they are clear, complete, and legally compliant for your jurisdiction.
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
          {isSaving ? 'Saving...' : 'Save Policies'}
        </button>
      </div>
    </div>
  )
}
