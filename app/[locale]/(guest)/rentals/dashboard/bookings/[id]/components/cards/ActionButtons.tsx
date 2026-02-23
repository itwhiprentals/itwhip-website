// Cancel / Modify / Agreement buttons — shared across status cards

import React from 'react'
import { useTranslations } from 'next-intl'

interface ActionButtonsProps {
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('cancel')}
        </button>
        <button
          onClick={onModify}
          className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('modify')}
        </button>
        <button
          onClick={onAgreement}
          className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('agreement')}
        </button>
      </div>
    </div>
  )
}
