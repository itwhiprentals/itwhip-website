// app/tracking/page.tsx
// PUBLIC Vehicle Tracking Information Page
// Shows tracking providers, features, and demo link

import Link from 'next/link'
import {
  IoLocationOutline,
  IoCarSportOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoLinkOutline,
  IoPlayOutline,
  IoSpeedometerOutline,
  IoTrendingUpOutline,
  IoStar
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Mileage Forensics feature data
const MILEAGE_FORENSICS = {
  name: 'Mileage Forensics™',
  description: 'Automatically detects discrepancies between reported odometer readings and actual GPS-tracked trip distances. Catches tampering, unreported trips, and billing disputes before they become problems.',
  howItWorks: [
    'Bouncie OBD reads actual odometer from vehicle ECU',
    'Smartcar/GPS tracks trip distances independently',
    'ItWhip+ compares both sources in real-time',
    'Discrepancies flagged with detailed reports'
  ],
  benefits: [
    'Detect odometer tampering or rollback',
    'Identify unreported personal trips',
    'Auto-generate dispute evidence',
    'Insurance claim documentation'
  ]
}

// Secondary provider options
const SECONDARY_PROVIDERS = [
  {
    id: 'zubie',
    name: 'Zubie',
    monthlyPrice: '$15/mo',
    description: 'Fleet-focused OBD-II tracker with driver scoring and maintenance alerts.',
    hasApiIntegration: true,
    strengths: [
      'Always-on tracking with detailed maps',
      'Driver behavior scoring',
      'Instant alerts for speeding/harsh driving'
    ],
    website: 'https://zubie.com'
  },
  {
    id: 'moovetrax',
    name: 'MooveTrax',
    monthlyPrice: '$12/mo',
    description: 'Advanced GPS tracker with kill switch. No ItWhip+ integration - use MooveTrax app separately.',
    hasApiIntegration: false,
    strengths: [
      'Kill switch / starter interrupt',
      'Bluetooth proximity auto-lock',
      'Tamper detection'
    ],
    website: 'https://moovetrax.com'
  },
  {
    id: 'trackimo',
    name: 'Trackimo',
    monthlyPrice: '$10/mo',
    description: 'Portable GPS tracker with multiple locating technologies. No ItWhip integration - use Trackimo app separately.',
    hasApiIntegration: false,
    strengths: [
      'GPS + Wi-Fi + Bluetooth + GSM triangulation',
      'Portable - can be hidden anywhere',
      'Customizable speed thresholds'
    ],
    website: 'https://trackimo.com'
  }
]

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoLocationOutline className="w-7 h-7 text-orange-600" />
            Vehicle Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your fleet in real-time, prevent theft, and resolve disputes faster
          </p>
        </div>

        <div className="space-y-8">
          {/* Recommended Setup Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-5 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600">
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <IoStar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Setup</h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded border border-white/50 whitespace-nowrap">
                    <IoTrendingUpOutline className="w-3 h-3" />
                    44% less than FleetBold
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">~$15/mo per vehicle</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get complete fleet protection with Bouncie + Smartcar combination. All 8 features covered plus Mileage Forensics™.
            </p>

            {/* Features Grid */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900 dark:text-white">Bouncie ($8/mo):</strong> GPS, Speed Alerts, Geofencing, OBD Diagnostics</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900 dark:text-white">Smartcar ($1.99/mo):</strong> Lock/Unlock, Remote Start, Climate Control</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900 dark:text-white">ItWhip+ <span className="text-green-600 dark:text-green-400">(Free)</span>:</strong> Mileage Forensics™, Unified Dashboard</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2">
              <a
                href="https://bouncie.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get Started
                <IoChevronForwardOutline className="w-4 h-4" />
              </a>
              <Link
                href="/host-requirements"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <IoLinkOutline className="w-4 h-4" />
                Connect
              </Link>
            </div>
          </div>

          {/* Mileage Forensics Feature Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-5 border border-amber-200 dark:border-gray-700">
            {/* Header with Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <IoSpeedometerOutline className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {MILEAGE_FORENSICS.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded border border-white/50">
                    EXCLUSIVE
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ItWhip+ Feature</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {MILEAGE_FORENSICS.description}
            </p>

            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {MILEAGE_FORENSICS.howItWorks.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2">
              {MILEAGE_FORENSICS.benefits.map((benefit, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded border border-amber-200 dark:border-gray-600">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Fleet Status Placeholder */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <IoCarSportOutline className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-white">0</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">3</span> vehicles tracked
              </span>
            </div>
          </div>

          {/* Other Provider Options */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Other Provider Options
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              Alternative tracking solutions if you prefer a single provider
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SECONDARY_PROVIDERS.map(provider => (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
                >
                  {/* Provider Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${
                      provider.id === 'zubie' ? 'from-green-500 to-green-600' :
                      provider.id === 'moovetrax' ? 'from-cyan-500 to-cyan-600' :
                      'from-red-500 to-red-600'
                    } rounded-lg flex items-center justify-center text-white font-bold`}>
                      {provider.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        {provider.hasApiIntegration === false && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded border border-white/50 whitespace-nowrap">
                            No ItWhip+ integration
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{provider.monthlyPrice}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {provider.description}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-1 mb-3">
                    {provider.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Already Have a Device */}
          <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Already have a tracking device or account?
            </p>
            <Link
              href="/host-requirements"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium rounded-lg transition-colors"
            >
              <IoLinkOutline className="w-5 h-5" />
              Connect Existing Account
            </Link>
          </div>

          {/* Interactive Demo Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-200 dark:border-orange-800 p-5 transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <IoPlayOutline className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Demo</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No signup required</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                Try Free
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              See what hosts experience with a fully connected fleet. Live map, remote commands, and real-time alerts.
            </p>

            {/* Features List */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>Live GPS • Lock/Unlock • Remote Start • Pre-Cool</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>Geofencing • Speed Alerts • Horn/Lights • Mileage Forensics™</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>Interactive Mapbox map with Phoenix demo fleet</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/tracking/demo"
              className="block w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
