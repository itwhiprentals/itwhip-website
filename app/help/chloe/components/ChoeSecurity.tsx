// app/help/chloe/components/ChoeSecurity.tsx
'use client'

import {
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoFingerPrintOutline,
  IoEyeOffOutline,
  IoServerOutline,
  IoCheckmarkCircle,
  IoBanOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'

const securityLayers = [
  {
    icon: IoBanOutline,
    title: 'Bot Detection',
    description: '1000+ bot signatures blocked automatically'
  },
  {
    icon: IoSpeedometerOutline,
    title: 'Rate Limiting',
    description: 'Prevents abuse with smart request throttling'
  },
  {
    icon: IoFingerPrintOutline,
    title: 'Prompt Injection Protection',
    description: '11+ attack patterns detected and blocked'
  },
  {
    icon: IoLockClosedOutline,
    title: 'End-to-End Encryption',
    description: 'All conversations encrypted in transit and at rest'
  }
]

const privacyPoints = [
  'Conversations are NOT sold to third parties',
  'Data used only to improve your experience',
  'Request deletion anytime via support',
  'No training on your personal data without consent'
]

export function ChoeSecurity() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Steel vault aesthetic - subtle metallic sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#1a1a1a]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gray-300/30 dark:bg-[#333]/20 rounded-full blur-[100px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] mb-4">
            <IoShieldCheckmarkOutline className="w-8 h-8 text-[#e87040]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Privacy &amp; Security
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            7-layer security system protects every conversation
          </p>
        </div>

        {/* Security layers - steel card style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {securityLayers.map((layer, index) => (
            <div
              key={layer.title}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-5 border border-gray-300 dark:border-[#333] hover:border-gray-400 dark:hover:border-[#666] transition-all choe-animate-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 dark:from-[#333] to-gray-100 dark:to-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-300 dark:border-[#444] group-hover:border-gray-400 dark:group-hover:border-[#666] transition-colors">
                  <layer.icon className="w-6 h-6 text-gray-500 dark:text-[#a8a8a8] group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {layer.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[#666]">
                    {layer.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Card - vault door aesthetic */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 sm:p-8 border border-gray-300 dark:border-[#333] relative overflow-hidden mb-8">
          {/* Subtle vault pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 border border-gray-300 dark:border-[#333] rounded-full opacity-20" style={{ transform: 'translate(50%, -50%)' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#e87040]/10 rounded-lg flex items-center justify-center">
                <IoEyeOffOutline className="w-5 h-5 text-[#e87040]" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Your Privacy Matters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {privacyPoints.map((point, index) => (
                <div key={point} className="flex items-start gap-3 choe-animate-in" style={{ animationDelay: `${(index + 4) * 80}ms` }}>
                  <IoCheckmarkCircle className="w-5 h-5 text-[#27ca3f] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-[#a8a8a8]">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure Note */}
        <div className="flex items-start gap-4 p-5 bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-300 dark:border-[#333]">
          <div className="w-10 h-10 bg-gray-100 dark:bg-[#252525] rounded-lg flex items-center justify-center flex-shrink-0">
            <IoServerOutline className="w-5 h-5 text-gray-500 dark:text-[#666]" />
          </div>
          <p className="text-sm text-gray-500 dark:text-[#666]">
            Choé runs on secure cloud infrastructure with automatic backups, redundancy, and 24/7 monitoring.
            Powered by industry-standard security practices.
          </p>
        </div>
      </div>
    </section>
  )
}
