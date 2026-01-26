// app/(guest)/profile/components/TabNavigation.tsx
'use client'

import {
  IoPersonOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

// New simplified 5-tab structure
export type TabType = 'account' | 'documents' | 'insurance' | 'payment' | 'security'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { value: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'account', label: 'Account', icon: IoPersonOutline },
  { value: 'documents', label: 'Documents', icon: IoDocumentTextOutline },
  { value: 'insurance', label: 'Insurance', icon: IoShieldCheckmarkOutline },
  { value: 'payment', label: 'Payment', icon: IoCardOutline },
  { value: 'security', label: 'Security', icon: IoLockClosedOutline }
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => {
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
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}