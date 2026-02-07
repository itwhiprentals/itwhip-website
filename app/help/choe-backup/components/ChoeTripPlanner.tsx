// app/help/choe/components/ChoeTripPlanner.tsx
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
  IoChevronForwardOutline
} from 'react-icons/io5'

const tripFeatures = [
  {
    icon: IoAirplaneOutline,
    label: 'Real Flights',
    description: 'Best arrival windows into Sky Harbor'
  },
  {
    icon: IoBedOutline,
    label: 'Real Hotels',
    description: 'Pool, group rates, verified availability'
  },
  {
    icon: IoCarSportOutline,
    label: 'Real Cars',
    description: 'No-deposit SUVs from ItWhip'
  },
  {
    icon: IoRestaurantOutline,
    label: 'Real Dining',
    description: 'Dinner spots near your hotel'
  },
  {
    icon: IoCloudyOutline,
    label: 'Real Weather',
    description: '85°F? Convertible is an option'
  },
  {
    icon: IoNavigateOutline,
    label: 'Real Traffic',
    description: 'Leave by 7 AM for Sedona'
  }
]

export function ChoeTripPlanner() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-800 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BETA Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold">
            <IoSparklesOutline className="w-3.5 h-3.5" />
            COMING SOON
          </span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Choé Trip Planner
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Not &quot;here&apos;s a Pinterest board of places to visit&quot; — an AI that pulls <span className="font-semibold text-violet-600 dark:text-violet-400">real data</span> and builds an actionable itinerary with live bookings baked in.
          </p>
        </div>

        {/* Example Conversation */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">You</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl rounded-tl-none px-4 py-3 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-900 dark:text-white">
                &quot;Bachelor party in Scottsdale, 6 guys, March 15-18, budget $200/person/day&quot;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl rounded-tl-none px-4 py-3 border border-violet-200 dark:border-violet-800">
                <p className="text-sm text-gray-900 dark:text-white mb-3">
                  I&apos;ve got you covered! Here&apos;s your complete trip plan:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoAirplaneOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">Flights into Sky Harbor arriving 2 PM Friday</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoBedOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">W Scottsdale - pool, group rate $189/night</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoCarSportOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">2 SUVs from ItWhip, no deposit, $52/day each</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoRestaurantOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">Friday dinner: Maple &amp; Ash (0.3 mi from hotel)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoCloudyOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">Weather: 85°F, sunny - convertible upgrade available</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <IoNavigateOutline className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700 dark:text-gray-300">Saturday Sedona trip: leave by 7 AM to beat traffic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {tripFeatures.map((feature) => (
            <div
              key={feature.label}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 text-center"
            >
              <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
              <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                {feature.label}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {feature.description}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-sm sm:text-base font-medium text-violet-600 dark:text-violet-400 mb-4">
            One conversation. Everything connected. Car is booked.
          </p>
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
          >
            Join the waitlist at choe.cloud
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
