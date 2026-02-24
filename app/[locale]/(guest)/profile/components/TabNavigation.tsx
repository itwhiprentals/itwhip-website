// app/(guest)/profile/components/TabNavigation.tsx
'use client'

import { useTranslations } from 'next-intl'
import {
  IoPersonOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoLockClosedOutline,
  IoTimeOutline
} from 'react-icons/io5'

export type TabType = 'account' | 'documents' | 'insurance' | 'payment' | 'security' | 'status'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabDefs: { value: TabType; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'account', labelKey: 'account', icon: IoPersonOutline },
  { value: 'documents', labelKey: 'documents', icon: IoDocumentTextOutline },
  { value: 'insurance', labelKey: 'insurance', icon: IoShieldCheckmarkOutline },
  { value: 'payment', labelKey: 'payment', icon: IoCardOutline },
  { value: 'security', labelKey: 'security', icon: IoLockClosedOutline },
  { value: 'status', labelKey: 'status', icon: IoTimeOutline }
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const t = useTranslations('TabNav')

  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label={t('profileSections')}
    >
      {tabDefs.map((tab) => {
        const isActive = activeTab === tab.value
        const Icon = tab.icon

        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.value}-panel`}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </button>
        )
      })}
    </nav>
  )
}