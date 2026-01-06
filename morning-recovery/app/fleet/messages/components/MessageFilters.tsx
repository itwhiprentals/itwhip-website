// app/fleet/messages/components/MessageFilters.tsx
'use client'

import { 
  IoMailOutline, 
  IoMailUnreadOutline,
  IoCarSportOutline,
  IoChatbubbleEllipsesOutline,
  IoBusinessOutline
} from 'react-icons/io5'

interface MessageFiltersProps {
  filter: string
  onFilterChange: (filter: string) => void
  counts: {
    all: number
    unread: number
    booking: number
    contact: number
    inquiry: number
  }
}

export default function MessageFilters({ filter, onFilterChange, counts }: MessageFiltersProps) {
  const filters = [
    { 
      id: 'all', 
      label: 'All Messages', 
      icon: IoMailOutline, 
      count: counts.all,
      color: 'blue'
    },
    { 
      id: 'unread', 
      label: 'Unread', 
      icon: IoMailUnreadOutline, 
      count: counts.unread,
      color: 'red'
    },
    { 
      id: 'booking', 
      label: 'Bookings', 
      icon: IoCarSportOutline, 
      count: counts.booking,
      color: 'green'
    },
    { 
      id: 'contact', 
      label: 'Contact', 
      icon: IoChatbubbleEllipsesOutline, 
      count: counts.contact,
      color: 'purple'
    },
    { 
      id: 'inquiry', 
      label: 'Host Apps', 
      icon: IoBusinessOutline, 
      count: counts.inquiry,
      color: 'orange'
    }
  ]

  return (
    <>
      {/* MOBILE: Horizontal Scrollable Filters */}
      <div className="lg:hidden mb-4 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap
                  ${filter === f.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{f.label}</span>
                {f.count > 0 && (
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full
                    ${filter === f.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {f.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* DESKTOP: Sidebar Filters */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Filters
        </h3>
        
        <div className="space-y-2">
          {filters.map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                  ${filter === f.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span>{f.label}</span>
                </div>
                
                {f.count > 0 && (
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full
                    ${filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {f.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Stats - Desktop Only */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Response Rate</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">98%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">2.5hrs</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}