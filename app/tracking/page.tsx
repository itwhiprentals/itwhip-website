// app/tracking/page.tsx
// PUBLIC Fleet Tracking page - showcases ItWhip+ tracking features without authentication
// This is the guest-facing version; partner dashboard version is at /partner/tracking

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoLocationOutline,
  IoLockClosedOutline,
  IoPowerOutline,
  IoSnowOutline,
  IoEllipseOutline,
  IoSpeedometerOutline,
  IoFlashOffOutline,
  IoVolumeHighOutline,
  IoStatsChartOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
  IoPlayOutline,
  IoCheckmarkOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Fleet Tracking | ItWhip+ Vehicle Management',
  description: 'Track your rental fleet in real-time with ItWhip+. GPS tracking, remote lock/unlock, geofencing, speed alerts, and more. Protect your vehicles and maximize your rental business.',
  openGraph: {
    title: 'Fleet Tracking | ItWhip+ Vehicle Management',
    description: 'Track your rental fleet in real-time with ItWhip+. GPS tracking, remote lock/unlock, geofencing, speed alerts, and more.',
    url: 'https://itwhip.com/tracking',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/tracking',
  },
}

const FEATURES = [
  {
    id: 'gps',
    icon: IoLocationOutline,
    label: 'GPS Tracking',
    description: 'Real-time location updates every second during trips',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'lock',
    icon: IoLockClosedOutline,
    label: 'Remote Lock',
    description: 'Lock or unlock vehicle doors from anywhere',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'start',
    icon: IoPowerOutline,
    label: 'Remote Start',
    description: 'Start the engine remotely for guest convenience',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'precool',
    icon: IoSnowOutline,
    label: 'Pre-Cool',
    description: 'Pre-condition cabin temperature before pickup',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'geofence',
    icon: IoEllipseOutline,
    label: 'Geofencing',
    description: 'Set boundaries and get alerts when crossed',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'speed',
    icon: IoSpeedometerOutline,
    label: 'Speed Alerts',
    description: 'Monitor speed and get notifications for violations',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'killswitch',
    icon: IoFlashOffOutline,
    label: 'Kill Switch',
    description: 'Disable starter remotely for theft prevention',
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'honk',
    icon: IoVolumeHighOutline,
    label: 'Horn & Lights',
    description: 'Locate vehicle in parking lots easily',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'mileage',
    icon: IoStatsChartOutline,
    label: 'Mileage Forensics',
    description: 'Cross-verify OBD odometer vs GPS distance',
    color: 'from-amber-500 to-amber-600',
    exclusive: true
  }
]

const BENEFITS = [
  {
    title: 'Protect Your Investment',
    description: 'Know where your vehicles are 24/7. Get instant alerts for unauthorized use, speeding, or boundary violations.',
    icon: IoShieldCheckmarkOutline
  },
  {
    title: 'Improve Guest Experience',
    description: 'Remote unlock for guests who lock keys inside. Pre-cool vehicles on hot Arizona days before pickup.',
    icon: IoCarSportOutline
  },
  {
    title: 'Reduce Disputes',
    description: 'Mileage Forensics cross-verifies GPS trips with OBD odometer readings. Catch discrepancies automatically.',
    icon: IoStatsChartOutline
  }
]

export default function PublicTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo-white.png"
                alt="ItWhip"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <span className="text-amber-200">ItWhip+</span>
                  <sup className="text-sm text-amber-300">™</sup>
                </h1>
                <p className="text-sm text-white/80">Fleet Tracking</p>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Track Your Fleet in Real-Time
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              GPS tracking, remote controls, and smart alerts — all in one unified dashboard.
              Powered by OBD hardware + connected car APIs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/partner/tracking/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
              >
                <IoPlayOutline className="w-5 h-5" />
                Try Live Demo
              </Link>
              <Link
                href="/partner/tracking"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/30 text-white font-semibold rounded-lg hover:bg-orange-500/40 transition-colors border border-white/30"
              >
                Host Dashboard
                <IoArrowForwardOutline className="w-5 h-5" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-amber-200">
              <span className="font-semibold text-green-400">Free</span> for all ItWhip hosts • No monthly fees
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Complete Fleet Control
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            9 powerful features unified in one dashboard. Combine OBD-II hardware (Bouncie) with connected car APIs (Smartcar) for complete coverage.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={`relative p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group ${
                feature.exclusive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
              }`}
            >
              {feature.exclusive && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow">
                  EXCLUSIVE
                </span>
              )}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                {feature.label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Why Hosts Love ItWhip+
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Powered by Industry Leaders
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ItWhip+ integrates with top tracking providers to give you complete fleet visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bouncie Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bouncie</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">OBD-II Hardware</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                GPS tracking with 1-second updates
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Speed alerts & geofencing
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                OBD diagnostics & odometer
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Works with any vehicle with OBD port
              </li>
            </ul>
          </div>

          {/* Smartcar Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smartcar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connected Car API</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Remote lock/unlock
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Climate pre-conditioning
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Horn & lights locator
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                Supports 39+ car brands (2015+)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Use both together for complete coverage — OBD for diagnostics, API for remote control.
          </p>
          <Link
            href="/partner/tracking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get Started Free
            <IoArrowForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Protect Your Fleet?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of hosts who trust ItWhip+ to keep their vehicles safe and their guests happy.
            Start tracking in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/partner/tracking/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IoPlayOutline className="w-5 h-5" />
              Try Interactive Demo
            </Link>
            <Link
              href="/host-requirements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              Become a Host
              <IoArrowForwardOutline className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
