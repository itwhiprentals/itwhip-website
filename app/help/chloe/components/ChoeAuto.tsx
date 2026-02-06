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
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-200 dark:border-[#222]">
      {/* Ambient car dashboard glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#e87040]/5 dark:from-[#e87040]/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#e87040]/5 dark:bg-[#e87040]/8 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            Coming Soon
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Choé Auto
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            The first AI that lives in your car and handles commerce while you drive.
            CarPlay &amp; Android Auto integration.
          </p>
        </div>

        {/* Cross-Device Flow - Dashboard style */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-10">
          {devices.map((device, index) => (
            <div
              key={device.label}
              className="relative group choe-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-[#333] hover:border-[#e87040]/40 transition-all text-center">
                <device.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#e87040] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                  {device.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[#666]">
                  {device.description}
                </p>
              </div>

              {/* Connection line */}
              {index < devices.length - 1 && (
                <div className="absolute top-1/2 -right-1.5 sm:-right-2.5 w-3 sm:w-5 h-0.5 bg-gradient-to-r from-[#e87040] to-[#ff7f50] hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Voice Commands - Car dashboard aesthetic */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-200 dark:border-[#333] mb-8">
          {/* Dashboard header */}
          <div className="bg-gradient-to-r from-gray-100 dark:from-[#252525] to-white dark:to-[#1a1a1a] px-5 py-4 border-b border-gray-200 dark:border-[#333] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e87040]/15 flex items-center justify-center">
              <IoMicOutline className="w-5 h-5 text-[#e87040]" />
            </div>
            <div>
              <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-base">Voice Commands While Driving</span>
              <p className="text-xs text-gray-500 dark:text-[#666]">Hands-free booking experience</p>
            </div>
          </div>

          {/* Commands list */}
          <div className="p-5 sm:p-6 space-y-4">
            {voiceCommands.map((item, index) => (
              <div key={index} className="flex items-start gap-4 choe-animate-in" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e87040]/10 flex items-center justify-center">
                    <IoVolumeHighOutline className="w-4 h-4 text-[#e87040]" />
                  </div>
                </div>
                <div className="flex-1">
                  <code className="text-gray-900 dark:text-white font-mono text-sm block mb-1">{item.command}</code>
                  <p className="text-gray-500 dark:text-[#666] text-xs">{item.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-5 border border-[#27ca3f]/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#27ca3f]/15 flex items-center justify-center flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-[#27ca3f]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Safety First</h3>
              <p className="text-sm text-gray-600 dark:text-[#a8a8a8]">
                While driving, Choé is <span className="text-[#27ca3f] font-medium">voice-only</span>. No visual browsing. No scrolling.
                Full browsing with photos and comparisons is for when you&apos;re parked.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            'Same cart across all devices',
            'Voice confirmation for bookings',
            'Real-time price updates',
            'Traffic-aware suggestions',
            'Apple CarPlay ready',
            'Android Auto ready'
          ].map((feature, index) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#a8a8a8]">
              <IoCheckmarkCircle className="w-4 h-4 text-[#e87040] flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
