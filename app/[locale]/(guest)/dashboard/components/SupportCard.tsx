'use client'

import { useTranslations } from 'next-intl'
import { MessageSquare } from './DashboardIcons'

interface SupportCardProps {
  onNavigate: () => void
}

export default function SupportCard({ onNavigate }: SupportCardProps) {
  const t = useTranslations('GuestDashboard')

  return (
    <button
      onClick={onNavigate}
      className="block -mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
          <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{t('needHelp')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('supportAvailable')}</p>
        </div>
      </div>
    </button>
  )
}
