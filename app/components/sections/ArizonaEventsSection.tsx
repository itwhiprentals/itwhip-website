// app/components/sections/ArizonaEventsSection.tsx
'use client'

import {
  IoCashOutline,
  IoCalendarOutline,
  IoTrophyOutline
} from 'react-icons/io5'

interface Event {
  month: string
  name: string
  desc: string
  icon: typeof IoTrophyOutline | typeof IoCalendarOutline
  multiplier: string
}

export default function ArizonaEventsSection() {
  const events: Event[] = [
    { month: 'JAN', name: 'Barrett-Jackson', desc: 'Classic car auction week', icon: IoTrophyOutline, multiplier: '1.5x rates' },
    { month: 'JAN-FEB', name: 'PGA Phoenix Open', desc: 'Waste Management Open', icon: IoTrophyOutline, multiplier: '1.3x rates' },
    { month: 'FEB-MAR', name: 'Spring Training', desc: '15 MLB teams', icon: IoTrophyOutline, multiplier: '1.4x rates' },
    { month: 'MAR', name: 'Scottsdale Arts Festival', desc: 'Convertible weather', icon: IoCalendarOutline, multiplier: 'Peak demand' },
    { month: 'APR', name: 'Phoenix Film Festival', desc: 'Celebrity arrivals', icon: IoCalendarOutline, multiplier: '1.2x rates' },
    { month: 'OCT', name: 'Arizona State Fair', desc: 'Family travel surge', icon: IoCalendarOutline, multiplier: '1.3x rates' },
    { month: 'NOV', name: 'Las Vegas F1 Overflow', desc: 'Vegas visitors', icon: IoTrophyOutline, multiplier: '1.5x rates' },
    { month: 'DEC', name: 'Fiesta Bowl', desc: 'College football championship', icon: IoTrophyOutline, multiplier: '1.4x rates' }
  ]

  return (
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Dynamic Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
            Arizona Events Calendar
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Maximize earnings during peak events. Our dynamic pricing adjusts automatically for major Arizona events.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {events.map(event => {
            const Icon = event.icon
            return (
              <div key={event.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                    {event.month}
                  </span>
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
                  {event.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {event.desc}
                </p>
                <div className="flex items-center gap-1">
                  <IoCashOutline className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {event.multiplier}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Summer Special</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            June-August: 20% discount automatically applied. Help guests beat the heat while maintaining steady bookings.
          </p>
        </div>
      </div>
    </section>
  )
}