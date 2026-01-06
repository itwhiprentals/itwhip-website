// app/admin/dashboard/components/NavigationTabs.tsx
'use client'

import Link from 'next/link'
import { ComponentType } from 'react'

interface NavigationItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: number
  isLink?: boolean
  href?: string
}

interface NavigationTabsProps {
  activeTab: string
  navigationItems: NavigationItem[]
  onTabChange: (tabId: string) => void
}

export default function NavigationTabs({
  activeTab,
  navigationItems,
  onTabChange
}: NavigationTabsProps) {
  return (
    <div className="fixed top-[106px] md:top-[114px] left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          {navigationItems.map(item => {
            const IconComponent = item.icon
            
            if (item.isLink && item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                    activeTab === item.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            }
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                  activeTab === item.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}