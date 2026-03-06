// app/partner/requests/[id]/components/ConfirmProgress.tsx
// Animated progress step list for the Confirm & Send flow

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEllipseOutline,
} from 'react-icons/io5'

export interface StepStatus {
  loading: string
  complete: string
  status: 'pending' | 'active' | 'done' | 'error'
}

interface ConfirmProgressProps {
  steps: StepStatus[]
  error: string | null
  onRetry: () => void
  onCancel: () => void
}

export default function ConfirmProgress({ steps, error, onRetry, onCancel }: ConfirmProgressProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div className="py-4">
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 py-2 px-1">
            <StepIcon status={step.status} />
            <span className={`text-sm ${
              step.status === 'error'
                ? 'text-red-600 dark:text-red-400 font-medium'
                : step.status === 'done' || step.status === 'active'
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-400 dark:text-gray-500'
            }`}>
              {step.status === 'done' ? step.complete : step.loading}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              {t('csRetry')}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus['status'] }) {
  switch (status) {
    case 'error':
      return <IoCloseCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0" />
    case 'done':
      return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
    case 'active':
      return <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
    default:
      return <IoEllipseOutline className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
  }
}
