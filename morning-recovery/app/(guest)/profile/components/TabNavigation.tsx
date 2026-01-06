// app/(guest)/profile/components/TabNavigation.tsx
'use client'

import { 
  IoPersonOutline, 
  IoDocumentTextOutline, 
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoSettingsOutline,
  IoStarOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export type TabType = 'profile' | 'status' | 'documents' | 'insurance' | 'payment' | 'settings' | 'reviews'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { value: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'profile', label: 'Profile', icon: IoPersonOutline },
  { value: 'status', label: 'Status', icon: IoAlertCircleOutline },
  { value: 'documents', label: 'Documents', icon: IoDocumentTextOutline },
  { value: 'insurance', label: 'Insurance', icon: IoShieldCheckmarkOutline },
  { value: 'payment', label: 'Payment', icon: IoCardOutline },
  { value: 'settings', label: 'Settings', icon: IoSettingsOutline },
  { value: 'reviews', label: 'Reviews', icon: IoStarOutline }
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600 p-1 mb-4 sm:mb-6">
      <nav
        className="flex space-x-1 sm:space-x-2 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
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
              className={`
                py-2 px-3 rounded-md font-medium text-xs sm:text-sm capitalize
                whitespace-nowrap flex-shrink-0 transition-all cursor-pointer
                ${isActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </span>
            </button>
          )
        })}
      </nav>
      
      {/* Hide scrollbar CSS */}
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