'use client'

import { useTranslations } from 'next-intl'
import {
  IoShieldOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoChevronUpOutline,
  IoChevronDownOutline
} from 'react-icons/io5'

interface GuestVerificationCardProps {
  hasCarListed: boolean
  expanded: boolean
  onToggle: () => void
}

export default function GuestVerificationCard({ hasCarListed, expanded, onToggle }: GuestVerificationCardProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${!hasCarListed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => hasCarListed && onToggle()}
        className={`w-full p-4 flex items-center justify-between text-left ${!hasCarListed ? 'cursor-not-allowed' : ''}`}
        disabled={!hasCarListed}
      >
        <div className="flex items-center gap-2">
          <IoShieldOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('guestVerification')}</h3>
          {hasCarListed ? (
            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {t('pending')}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {t('listCarFirst')}
            </span>
          )}
        </div>
        {hasCarListed && (
          expanded ? (
            <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
          ) : (
            <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
          )
        )}
      </button>

      {hasCarListed && expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              {t('identityVerified')}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
              <IoCardOutline className="w-4 h-4" />
              {t('paymentOnFile')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('guestWillCompleteVerification')}
          </p>
        </div>
      )}
    </div>
  )
}
