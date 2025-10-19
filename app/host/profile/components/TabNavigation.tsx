// app/host/profile/components/TabNavigation.tsx
'use client'

import { 
  IoWalletOutline, 
  IoShieldCheckmarkOutline, 
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
  const tabs: { value: TabType; label: string; icon?: React.ReactNode; requiresApproval?: boolean }[] = [
    { value: 'profile', label: 'Profile' },
    { value: 'documents', label: 'Documents' },
    { 
      value: 'banking', 
      label: 'Banking', 
      icon: <IoWalletOutline className="w-4 h-4" />,
      requiresApproval: true 
    },
    { 
      value: 'insurance', 
      label: 'Insurance', 
      icon: <IoShieldCheckmarkOutline className="w-4 h-4" />,
      requiresApproval: true 
    },
    { value: 'claims', label: 'Claims' },
    { value: 'settings', label: 'Settings' }
  ]

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
      <nav 
        className="flex space-x-4 sm:space-x-8 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
        role="tablist"
        aria-label="Profile sections"
      >
        {tabs.map((tab) => {
          const isLocked = tab.requiresApproval && !isApproved
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => !isLocked && onTabChange(tab.value)}
              disabled={isLocked}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.value}-panel`}
              className={`
                py-3 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize 
                whitespace-nowrap flex-shrink-0 transition-colors
                ${isActive
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                }
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ marginBottom: '-2px' }}
            >
              <span className="flex items-center gap-1.5">
                {tab.icon}
                <span>{tab.label}</span>
                {isLocked && (
                  <IoLockClosedOutline className="w-3 h-3 ml-0.5" aria-label="Locked" />
                )}
              </span>
            </button>
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