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
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
      <nav
        className="flex space-x-4 sm:space-x-8 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
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
                py-3 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize
                whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer
                ${isActive
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                }
              `}
              style={{ marginBottom: '-2px' }}
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