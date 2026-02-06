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
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <IoShieldCheckmarkOutline className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 dark:text-violet-400" />
            Privacy &amp; Security
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            7-layer security system protects every conversation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {securityLayers.map((layer) => (
            <div
              key={layer.title}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <layer.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {layer.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {layer.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Card */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-5 sm:p-6 border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-4">
            <IoEyeOffOutline className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-violet-900 dark:text-violet-100">Your Privacy Matters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {privacyPoints.map((point) => (
              <div key={point} className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-violet-800 dark:text-violet-200">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <IoServerOutline className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Choé runs on secure cloud infrastructure with automatic backups, redundancy, and 24/7 monitoring.
            Powered by industry-standard security practices.
          </p>
        </div>
      </div>
    </section>
  )
}
