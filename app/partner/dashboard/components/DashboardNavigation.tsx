// app/partner/dashboard/components/DashboardNavigation.tsx
// Horizontal scrollable navigation badges for dashboard sections

'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
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
  IoLeafOutline,
  IoHandRightOutline
} from 'react-icons/io5'

export type DashboardSection =
  | 'tracking'
  | 'session'
  | 'security'
  | 'api'
  | 'audit'
  | 'requests'
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
  labelKey: string
  icon: IconType
  color: string
}

const NAV_BADGES: NavBadge[] = [
  { id: 'tracking', labelKey: 'navTracking', icon: IoLocationOutline, color: 'blue' },
  { id: 'requests', labelKey: 'navRequests', icon: IoHandRightOutline, color: 'orange' },
  { id: 'session', labelKey: 'navSession', icon: IoCalendarOutline, color: 'green' },
  { id: 'security', labelKey: 'navSecurity', icon: IoShieldOutline, color: 'purple' },
  { id: 'api', labelKey: 'navAPI', icon: IoCodeOutline, color: 'cyan' },
  { id: 'audit', labelKey: 'navAudit', icon: IoDocumentTextOutline, color: 'yellow' },
  { id: 'booking', labelKey: 'navBooking', icon: IoCalendarNumberOutline, color: 'orange' },
  { id: 'fleet', labelKey: 'navFleet', icon: IoCarOutline, color: 'blue' },
  { id: 'invitation', labelKey: 'navInvitations', icon: IoMailOutline, color: 'pink' },
  { id: 'revenue', labelKey: 'navRevenue', icon: IoCashOutline, color: 'green' },
  { id: 'fleet-status', labelKey: 'navFleetStatus', icon: IoSpeedometerOutline, color: 'indigo' },
  { id: 'recent-bookings', labelKey: 'navRecentBookings', icon: IoListOutline, color: 'amber' },
  { id: 'commission', labelKey: 'navCommission', icon: IoTrophyOutline, color: 'rose' },
  { id: 'esg', labelKey: 'navESGScore', icon: IoLeafOutline, color: 'green' },
]

// Badges to hide for external recruits (they don't need dev-focused tabs)
const EXTERNAL_HIDDEN_BADGES: DashboardSection[] = ['api', 'audit']

// Badge order for external recruits (Requests first)
const EXTERNAL_BADGE_ORDER: DashboardSection[] = [
  'requests',
  'tracking',
  'booking',
  'fleet',
  'session',
  'security',
  'invitation',
  'revenue',
  'fleet-status',
  'recent-bookings',
  'commission',
  'esg'
]

interface BadgeCounts {
  requests?: number
  booking?: number
  invitation?: number
  [key: string]: number | undefined
}

interface DashboardNavigationProps {
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
  loading?: boolean
  isExternalRecruit?: boolean
  badgeCounts?: BadgeCounts
}

export default function DashboardNavigation({
  activeSection,
  onSectionChange,
  loading = false,
  isExternalRecruit = false,
  badgeCounts = {}
}: DashboardNavigationProps) {
  const t = useTranslations('PartnerDashboard')
  // Get ordered and filtered badges based on user type
  const visibleBadges = useMemo(() => {
    if (isExternalRecruit) {
      // For external recruits: use custom order and hide dev-focused tabs
      return EXTERNAL_BADGE_ORDER
        .filter(id => !EXTERNAL_HIDDEN_BADGES.includes(id))
        .map(id => NAV_BADGES.find(b => b.id === id)!)
        .filter(Boolean)
    }
    return NAV_BADGES
  }, [isExternalRecruit])

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
        {visibleBadges.map((badge) => {
          const Icon = badge.icon
          const isActive = activeSection === badge.id
          const count = badgeCounts[badge.id]

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
              <span>{t(badge.labelKey)}</span>
              {/* Badge count indicator */}
              {count !== undefined && count > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full min-w-[20px] text-center
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-red-500 text-white'
                  }
                `}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
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
