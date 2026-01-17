// app/components/sections/TrackingSection.tsx
// Compact tracking features display for home page - matches ArizonaEventsSection style
'use client'

import Link from 'next/link'
import {
  IoLocationOutline,
  IoLockClosedOutline,
  IoCarSportOutline,
  IoSnowOutline,
  IoNavigateOutline,
  IoSpeedometerOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

const trackingFeatures = [
  {
    icon: IoLocationOutline,
    title: 'Live GPS',
    description: 'Real-time location tracking',
    highlights: ['Second-by-second', 'Trip history']
  },
  {
    icon: IoLockClosedOutline,
    title: 'Remote Lock',
    description: 'Keyless access via app',
    highlights: ['No key handoff', 'Audit logs']
  },
  {
    icon: IoCarSportOutline,
    title: 'Remote Start',
    description: 'Start engine from phone',
    highlights: ['One-tap start', 'Engine warm-up']
  },
  {
    icon: IoSnowOutline,
    title: 'Pre-Cool',
    description: 'Cool cabin remotely',
    highlights: ['Beat AZ heat', 'Set temp']
  },
  {
    icon: IoNavigateOutline,
    title: 'Geofencing',
    description: 'Virtual boundary alerts',
    highlights: ['Safe zones', 'Exit alerts']
  },
  {
    icon: IoSpeedometerOutline,
    title: 'Mileage Forensics™',
    description: 'Every mile verified',
    highlights: ['Fraud detection', 'Dispute proof']
  }
]

export default function TrackingSection() {
  return (
    <section className="py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            ItWhip+ Fleet Tracking
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
            Smart Tracking, Safer Rentals
          </h2>
        </div>

        {/* Compact horizontal layout - 6 cards */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-3 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          {trackingFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="snap-center flex-shrink-0 w-[160px] sm:w-[180px] md:w-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
                <div className="space-y-1">
                  {feature.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-1">
                      <IoCheckmarkCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="text-[10px] text-gray-600 dark:text-gray-400">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Compact CTA */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Every mile tracked, verified, protected.{' '}
            <Link
              href="/tracking"
              className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium hover:underline"
            >
              Learn More
              <IoArrowForwardOutline className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
