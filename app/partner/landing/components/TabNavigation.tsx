// app/partner/landing/components/TabNavigation.tsx
// Tab navigation for landing page editor

'use client'

import {
  IoTextOutline,
  IoCallOutline,
  IoColorPaletteOutline,
  IoSettingsOutline,
  IoDocumentTextOutline,
  IoCreateOutline
} from 'react-icons/io5'
import { TabType } from './types'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  faqCount: number
}

const TABS = [
  { id: 'content' as TabType, label: 'Content', icon: IoTextOutline },
  { id: 'social' as TabType, label: 'Contact & Social', shortLabel: 'Contact', icon: IoCallOutline },
  { id: 'branding' as TabType, label: 'Branding', icon: IoColorPaletteOutline },
  { id: 'services' as TabType, label: 'Services', icon: IoSettingsOutline },
  { id: 'policies' as TabType, label: 'Policies', icon: IoDocumentTextOutline },
  { id: 'faqs' as TabType, label: 'FAQs', icon: IoCreateOutline }
]

export default function TabNavigation({ activeTab, onTabChange, faqCount }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
      <nav className="flex gap-0 sm:gap-2 min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
                {tab.id === 'faqs' && faqCount > 0 && (
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {faqCount}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
