// app/fleet/bookings/components/BookingsTabs.tsx
'use client'

interface BookingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  stats: {
    pendingVerification: number
    activeBookings: number
    needsAttention: number
    todayBookings: number
    totalBookings: number
  }
}

export function BookingsTabs({ activeTab, onTabChange, stats }: BookingsTabsProps) {
  const tabs = [
    { id: 'all', label: 'All Bookings', count: stats.totalBookings },
    { id: 'pending_verification', label: 'Pending Verification', count: stats.pendingVerification, highlight: stats.pendingVerification > 0 },
    { id: 'active', label: 'Active Trips', count: stats.activeBookings },
    { id: 'needs_attention', label: 'Needs Attention', count: stats.needsAttention, highlight: stats.needsAttention > 0 },
    { id: 'today', label: 'Today', count: stats.todayBookings }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                tab.highlight
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
