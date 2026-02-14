// app/rideshare/components/PartnerPolicies.tsx
// Partner policies section - Refund, Cancellation, Requirements

'use client'

import { useState } from 'react'
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRefreshOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import { useEditMode } from '../[partnerSlug]/EditModeContext'

interface PartnerPolicies {
  refundPolicy?: string
  cancellationPolicy?: string
  bookingRequirements?: string
  additionalTerms?: string
}

interface PartnerPoliciesProps {
  policies?: PartnerPolicies | null
  companyName?: string
}

// Default policies if partner hasn't set custom ones
const DEFAULT_POLICIES: PartnerPolicies = {
  refundPolicy: `Full refunds are available if you cancel your booking more than 48 hours before your scheduled pickup. Cancellations within 48 hours may be subject to a partial refund or cancellation fee based on circumstances. In case of vehicle issues or breakdown caused by no fault of the renter, we will provide a replacement vehicle or full refund for affected days.`,

  cancellationPolicy: `Free cancellation up to 48 hours before pickup. Cancellations within 24-48 hours incur a one-day fee. Cancellations within 24 hours or no-shows forfeit the full booking amount. Extensions and early returns must be communicated at least 24 hours in advance. Late returns may incur additional daily charges.`,

  bookingRequirements: `All renters must be at least 21 years old with a valid driver's license. A clean driving record is required - no DUIs, reckless driving, or major violations in the past 3 years. You must provide proof of rideshare/delivery platform approval (Uber, Lyft, DoorDash, etc.). A refundable security deposit is required at pickup. First-time renters may be subject to additional verification.`,

  additionalTerms: `Vehicles are for rideshare and delivery use only - personal use is prohibited. Smoking in vehicles is strictly prohibited and will result in a $250 cleaning fee. Pets are not allowed. The renter is responsible for any traffic violations or parking tickets incurred during the rental period. Mileage limits may apply to weekly and monthly rentals.`
}

export default function PartnerPolicies({ policies, companyName = 'Partner' }: PartnerPoliciesProps) {
  const [openSections, setOpenSections] = useState<string[]>(['refund'])
  const { isEditMode: contextEditMode, data: contextData } = useEditMode()

  // Use context data when in edit mode for real-time updates
  const effectivePolicies = contextEditMode && contextData?.policies
    ? contextData.policies
    : policies

  // Use custom policies if provided, otherwise defaults
  const displayPolicies = {
    refundPolicy: effectivePolicies?.refundPolicy || DEFAULT_POLICIES.refundPolicy,
    cancellationPolicy: effectivePolicies?.cancellationPolicy || DEFAULT_POLICIES.cancellationPolicy,
    bookingRequirements: effectivePolicies?.bookingRequirements || DEFAULT_POLICIES.bookingRequirements,
    additionalTerms: effectivePolicies?.additionalTerms || DEFAULT_POLICIES.additionalTerms
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const policyItems = [
    {
      id: 'refund',
      title: 'Refund Policy',
      icon: IoRefreshOutline,
      content: displayPolicies.refundPolicy,
      color: 'text-green-500'
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      icon: IoCloseCircleOutline,
      content: displayPolicies.cancellationPolicy,
      color: 'text-red-500'
    },
    {
      id: 'requirements',
      title: 'Booking Requirements',
      icon: IoDocumentTextOutline,
      content: displayPolicies.bookingRequirements,
      color: 'text-blue-500'
    },
    {
      id: 'terms',
      title: 'Additional Terms',
      icon: IoShieldCheckmarkOutline,
      content: displayPolicies.additionalTerms,
      color: 'text-purple-500'
    }
  ]

  return (
    <section className="py-6 sm:py-8">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Rental Policies
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          — Please review before booking
        </span>
      </div>

      <div className="space-y-3">
        {policyItems.map((item) => {
          const isOpen = openSections.includes(item.id)
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(item.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                </div>
                {isOpen ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="pl-8 text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Policy disclaimer */}
      <p className="mt-4 sm:mt-6 mb-0 text-xs text-gray-500 dark:text-gray-500 text-center">
        These policies are set by {companyName}. ItWhip acts as a marketplace and is not responsible for individual partner policies.
        Please contact the partner directly for any policy questions.
      </p>
    </section>
  )
}
