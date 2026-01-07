// app/rideshare/components/PartnerBenefits.tsx
// "Why Book With Us" benefits section

'use client'

import {
  IoCarSportOutline,
  IoLeafOutline,
  IoConstructOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoHeadsetOutline
} from 'react-icons/io5'

interface Benefit {
  icon: string
  title: string
  description: string
}

interface PartnerBenefitsProps {
  benefits?: Benefit[] | null
  companyName?: string
}

// Icon mapping for default benefits
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'car': IoCarSportOutline,
  'fuel': IoLeafOutline,
  'maintenance': IoConstructOutline,
  'calendar': IoCalendarOutline,
  'insurance': IoShieldCheckmarkOutline,
  'support': IoHeadsetOutline
}

// Default benefits if partner hasn't set custom ones
const DEFAULT_BENEFITS = [
  {
    iconKey: 'car',
    title: 'Rideshare-Ready Vehicles',
    description: 'All vehicles pre-approved for Uber, Lyft, DoorDash, and Instacart'
  },
  {
    iconKey: 'fuel',
    title: '40-50+ MPG Fuel Efficiency',
    description: 'Maximize your earnings with our hybrid and efficient fleet'
  },
  {
    iconKey: 'maintenance',
    title: 'Maintenance Included',
    description: 'All maintenance and repairs covered in your weekly rate'
  },
  {
    iconKey: 'calendar',
    title: 'Flexible Rental Terms',
    description: 'Weekly, monthly, or custom rental periods available'
  },
  {
    iconKey: 'insurance',
    title: 'Insurance Included',
    description: 'Comprehensive coverage for rideshare and delivery work'
  },
  {
    iconKey: 'support',
    title: '24/7 Support',
    description: 'Help is always available when you need it most'
  }
]

export default function PartnerBenefits({ benefits, companyName = 'Us' }: PartnerBenefitsProps) {
  // Use custom benefits if provided, otherwise defaults
  const useCustomBenefits = benefits && benefits.length > 0

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Why Book With {companyName}?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
        Join thousands of drivers who trust us for their rideshare rental needs
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCustomBenefits ? (
          // Custom benefits from partner (may have emojis)
          benefits!.map((benefit, index) => (
            <div
              key={index}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))
        ) : (
          // Default benefits with icons
          DEFAULT_BENEFITS.map((benefit, index) => {
            const IconComponent = ICON_MAP[benefit.iconKey] || IoCarSportOutline
            return (
              <div
                key={index}
                className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                  <IconComponent className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
