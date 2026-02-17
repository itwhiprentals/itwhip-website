// app/components/sections/ArizonaEventsSection.tsx
'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('Home')
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Event data — event names are proper nouns, descriptions/multipliers use translations
  const events: EventDisplay[] = [
    {
      month: 'JAN',
      name: 'Barrett-Jackson',
      desc: t('eventBarrettJacksonDesc'),
      icon: IoTrophyOutline,
      multiplier: t('eventRateMultiplier15'),
      fullData: {
        name: 'Barrett-Jackson Collector Car Auction',
        month: 'JAN',
        dates: { start: '2026-01-17', end: '2026-01-25' },
        location: 'Scottsdale',
        description: t('eventBarrettJacksonFull'),
        demandLevel: 'high',
        rateMultiplier: 1.5,
        category: 'automotive',
        tip: t('eventBarrettJacksonTip')
      }
    },
    {
      month: 'JAN-FEB',
      name: 'PGA Phoenix Open',
      desc: 'Waste Management Open',
      icon: IoTrophyOutline,
      multiplier: t('eventRateMultiplier13'),
      fullData: {
        name: 'WM Phoenix Open',
        month: 'JAN-FEB',
        dates: { start: '2026-02-02', end: '2026-02-08' },
        location: 'Scottsdale',
        description: t('eventPgaOpenFull'),
        demandLevel: 'high',
        rateMultiplier: 1.3,
        category: 'sports',
        tip: t('eventPgaOpenTip')
      }
    },
    {
      month: 'FEB-MAR',
      name: 'Spring Training',
      desc: t('eventSpringTrainingDesc'),
      icon: IoTrophyOutline,
      multiplier: t('eventRateMultiplier14'),
      fullData: {
        name: 'Cactus League Spring Training',
        month: 'FEB-MAR',
        dates: { start: '2026-02-20', end: '2026-03-24' },
        location: 'Phoenix',
        description: t('eventSpringTrainingFull'),
        demandLevel: 'high',
        rateMultiplier: 1.4,
        category: 'sports',
        tip: t('eventSpringTrainingTip')
      }
    },
    {
      month: 'MAR',
      name: 'Scottsdale Arts Festival',
      desc: t('eventArtsFestDesc'),
      icon: IoCalendarOutline,
      multiplier: t('eventPeakDemand'),
      fullData: {
        name: 'Scottsdale Arts Festival',
        month: 'MAR',
        dates: { start: '2026-03-19', end: '2026-03-22' },
        location: 'Scottsdale',
        description: t('eventArtsFestFull'),
        demandLevel: 'medium',
        rateMultiplier: 1.2,
        category: 'festival',
        tip: t('eventArtsFestTip')
      }
    },
    {
      month: 'APR',
      name: 'Phoenix Film Festival',
      desc: t('eventFilmFestDesc'),
      icon: IoCalendarOutline,
      multiplier: t('eventRateMultiplier12'),
      fullData: {
        name: 'Phoenix Film Festival',
        month: 'APR',
        dates: { start: '2026-04-09', end: '2026-04-19' },
        location: 'Phoenix',
        description: t('eventFilmFestFull'),
        demandLevel: 'medium',
        rateMultiplier: 1.2,
        category: 'entertainment',
        tip: t('eventFilmFestTip')
      }
    },
    {
      month: 'OCT',
      name: 'Arizona State Fair',
      desc: t('eventStateFairDesc'),
      icon: IoCalendarOutline,
      multiplier: t('eventRateMultiplier13'),
      fullData: {
        name: 'Arizona State Fair',
        month: 'OCT',
        dates: { start: '2026-09-18', end: '2026-10-26' },
        location: 'Phoenix',
        description: t('eventStateFairFull'),
        demandLevel: 'medium',
        rateMultiplier: 1.3,
        category: 'festival',
        tip: t('eventStateFairTip')
      }
    },
    {
      month: 'NOV',
      name: 'Las Vegas F1 Overflow',
      desc: t('eventF1Desc'),
      icon: IoTrophyOutline,
      multiplier: t('eventRateMultiplier15'),
      fullData: {
        name: 'Las Vegas F1 Grand Prix Weekend',
        month: 'NOV',
        dates: { start: '2026-11-19', end: '2026-11-21' },
        location: 'Phoenix',
        description: t('eventF1Full'),
        demandLevel: 'high',
        rateMultiplier: 1.5,
        category: 'sports',
        tip: t('eventF1Tip')
      }
    },
    {
      month: 'DEC',
      name: 'Fiesta Bowl',
      desc: t('eventFiestaBowlDesc'),
      icon: IoTrophyOutline,
      multiplier: t('eventRateMultiplier14'),
      fullData: {
        name: 'College Football Playoff - Fiesta Bowl',
        month: 'DEC',
        dates: { start: '2026-12-31', end: '2027-01-01' },
        location: 'Glendale',
        description: t('eventFiestaBowlFull'),
        demandLevel: 'high',
        rateMultiplier: 1.4,
        category: 'sports',
        tip: t('eventFiestaBowlTip')
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
          <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            {t('eventsLabel')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
            {t('eventsHeading')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('eventsDescription')}
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
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
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
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
            <span className="font-semibold text-amber-700 dark:text-amber-400">{t('eventsSummer')}</span> {t('eventsSummerCta')}{' '}
            <Link
              href="/coverage"
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline"
            >
              {t('eventsViewCoverage')}
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
