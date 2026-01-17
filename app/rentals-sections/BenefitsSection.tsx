// app/rentals-sections/BenefitsSection.tsx
// Why Rent with ItWhip - horizontal scroll on mobile
'use client'

import {
  IoShieldCheckmarkOutline,
  IoSnowOutline,
  IoThermometerOutline,
  IoPersonOutline,
  IoAirplaneOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

const benefits = [
  {
    icon: IoShieldCheckmarkOutline,
    title: '$1M Protection',
    description: 'Every trip backed by comprehensive liability coverage',
    stat: 'Fully insured'
  },
  {
    icon: IoThermometerOutline,
    title: 'MaxAC™ Certified',
    description: 'Every vehicle tested for Phoenix summer heat',
    stat: 'Arizona ready'
  },
  {
    icon: IoSnowOutline,
    title: 'Pre-Cooled Delivery',
    description: 'Your car arrives cool, not sitting in a scorching lot',
    stat: 'Skip the hot lot'
  },
  {
    icon: IoPersonOutline,
    title: 'Local Phoenix Hosts',
    description: 'Real people with personalized service, not corporate counters',
    stat: 'Verified & trusted'
  },
  {
    icon: IoAirplaneOutline,
    title: 'Flexible Pickup',
    description: 'Airport, hotel, or home delivery available',
    stat: 'Meet anywhere'
  },
  {
    icon: IoCheckmarkCircleOutline,
    title: 'Transparent Pricing',
    description: 'No hidden fees or surprise counter upsells',
    stat: 'No surprises'
  }
]

export default function BenefitsSection() {
  return (
    <section className="py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Phoenix • Scottsdale • Tempe • Mesa • Chandler
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-1">
            Why Rent with ItWhip
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Peer-to-peer car rentals with built-in protection
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto pb-3 lg:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="snap-center flex-shrink-0 w-[160px] sm:w-[180px] lg:w-auto bg-white dark:bg-gray-800 rounded-lg p-3 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                    {benefit.title}
                  </h3>
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 mb-1">
                    {benefit.stat}
                  </span>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">
                    {benefit.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
