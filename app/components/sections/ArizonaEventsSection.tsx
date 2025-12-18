// app/components/sections/ArizonaEventsSection.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IoCashOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'
import EventBottomSheet, { EventData } from '@/app/components/EventBottomSheet'

interface EventDisplay {
  month: string
  name: string
  desc: string
  icon: typeof IoTrophyOutline | typeof IoCalendarOutline
  multiplier: string
  fullData: EventData
}

export default function ArizonaEventsSection() {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const events: EventDisplay[] = [
    {
      month: 'JAN',
      name: 'Barrett-Jackson',
      desc: 'Classic car auction week',
      icon: IoTrophyOutline,
      multiplier: '1.5x rates',
      fullData: {
        name: 'Barrett-Jackson Collector Car Auction',
        month: 'JAN',
        dates: { start: '2025-01-18', end: '2025-01-26' },
        location: 'Scottsdale',
        description: 'The world\'s greatest collector car auction brings thousands of automotive enthusiasts to Scottsdale. Luxury and classic cars take center stage, making this the perfect time to rent a premium vehicle and experience Arizona in style.',
        demandLevel: 'high',
        rateMultiplier: 1.5,
        category: 'automotive',
        tip: 'Premium and luxury vehicles book out fast for Barrett-Jackson week. Reserve your ride 2-3 weeks early for the best selection of convertibles and sports cars.'
      }
    },
    {
      month: 'JAN-FEB',
      name: 'PGA Phoenix Open',
      desc: 'Waste Management Open',
      icon: IoTrophyOutline,
      multiplier: '1.3x rates',
      fullData: {
        name: 'WM Phoenix Open',
        month: 'JAN-FEB',
        dates: { start: '2025-02-03', end: '2025-02-09' },
        location: 'Scottsdale',
        description: 'The "Greatest Show on Grass" draws over 700,000 fans to TPC Scottsdale. The famous 16th hole party atmosphere makes this one of the most attended golf events in the world.',
        demandLevel: 'high',
        rateMultiplier: 1.3,
        category: 'sports',
        tip: 'Golf fans often arrive days early. SUVs and comfortable sedans are popular for the commute to TPC Scottsdale. Book ahead to avoid last-minute surge pricing.'
      }
    },
    {
      month: 'FEB-MAR',
      name: 'Spring Training',
      desc: '15 MLB teams',
      icon: IoTrophyOutline,
      multiplier: '1.4x rates',
      fullData: {
        name: 'Cactus League Spring Training',
        month: 'FEB-MAR',
        dates: { start: '2025-02-22', end: '2025-03-25' },
        location: 'Phoenix',
        description: '15 Major League Baseball teams train across the Valley. Fans travel between stadiums in Mesa, Scottsdale, Tempe, Glendale, and Surprise to catch their favorite teams in intimate settings.',
        demandLevel: 'high',
        rateMultiplier: 1.4,
        category: 'sports',
        tip: 'Families visiting multiple stadiums need reliable vehicles with good AC. Book early for the best rates - Spring Training is our busiest season!'
      }
    },
    {
      month: 'MAR',
      name: 'Scottsdale Arts Festival',
      desc: 'Convertible weather',
      icon: IoCalendarOutline,
      multiplier: 'Peak demand',
      fullData: {
        name: 'Scottsdale Arts Festival',
        month: 'MAR',
        dates: { start: '2025-03-07', end: '2025-03-09' },
        location: 'Scottsdale',
        description: 'Arizona\'s premier fine arts festival features 170+ artists in downtown Scottsdale. Perfect weather makes this ideal for exploring Old Town and the surrounding desert in a convertible.',
        demandLevel: 'medium',
        rateMultiplier: 1.2,
        category: 'festival',
        tip: 'March offers ideal convertible weather in Arizona. Experience the festival and scenic desert drives with the top down!'
      }
    },
    {
      month: 'APR',
      name: 'Phoenix Film Festival',
      desc: 'Celebrity arrivals',
      icon: IoCalendarOutline,
      multiplier: '1.2x rates',
      fullData: {
        name: 'Phoenix Film Festival',
        month: 'APR',
        dates: { start: '2025-04-03', end: '2025-04-13' },
        location: 'Phoenix',
        description: 'Independent filmmakers and industry professionals gather for 11 days of screenings, panels, and networking. A sophisticated crowd appreciates premium transportation.',
        demandLevel: 'medium',
        rateMultiplier: 1.2,
        category: 'entertainment',
        tip: 'Looking to make an impression? Our hosts offer luxury sedans and premium SUVs perfect for festival events and red carpet moments.'
      }
    },
    {
      month: 'OCT',
      name: 'Arizona State Fair',
      desc: 'Family travel surge',
      icon: IoCalendarOutline,
      multiplier: '1.3x rates',
      fullData: {
        name: 'Arizona State Fair',
        month: 'OCT',
        dates: { start: '2025-09-26', end: '2025-11-02' },
        location: 'Phoenix',
        description: 'Six weeks of rides, concerts, food, and entertainment at the Arizona State Fairgrounds. Families from across Arizona and neighboring states make the trip to Phoenix.',
        demandLevel: 'medium',
        rateMultiplier: 1.3,
        category: 'festival',
        tip: 'Families need space! Our hosts offer SUVs and minivans perfect for fair trips. Easy parking at the fairgrounds when you\'re not dealing with rental car shuttles.'
      }
    },
    {
      month: 'NOV',
      name: 'Las Vegas F1 Overflow',
      desc: 'Vegas visitors',
      icon: IoTrophyOutline,
      multiplier: '1.5x rates',
      fullData: {
        name: 'Las Vegas F1 Grand Prix Weekend',
        month: 'NOV',
        dates: { start: '2025-11-20', end: '2025-11-23' },
        location: 'Phoenix',
        description: 'The Las Vegas Grand Prix sells out hotels for 100+ miles. Savvy race fans stay in Phoenix and make the scenic 4.5-hour drive. Sky Harbor offers convenient flights too.',
        demandLevel: 'high',
        rateMultiplier: 1.5,
        category: 'sports',
        tip: 'Stay in Phoenix, drive to Vegas for the race! Our vehicles are road-trip ready with unlimited mileage options. Book your Phoenix-to-Vegas chariot early.'
      }
    },
    {
      month: 'DEC',
      name: 'Fiesta Bowl',
      desc: 'College football championship',
      icon: IoTrophyOutline,
      multiplier: '1.4x rates',
      fullData: {
        name: 'College Football Playoff - Fiesta Bowl',
        month: 'DEC',
        dates: { start: '2025-12-28', end: '2026-01-01' },
        location: 'Glendale',
        description: 'The Fiesta Bowl at State Farm Stadium hosts College Football Playoff games, bringing passionate fan bases from across the country to the West Valley.',
        demandLevel: 'high',
        rateMultiplier: 1.4,
        category: 'sports',
        tip: 'College football fans travel in groups. Our hosts offer SUVs with tailgate-friendly cargo space. Perfect for game day gear and post-game celebrations!'
      }
    }
  ]

  const handleEventClick = (event: EventDisplay) => {
    setSelectedEvent(event.fullData)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setTimeout(() => setSelectedEvent(null), 200)
  }

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
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
              <div
                key={event.name}
                onClick={() => handleEventClick(event)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                    {event.month}
                  </span>
                  <Icon className="w-4 h-4 text-amber-500" />
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

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Summer:</span> 20% auto-discount applied. Premium vehicles for every event.{' '}
            <Link
              href="/coverage"
              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline"
            >
              View coverage areas
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>

      {/* Event Bottom Sheet */}
      <EventBottomSheet
        event={selectedEvent}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </section>
  )
}
