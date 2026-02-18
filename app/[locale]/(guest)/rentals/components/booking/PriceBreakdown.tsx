// app/(guest)/rentals/components/booking/PriceBreakdown.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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

const EXTRA_ICONS: Record<string, React.ReactNode> = {
  gps: <IoLocationOutline className="w-4 h-4" />,
  child_seat: <IoCarOutline className="w-4 h-4" />,
  toll_pass: <IoReceiptOutline className="w-4 h-4" />,
  fuel: <IoCarOutline className="w-4 h-4" />
}

const EXTRA_PRICES: Record<string, number> = {
  gps: 10,
  child_seat: 15,
  toll_pass: 20,
  fuel: 45
}

export default function PriceBreakdown({
  pricing,
  numberOfDays,
  extras = [],
  insurance = 'basic',
  deliveryFee = 0,
  className = ''
}: PriceBreakdownProps) {
  const t = useTranslations('PriceBreakdown')
  const [showDetails, setShowDetails] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const extraNames: Record<string, string> = {
    gps: t('gpsNavigation'),
    child_seat: t('childSeat'),
    toll_pass: t('tollPass'),
    fuel: t('prepaidFuel')
  }

  // Resolve pricing fields with fallbacks for optional convenience aliases
  const pricingSubtotal = pricing.subtotal ?? pricing.basePrice ?? 0
  const pricingDiscount = pricing.discount ?? 0
  const pricingServiceFee = pricing.serviceFee ?? pricing.serviceFeeAmount ?? 0
  const pricingTaxes = pricing.taxes ?? pricing.taxAmount ?? 0
  const pricingTotal = pricing.total ?? pricing.totalAmount ?? 0

  // Calculate insurance cost
  const insuranceCosts = {
    none: 0,
    basic: 25 * numberOfDays,
    premium: 45 * numberOfDays
  }
  const insuranceCost = insuranceCosts[insurance]

  // Calculate extras cost
  const extrasCost = extras.reduce((total, extra) => {
    const price = EXTRA_PRICES[extra]
    return total + (price ? price * numberOfDays : 0)
  }, 0)

  // Calculate young driver fee if applicable
  const youngDriverFee = pricing.breakdown?.youngDriverFee || 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('priceBreakdown')}
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center text-sm text-amber-600 hover:text-amber-700"
        >
          {showDetails ? t('hideDetails') : t('showDetails')}
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
              {t('dailyRate', { count: numberOfDays })}
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            ${pricingSubtotal.toFixed(2)}
          </span>
        </div>

        {/* Discount if applicable */}
        {pricingDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <div className="flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              <span>
                {numberOfDays >= 28
                  ? t('monthlyDiscount')
                  : numberOfDays >= 7
                  ? t('weeklyDiscount')
                  : t('multiDayDiscount')}
              </span>
            </div>
            <span className="font-medium">
              -${pricingDiscount.toFixed(2)}
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
                      {insurance === 'basic' ? t('basicInsurance') : t('premiumInsurance')}
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
                            {t('insuranceTooltipTitle')}
                          </div>
                          <div>{t('insuranceTooltipDesc')}</div>
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
              const price = EXTRA_PRICES[extra]
              if (!price) return null

              return (
                <div key={extra} className="flex justify-between items-center">
                  <div className="flex items-center">
                    {EXTRA_ICONS[extra]}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {extraNames[extra] || extra}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ${(price * numberOfDays).toFixed(2)}
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
                      {t('deliveryToLocation')}
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
                            {t('deliveryTooltipTitle')}
                          </div>
                          <div>{t('deliveryTooltipDesc')}</div>
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
                      {t('youngDriverFee')}
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
                            {t('youngDriverTooltipTitle')}
                          </div>
                          <div>{t('youngDriverTooltipDesc')}</div>
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
            <span className="text-gray-600 dark:text-gray-400">{t('serviceFee')}</span>
            <button
              onMouseEnter={() => setActiveTooltip('serviceFee')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="ml-1 relative"
            >
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
              {activeTooltip === 'serviceFee' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <div className="font-semibold mb-1">
                    {t('serviceFeeTooltipTitle')}
                  </div>
                  <div>{t('serviceFeeTooltipDesc')}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              )}
            </button>
          </div>
          <span className="text-gray-700 dark:text-gray-300">
            ${pricingServiceFee.toFixed(2)}
          </span>
        </div>

        {/* Taxes */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-400">{t('taxes')}</span>
            <button
              onMouseEnter={() => setActiveTooltip('taxes')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="ml-1 relative"
            >
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
              {activeTooltip === 'taxes' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <div className="font-semibold mb-1">
                    {t('taxesTooltipTitle')}
                  </div>
                  <div>{t('taxesTooltipDesc')}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              )}
            </button>
          </div>
          <span className="text-gray-700 dark:text-gray-300">
            ${pricingTaxes.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('total')}
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              ${(pricingTotal + insuranceCost + extrasCost + deliveryFee).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('perDay', { amount: `$${((pricingTotal + insuranceCost + extrasCost + deliveryFee) / numberOfDays).toFixed(2)}` })}
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
              {t('securityDeposit')}
            </div>
            <div className="text-blue-800 dark:text-blue-400">
              {t('securityDepositDesc', { amount: '$500' })}
            </div>
          </div>
        </div>
      </div>

      {/* What's Included */}
      {showDetails && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-green-900 dark:text-green-300 mb-2">
              {t('whatsIncluded')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{t('roadsideAssistance')}</span>
              </div>
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{t('milesIncluded', { total: numberOfDays * 200, perDay: 200 })}</span>
              </div>
              <div className="flex items-center text-green-800 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{t('basicCleaningFee')}</span>
              </div>
              {insurance !== 'none' && (
                <div className="flex items-center text-green-800 dark:text-green-400">
                  <IoCheckmarkCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    {t('deductibleInsurance', { amount: insurance === 'basic' ? '$1000' : '$0' })}
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
  const t = useTranslations('PriceBreakdown')
  const simpleSubtotal = pricing.subtotal ?? pricing.basePrice ?? 0
  const simpleDiscount = pricing.discount ?? 0
  const simpleServiceFee = pricing.serviceFee ?? pricing.serviceFeeAmount ?? 0
  const simpleTaxes = pricing.taxes ?? pricing.taxAmount ?? 0
  const simpleTotal = pricing.total ?? pricing.totalAmount ?? 0

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {t('rateTimesDays', { rate: (simpleSubtotal / numberOfDays).toFixed(0), count: numberOfDays })}
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          ${simpleSubtotal.toFixed(2)}
        </span>
      </div>

      {simpleDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>{t('discount')}</span>
          <span>-${simpleDiscount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{t('serviceFee')}</span>
        <span className="text-gray-700 dark:text-gray-300">
          ${simpleServiceFee.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{t('taxes')}</span>
        <span className="text-gray-700 dark:text-gray-300">
          ${simpleTaxes.toFixed(2)}
        </span>
      </div>

      <div className="pt-2 border-t dark:border-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold">{t('total')}</span>
          <span className="font-bold text-amber-600">
            ${simpleTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}