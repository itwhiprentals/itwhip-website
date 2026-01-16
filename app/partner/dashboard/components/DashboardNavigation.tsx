// app/partner/dashboard/components/DashboardNavigation.tsx
// Horizontal scrollable navigation badges for dashboard sections

'use client'

import { IconType } from 'react-icons'
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoShieldOutline,
  IoCodeOutline,
  IoDocumentTextOutline,
  IoCalendarNumberOutline,
  IoCarOutline,
  IoMailOutline,
  IoCashOutline,
  IoSpeedometerOutline,
  IoListOutline,
  IoTrophyOutline,
  IoLeafOutline
} from 'react-icons/io5'

export type DashboardSection =
  | 'tracking'
  | 'session'
  | 'security'
  | 'api'
  | 'audit'
  | 'booking'
  | 'fleet'
  | 'invitation'
  | 'revenue'
  | 'fleet-status'
  | 'recent-bookings'
  | 'commission'
  | 'esg'

interface NavBadge {
  id: DashboardSection
  label: string
  icon: IconType
  color: string
}

const NAV_BADGES: NavBadge[] = [
  { id: 'tracking', label: 'Tracking', icon: IoLocationOutline, color: 'blue' },
  { id: 'session', label: 'Session', icon: IoCalendarOutline, color: 'green' },
  { id: 'security', label: 'Security', icon: IoShieldOutline, color: 'purple' },
  { id: 'api', label: 'API', icon: IoCodeOutline, color: 'cyan' },
  { id: 'audit', label: 'Audit', icon: IoDocumentTextOutline, color: 'yellow' },
  { id: 'booking', label: 'Booking', icon: IoCalendarNumberOutline, color: 'orange' },
  { id: 'fleet', label: 'Fleet', icon: IoCarOutline, color: 'blue' },
  { id: 'invitation', label: 'Invitations', icon: IoMailOutline, color: 'pink' },
  { id: 'revenue', label: 'Revenue', icon: IoCashOutline, color: 'green' },
  { id: 'fleet-status', label: 'Fleet Status', icon: IoSpeedometerOutline, color: 'indigo' },
  { id: 'recent-bookings', label: 'Recent Bookings', icon: IoListOutline, color: 'amber' },
  { id: 'commission', label: 'Commission', icon: IoTrophyOutline, color: 'rose' },
  { id: 'esg', label: 'ESG Score', icon: IoLeafOutline, color: 'green' },
]

interface DashboardNavigationProps {
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
  loading?: boolean
}

export default function DashboardNavigation({
  activeSection,
  onSectionChange,
  loading = false
}: DashboardNavigationProps) {
  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 animate-pulse">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0"
            >
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Horizontal scroll container */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {NAV_BADGES.map((badge) => {
          const Icon = badge.icon
          const isActive = activeSection === badge.id

          return (
            <button
              key={badge.id}
              onClick={() => onSectionChange(badge.id)}
              className={`
                flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${isActive
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{badge.label}</span>
            </button>
          )
        })}
      </div>

      {/* Fade indicators for scroll */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
    </div>
  )
}

// Export badges for reuse
export { NAV_BADGES }
export type { NavBadge }
