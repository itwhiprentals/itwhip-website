// app/help/chloe/components/ChoeTripPlanner.tsx
'use client'

import Link from 'next/link'
import {
  IoAirplaneOutline,
  IoBedOutline,
  IoCarSportOutline,
  IoRestaurantOutline,
  IoCloudyOutline,
  IoNavigateOutline,
  IoSparklesOutline,
  IoChevronForwardOutline,
  IoTerminalOutline
} from 'react-icons/io5'

const tripFeatures = [
  {
    icon: IoAirplaneOutline,
    label: 'Real Flights',
    description: 'Best arrival windows'
  },
  {
    icon: IoBedOutline,
    label: 'Real Hotels',
    description: 'Pool, group rates'
  },
  {
    icon: IoCarSportOutline,
    label: 'Real Cars',
    description: 'No-deposit SUVs'
  },
  {
    icon: IoRestaurantOutline,
    label: 'Real Dining',
    description: 'Near your hotel'
  },
  {
    icon: IoCloudyOutline,
    label: 'Real Weather',
    description: 'Live forecasts'
  },
  {
    icon: IoNavigateOutline,
    label: 'Real Traffic',
    description: 'Optimal timing'
  }
]

export function ChoeTripPlanner() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-200 dark:border-[#222]">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e87040]/5 dark:bg-[#e87040]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4a574]/5 dark:bg-[#d4a574]/10 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BETA Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            Coming Soon
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Choé Trip Planner
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            Not &quot;here&apos;s a Pinterest board&quot; — an AI that pulls <span className="font-semibold text-[#e87040]">real data</span> and builds actionable itineraries with live bookings.
          </p>
        </div>

        {/* Terminal-style conversation */}
        <div className="bg-gray-900 dark:bg-[#1a1a1a] rounded-lg border border-gray-800 dark:border-[#333] overflow-hidden mb-8">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-[#252525] border-b border-gray-700 dark:border-[#333]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-[#666]">
              <IoTerminalOutline className="w-4 h-4" />
              <span>choé trip-planner</span>
            </div>
          </div>

          {/* Terminal content */}
          <div className="p-5 sm:p-6 font-mono text-sm">
            {/* User input */}
            <div className="flex items-start gap-3 mb-5">
              <span className="text-[#e87040] flex-shrink-0">$</span>
              <span className="text-gray-400 dark:text-[#a8a8a8]">
                &quot;Bachelor party in Scottsdale, 6 guys, March 15-18, budget $200/person/day&quot;
              </span>
            </div>

            {/* AI Response */}
            <div className="border-l-2 border-[#e87040] pl-4 space-y-3">
              <div className="text-[#27ca3f]">✓ Trip plan generated</div>

              <div className="space-y-2.5 text-gray-400 dark:text-[#a8a8a8]">
                <div className="flex items-center gap-3">
                  <IoAirplaneOutline className="w-4 h-4 text-[#e87040] flex-shrink-0" />
                  <span><span className="text-white">Flights:</span> Sky Harbor arrival 2 PM Friday</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoBedOutline className="w-4 h-4 text-[#ff7f50] flex-shrink-0" />
                  <span><span className="text-white">Hotel:</span> W Scottsdale - pool, group rate $189/night</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCarSportOutline className="w-4 h-4 text-[#d4a574] flex-shrink-0" />
                  <span><span className="text-white">Cars:</span> 2 SUVs from ItWhip, no deposit, $52/day each</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoRestaurantOutline className="w-4 h-4 text-[#c94c24] flex-shrink-0" />
                  <span><span className="text-white">Dinner:</span> Maple & Ash (0.3 mi from hotel)</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCloudyOutline className="w-4 h-4 text-[#e87040] flex-shrink-0" />
                  <span><span className="text-white">Weather:</span> 85°F sunny — convertible upgrade available</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoNavigateOutline className="w-4 h-4 text-[#ff7f50] flex-shrink-0" />
                  <span><span className="text-white">Tip:</span> Leave by 7 AM Saturday for Sedona day trip</span>
                </div>
              </div>

              <div className="pt-2 text-gray-500 dark:text-[#666]">
                <span className="text-[#27ca3f]">Ready to book?</span> Type <span className="text-white">&apos;confirm&apos;</span> to reserve all
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {tripFeatures.map((feature, index) => (
            <div
              key={feature.label}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-200 dark:border-[#333] hover:border-[#e87040]/40 transition-all text-center choe-animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <feature.icon className="w-6 h-6 text-[#e87040] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-gray-900 dark:text-white mb-1">
                {feature.label}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-[#666]">
                {feature.description}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-lg font-medium text-[#e87040] mb-4">
            One conversation. Everything connected. Car is booked.
          </p>
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-[#a8a8a8] hover:text-[#e87040] transition-colors"
          >
            Join the waitlist at choe.cloud
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
