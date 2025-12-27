// app/rideshare/components/PartnerBenefits.tsx
// "Why Book With Us" benefits section

'use client'

interface Benefit {
  icon: string
  title: string
  description: string
}

interface PartnerBenefitsProps {
  benefits?: Benefit[] | null
  companyName?: string
}

// Default benefits if partner hasn't set custom ones
const DEFAULT_BENEFITS: Benefit[] = [
  {
    icon: '🚗',
    title: 'Rideshare-Ready Vehicles',
    description: 'All vehicles pre-approved for Uber, Lyft, DoorDash, and Instacart'
  },
  {
    icon: '⛽',
    title: '40-50+ MPG Fuel Efficiency',
    description: 'Maximize your earnings with our hybrid and efficient fleet'
  },
  {
    icon: '🔧',
    title: 'Maintenance Included',
    description: 'All maintenance and repairs covered in your weekly rate'
  },
  {
    icon: '📅',
    title: 'Flexible Rental Terms',
    description: 'Weekly, monthly, or custom rental periods available'
  },
  {
    icon: '🛡️',
    title: 'Insurance Included',
    description: 'Comprehensive coverage for rideshare and delivery work'
  },
  {
    icon: '🎧',
    title: '24/7 Support',
    description: 'Help is always available when you need it most'
  }
]

export default function PartnerBenefits({ benefits, companyName = 'Us' }: PartnerBenefitsProps) {
  // Use custom benefits if provided, otherwise defaults
  const displayBenefits = (benefits && benefits.length > 0) ? benefits : DEFAULT_BENEFITS

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Why Book With {companyName}?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
        Join thousands of drivers who trust us for their rideshare rental needs
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBenefits.map((benefit, index) => (
          <div
            key={index}
            className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Icon with glow on hover */}
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {benefit.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
