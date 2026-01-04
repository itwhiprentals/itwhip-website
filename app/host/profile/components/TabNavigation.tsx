// app/host/profile/components/TabNavigation.tsx
'use client'

import {
  IoPersonOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoSettingsOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

export type TabType = 'profile' | 'documents' | 'banking' | 'insurance' | 'claims' | 'settings'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isApproved: boolean
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  isApproved
}: TabNavigationProps) {
  const tabs: { value: TabType; label: string; icon: React.ReactNode; requiresApproval?: boolean }[] = [
    { value: 'profile', label: 'Profile', icon: <IoPersonOutline className="w-4 h-4" /> },
    { value: 'documents', label: 'Documents', icon: <IoDocumentTextOutline className="w-4 h-4" /> },
    {
      value: 'banking',
      label: 'Banking',
      icon: <IoWalletOutline className="w-4 h-4" />,
      requiresApproval: true
    },
    {
      value: 'insurance',
      label: 'Insurance',
      icon: <IoShieldCheckmarkOutline className="w-4 h-4" />
      // Insurance tab now accessible to ALL hosts (including PENDING) for tier selection
    },
    { value: 'claims', label: 'Claims', icon: <IoAlertCircleOutline className="w-4 h-4" /> },
    { value: 'settings', label: 'Settings', icon: <IoSettingsOutline className="w-4 h-4" /> }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-hidden">
      <nav
        className="flex items-center overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Profile sections"
      >
        {tabs.map((tab, index) => {
          const isLocked = tab.requiresApproval && !isApproved
          const isActive = activeTab === tab.value

          return (
            <div key={tab.value} className="flex items-center">
              <button
                onClick={() => !isLocked && onTabChange(tab.value)}
                disabled={isLocked}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.value}-panel`}
                className={`
                  px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium capitalize
                  whitespace-nowrap transition-colors flex items-center gap-1.5
                  ${isActive
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {tab.label}
                {isLocked && (
                  <IoLockClosedOutline className="w-3 h-3 ml-0.5" aria-label="Locked" />
                )}
              </button>
              {index < tabs.length - 1 && (
                <span className="text-gray-300 dark:text-gray-600 px-0.5 sm:px-1">|</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Hide scrollbar CSS - included inline */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  )
}