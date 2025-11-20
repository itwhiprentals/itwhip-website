// app/host/cars/[id]/components/VehicleTabNavigation.tsx

'use client'

import { 
  IoGridOutline,
  IoAlertCircleOutline,
  IoDocumentsOutline,
  IoConstructOutline,
  IoTimeOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

interface Tab {
  id: string
  label: string
  icon: any
  badge?: number
}

interface VehicleTabNavigationProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  claimsCount?: number
  documentsExpiring?: number
  servicesOverdue?: number
}

export default function VehicleTabNavigation({
  activeTab,
  onTabChange,
  claimsCount = 0,
  documentsExpiring = 0,
  servicesOverdue = 0
}: VehicleTabNavigationProps) {
  
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: IoGridOutline
    },
    {
      id: 'claims',
      label: 'Claims',
      icon: IoAlertCircleOutline,
      badge: claimsCount
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: IoDocumentsOutline,
      badge: documentsExpiring
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: IoConstructOutline,
      badge: servicesOverdue
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: IoTimeOutline
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
      {/* Mobile: Dropdown */}
      <div className="block md:hidden p-3">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.badge ? ` (${tab.badge})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Tab buttons */}
      <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative
                ${isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                  {tab.badge}
                </span>
              )}
              
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}