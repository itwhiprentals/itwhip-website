// app/help/chloe/components/ChoeAuto.tsx
'use client'

import {
  IoPhonePortraitOutline,
  IoCarOutline,
  IoDesktopOutline,
  IoMicOutline,
  IoVolumeHighOutline,
  IoCheckmarkCircle,
  IoSparklesOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

const devices = [
  {
    icon: IoDesktopOutline,
    label: 'Desktop',
    description: 'Browse, plan, save to cart'
  },
  {
    icon: IoPhonePortraitOutline,
    label: 'Phone',
    description: 'Review, compare, manage'
  },
  {
    icon: IoCarOutline,
    label: 'CarPlay / Android Auto',
    description: 'Purchase by voice'
  }
]

const voiceCommands = [
  { command: '"Choé, my cart"', response: 'Reads back your saved vehicles with current pricing' },
  { command: '"Book number 1"', response: 'Confirms details — price, dates, payment method' },
  { command: '"Confirm"', response: 'Booked. Confirmation sent. Hands on wheel.' }
]

export function ChoeAuto() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-800 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50" />

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
            Choé Auto
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The first AI that lives in your car and handles commerce while you drive.
            CarPlay &amp; Android Auto integration.
          </p>
        </div>

        {/* Cross-Device Flow */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {devices.map((device, index) => (
            <div
              key={device.label}
              className="relative bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 text-center"
            >
              <device.icon className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                {device.label}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {device.description}
              </p>

              {/* Connection Arrow */}
              {index < devices.length - 1 && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden sm:block">
                  <div className="w-4 h-0.5 bg-violet-300 dark:bg-violet-700" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Voice Commands Demo */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <IoMicOutline className="w-5 h-5 text-violet-400" />
            <span className="text-white font-semibold text-sm sm:text-base">Voice Commands While Driving</span>
          </div>

          <div className="space-y-3">
            {voiceCommands.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <IoVolumeHighOutline className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-mono text-sm mb-1">{item.command}</p>
                  <p className="text-gray-400 text-xs">{item.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 sm:p-5 border border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-violet-900 dark:text-violet-100 mb-1">
                Safety First
              </h3>
              <p className="text-sm text-violet-700 dark:text-violet-300">
                While driving, Choé is <strong>voice-only</strong>. No visual browsing. No scrolling.
                Full browsing with photos and comparisons is for when you&apos;re parked or on your phone at home.
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Same cart across all devices',
            'Voice confirmation for bookings',
            'Real-time price updates',
            'Traffic-aware suggestions',
            'Apple CarPlay ready',
            'Android Auto ready'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IoCheckmarkCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
