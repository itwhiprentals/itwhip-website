// app/rentals-sections/BenefitsSection.tsx
'use client'

import {
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoCashOutline
} from 'react-icons/io5'

const benefits = [
  {
    icon: IoShieldCheckmarkOutline,
    title: '$1M Protection Included',
    description: 'Every trip backed by comprehensive liability coverage',
    stat: 'Fully insured'
  },
  {
    icon: IoDocumentTextOutline,
    title: 'Fast Claims Processing',
    description: 'Digital claim submission with quick resolution',
    stat: 'Under 7-day turnaround'
  },
  {
    icon: IoSpeedometerOutline,
    title: 'Mileage Forensics™',
    description: 'GPS-verified trips protect hosts and guests',
    stat: 'Fraud prevention'
  },
  {
    icon: IoLeafOutline,
    title: 'ESG Impact Tracking',
    description: 'See your environmental impact with every rental',
    stat: 'Sustainability scores'
  },
  {
    icon: IoPersonOutline,
    title: 'Verified Local Hosts',
    description: 'Every host is background checked and verified',
    stat: 'Trusted community'
  },
  {
    icon: IoCashOutline,
    title: 'Flexible Host Earnings',
    description: 'Choose your insurance tier, control your income',
    stat: 'Keep 40-90%'
  }
]

export default function BenefitsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Phoenix • Scottsdale • Tempe • Mesa • Chandler
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-2 sm:mb-4">
            Why Rent with ITWhip
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Peer-to-peer car sharing with built-in protection and verified hosts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {benefit.title}
                      </h3>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {benefit.stat}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}