// app/(guest)/rentals/components/booking/PriceBreakdown.tsx
'use client'

import { useState } from 'react'
import { 
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoAddCircleOutline,
  IoReceiptOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'
import type { PricingCalculation } from '@/app/types/rental'

interface PriceBreakdownProps {
  pricing: PricingCalculation
  numberOfDays: number
  extras?: string[]
  insurance?: 'none' | 'basic' | 'premium'
  deliveryFee?: number
  className?: string
}

interface FeeTooltip {
  title: string
  description: string
}

const FEE_TOOLTIPS: Record<string, FeeTooltip> = {
  serviceFee: {
    title: 'Service Fee',
    description: 'This fee helps us provide 24/7 customer support, secure payments, and maintain the platform.'
  },
  taxes: {
    title: 'Taxes & Fees',
    description: 'Includes applicable state and local taxes based on your rental location.'
  },
  insurance: {
    title: 'Insurance Protection',
    description: 'Covers damage to the vehicle with the deductible amount shown. Decline at your own risk.'
  },
  youngDriver: {
    title: 'Young Driver Fee',
    description: 'Additional fee for drivers under 25 due to increased insurance costs.'
  },
  delivery: {
    title: 'Delivery Fee',
    description: 'Covers the cost of delivering the vehicle to your specified location and pickup after your rental.'
  },
  deposit: {
    title: 'Security Deposit',
    description: 'Refundable deposit held on your card. Released within 3-5 business days after successful return.'
  }
}

const EXTRA_DETAILS: Record<string, { name: string; price: number; icon: React.ReactNode }> = {
  gps: { name: 'GPS Navigation', price: 10, icon: <IoLocationOutline className="w-4 h-4" /> },
  child_seat: { name: 'Child Seat', price: 15, icon: <IoCarOutline className="w-4 h-4" /> },
  toll_pass: { name: 'Toll Pass', price: 20, icon: <IoReceiptOutline className="w-4 h-4" /> },
  fuel: { name: 'Prepaid Fuel', price: 45, icon: <IoCarOutline className="w-4 h-4" /> }
}

export default function PriceBreakdown({
  pricing,
  numberOfDays,
  extras = [],
  insurance = 'basic',
  deliveryFee = 0,
  className = ''
}: PriceBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Calculate insurance cost
  const insuranceCosts = {
    none: 0,
    basic: 25 * numberOfDays,
    premium: 45 * numberOfDays
  }
  const insuranceCost = insuranceCosts[insurance]

  // Calculate extras cost
  const extrasCost = extras.reduce((total, extra) => {
    const extraDetail = EXTRA_DETAILS[extra]
    return total + (extraDetail ? extraDetail.price * numberOfDays : 0)
  }, 0)

  // Calculate young driver fee if applicable
  const youngDriverFee = pricing.breakdown?.youngDriverFee || 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Price Breakdown
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center text-sm text-amber-600 hover:text-amber-700"
        >
          {showDetails ? 'Hide' : 'Show'} details
          {showDetails ? (
            <IoChevronUpOutline className="w-4 h-4 ml-1" />
          ) : (
            <IoChevronDownOutline className="w-4 h-4 ml-1" />
          )}
        </button>
      </div>

      {/* Basic Summary */}
      <div className="space-y-3">
        {/* Daily Rate */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <IoCarOutline className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">
              Daily rate × {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            ${pricing.subtotal.toFixed(2)}
          </span>
        </div>

        {/* Discount if applicable */}
        {pricing.discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <div className="flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              <span>
                {numberOfDays >= 28 ? 'Monthly' : numberOfDays >= 7 ? 'Weekly' : 'Multi-day'} discount
              </span>
            </div>
            <span className="font-medium">
              -${pricing.discount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Detailed breakdown when expanded */}
        {showDetails && (
          <div className="pt-3 mt-3 border-t dark:border-gray-700 space-y-3">
            {/* Insurance */}
            {insurance !== 'none' && (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-500 mr-2" />
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {insurance === 'basic' ? 'Basic' : 'Premium'} Insurance
                    </span>
                    <button
                      onMouseEnter={() => setActiveTooltip('insurance')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="ml-1 relative"
                    >
                      <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
                      {activeTooltip === 'insurance' && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                          <div className="font-semibold mb-1">
                            {FEE_TOOLTIPS.insurance.title}
                          </div>
                          <div>{FEE_TOOLTIPS.insurance.description}</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ${insuranceCost.toFixed(2)}
                </span>
              </div>
            )}

            {/* Extras */}
            {extras.length > 0 && extras.map((extra) => {
              const extraDetail = EXTRA_DETAILS[extra]
              if (!extraDetail) return null
              
              return (
                <div key={extra} className="flex justify-between items-center">
                  <div className="flex items-center">
                    {extraDetail.icon}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {extraDetail.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ${(extraDetail.price * numberOfDays).toFixed(2)}
                  </span>
                </div>
              )
            })}

            {/* Delivery Fee */}
            {deliveryFee > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <IoLocationOutline className="w-5 h-5 text-purple-500 mr-2" />
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Delivery to your location
                    </span>
                    <button
                      onMouseEnter={() => setActiveTooltip('delivery')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="ml-1 relative"
                    >
                      <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
                      {activeTooltip === 'delivery' && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                          <div className="font-semibold mb-1">
                            {FEE_TOOLTIPS.delivery.title}
                          </div>
                          <div>{FEE_TOOLTIPS.delivery.description}</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
            )}

            {/* Young Driver Fee */}
            {youngDriverFee > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <IoAddCircleOutline className="w-5 h-5 text-orange-500 mr-2" />
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Young driver fee
                    </span>
                    <button
                      onMouseEnter={() => setActiveTooltip('youngDriver')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="ml-1 relative"
                    >
                      <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
                      {activeTooltip === 'youngDriver' && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                          <div className="font-semibold mb-1">
                            {FEE_TOOLTIPS.youngDriver.title}
                          </div>
                          <div>{FEE_TOOLTIPS.youngDriver.description}</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ${youngDriverFee.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Service Fee */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-400">Service fee</span>
            <button
              onMouseEnter={() => setActiveTooltip('serviceFee')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="ml-1 relative"
            >
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
              {activeTooltip === 'serviceFee' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <div className="font-semibold mb-1">
                    {FEE_TOOLTIPS.serviceFee.title}
                  </div>
                  <div>{FEE_TOOLTIPS.serviceFee.description}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              )}
            </button>
          </div>
          <span className="text-gray-700 dark:text-gray-300">
            ${pricing.serviceFee.toFixed(2)}
          </span>
        </div>

        {/* Taxes */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-400">Taxes</span>
            <button
              onMouseEnter={() => setActiveTooltip('taxes')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="ml-1 relative"
            >
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
              {activeTooltip === 'taxes' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <div className="font-semibold mb-1">
                    {FEE_TOOLTIPS.taxes.title}
                  </div>
                  <div>{FEE_TOOLTIPS.taxes.description}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              )}
            </button>
          </div>
          <span className="text-gray-700 dark:text-gray-300">
            ${pricing.taxes.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              ${(pricing.total + insuranceCost + extrasCost + deliveryFee).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ${((pricing.total + insuranceCost + extrasCost + deliveryFee) / numberOfDays).toFixed(2)}/day
            </div>
          </div>
        </div>
      </div>

      {/* Security Deposit Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              Security Deposit
            </div>
            <div className="text-blue-800 dark:text-blue-400">
              A refundable deposit of <span className="font-semibold">$500</span> will be held on your card 
              and released within 3-5 business days after successful vehicle return.
            </div>
          </div>
        </div>
      </div>

      {/* What's Included */}
      {showDetails && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-green-900 dark:text-green-300 mb-2">
              What's Included:
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>24/7 roadside assistance</span>
              </div>
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{numberOfDays * 200} miles included ({200 * numberOfDays / numberOfDays}/day)</span>
              </div>
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Basic cleaning fee</span>
              </div>
              {insurance !== 'none' && (
                <div className="flex items-center text-green-800 dark:text-green-400">
                  <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    {insurance === 'basic' ? '$1000' : '$0'} deductible insurance
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified version for sidebar
export function PriceBreakdownSimple({
  pricing,
  numberOfDays,
  className = ''
}: {
  pricing: PricingCalculation
  numberOfDays: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          ${(pricing.subtotal / numberOfDays).toFixed(0)} × {numberOfDays} days
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          ${pricing.subtotal.toFixed(2)}
        </span>
      </div>
      
      {pricing.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-${pricing.discount.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Service fee</span>
        <span className="text-gray-700 dark:text-gray-300">
          ${pricing.serviceFee.toFixed(2)}
        </span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Taxes</span>
        <span className="text-gray-700 dark:text-gray-300">
          ${pricing.taxes.toFixed(2)}
        </span>
      </div>
      
      <div className="pt-2 border-t dark:border-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-amber-600">
            ${pricing.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}