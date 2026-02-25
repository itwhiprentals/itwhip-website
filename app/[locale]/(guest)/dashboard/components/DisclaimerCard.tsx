'use client'

import { useTranslations } from 'next-intl'

export default function DisclaimerCard() {
  const t = useTranslations('GuestDashboard')

  return (
    <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-2">
        {t('importantInformation')}
      </p>
      <p className="text-[9px] leading-relaxed text-gray-500 dark:text-gray-500">
        {t('disclaimerText')}
      </p>
    </div>
  )
}
