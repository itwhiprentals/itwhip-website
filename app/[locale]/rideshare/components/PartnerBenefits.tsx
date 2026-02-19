// app/rideshare/components/PartnerBenefits.tsx
// "Why Book With Us" benefits section

'use client'

import { useState } from 'react'
import {
  IoCarSportOutline,
  IoLeafOutline,
  IoConstructOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoHeadsetOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoHomeOutline,
  IoCashOutline,
  IoInfiniteOutline
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

// Icon mapping for benefits (supports both default and custom partner benefits)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'car': IoCarSportOutline,
  'fuel': IoLeafOutline,
  'maintenance': IoConstructOutline,
  'calendar': IoCalendarOutline,
  'insurance': IoShieldCheckmarkOutline,
  'support': IoHeadsetOutline,
  'checkmark': IoCheckmarkCircleOutline,
  'trending': IoTrendingUpOutline,
  'home': IoHomeOutline,
  'cash': IoCashOutline,
  'infinite': IoInfiniteOutline
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Use custom benefits if provided, otherwise defaults
  const useCustomBenefits = benefits && benefits.length > 0

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Why Book With {companyName}?
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          — Trusted by thousands of drivers
        </span>
      </div>

      {/* Compact 2-row grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {useCustomBenefits ? (
          // Custom benefits from partner (uses icon keys or displays text/emoji)
          benefits!.map((benefit, index) => {
            const IconComponent = ICON_MAP[benefit.icon]
            return (
              <div
                key={index}
                onClick={() => toggleExpand(index)}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
              >
                {IconComponent ? (
                  <IconComponent className="text-lg text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="text-lg flex-shrink-0 mt-0.5">{benefit.icon}</span>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {benefit.title}
                  </h3>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${expandedIndex === index ? '' : 'line-clamp-2'}`}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          // Default benefits with icons
          DEFAULT_BENEFITS.map((benefit, index) => {
            const IconComponent = ICON_MAP[benefit.iconKey] || IoCarSportOutline
            return (
              <div
                key={index}
                onClick={() => toggleExpand(index)}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {benefit.title}
                  </h3>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${expandedIndex === index ? '' : 'line-clamp-2'}`}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
