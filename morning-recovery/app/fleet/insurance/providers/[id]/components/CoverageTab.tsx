// app/fleet/insurance/providers/[id]/components/CoverageTab.tsx
'use client'

import { useState } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoCarOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoLayersOutline
} from 'react-icons/io5'

interface Provider {
  id: string
  name: string
  type: string
  revenueShare: number
  vehicleValueMin: number | null
  vehicleValueMax: number | null
  excludedMakes: string[]
  excludedModels: string[]
  coverageTiers: any
  pricingRules: any
}

interface CoverageTabProps {
  provider: Provider
}

export default function CoverageTab({ provider }: CoverageTabProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Parse coverage tiers
  const tiers = provider.coverageTiers || {}
  const tierKeys = Object.keys(tiers)

  // Parse pricing rules
  const pricing = provider.pricingRules || {}
  const priceRanges = Object.keys(pricing)

  const getTierColor = (tierName: string) => {
    switch (tierName.toUpperCase()) {
      case 'MINIMUM':
        return 'border-gray-400 bg-gray-50 dark:bg-gray-900/50'
      case 'BASIC':
        return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'PREMIUM':
        return 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
      case 'LUXURY':
        return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
      default:
        return 'border-gray-400 bg-gray-50 dark:bg-gray-900/50'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPriceRange = (key: string) => {
    switch (key) {
      case 'under25k':
        return 'Under $25,000'
      case '25to50k':
        return '$25,000 - $50,000'
      case '50to100k':
        return '$50,000 - $100,000'
      case 'over100k':
        return 'Over $100,000'
      default:
        return key
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Coverage Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <IoShieldCheckmarkOutline className="w-5 h-5 mr-2" />
          Coverage Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Provider Type</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {provider.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Revenue Share</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(provider.revenueShare * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coverage Tiers</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tierKeys.length} tier{tierKeys.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Eligibility Rules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <IoCarOutline className="w-5 h-5 mr-2" />
          Vehicle Eligibility Rules
        </h2>

        <div className="space-y-6">
          {/* Vehicle Value Range */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Vehicle Value Range
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {provider.vehicleValueMin !== null 
                    ? formatCurrency(provider.vehicleValueMin)
                    : 'No minimum'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {provider.vehicleValueMax !== null 
                    ? formatCurrency(provider.vehicleValueMax)
                    : 'No maximum'}
                </p>
              </div>
            </div>
          </div>

          {/* Excluded Makes */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <IoCloseCircleOutline className="w-5 h-5 mr-2 text-red-600" />
              Excluded Makes
            </h3>
            {provider.excludedMakes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {provider.excludedMakes.map((make) => (
                  <span
                    key={make}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium rounded-full"
                  >
                    {make}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <span>No makes excluded - All manufacturers accepted</span>
              </div>
            )}
          </div>

          {/* Excluded Models */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <IoCloseCircleOutline className="w-5 h-5 mr-2 text-red-600" />
              Excluded Models
            </h3>
            {provider.excludedModels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {provider.excludedModels.map((model) => (
                  <span
                    key={model}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium rounded-full"
                  >
                    {model}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <span>No models excluded - All vehicle models accepted</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coverage Tiers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoLayersOutline className="w-5 h-5 mr-2" />
            Coverage Tiers
          </h2>
        </div>

        {tierKeys.length === 0 ? (
          <div className="p-12 text-center">
            <IoWarningOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Coverage Tiers Configured
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configure coverage tiers in the Settings tab to define insurance levels.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {tierKeys.map((tierName) => {
              const tier = tiers[tierName]
              const isSelected = selectedTier === tierName

              return (
                <div
                  key={tierName}
                  onClick={() => setSelectedTier(isSelected ? null : tierName)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    getTierColor(tierName)
                  } ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
                      {tierName}
                    </h3>
                    {isSelected && (
                      <IoCheckmarkCircleOutline className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  {tier.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {tier.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {tier.liability && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Liability Coverage</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {typeof tier.liability === 'number' 
                            ? formatCurrency(tier.liability)
                            : tier.liability}
                        </span>
                      </div>
                    )}

                    {tier.collision !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Collision Coverage</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tier.collision === 0 
                            ? 'Not Covered'
                            : typeof tier.collision === 'string'
                            ? tier.collision.replace(/_/g, ' ')
                            : formatCurrency(tier.collision)}
                        </span>
                      </div>
                    )}

                    {tier.deductible !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Deductible</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tier.deductible === 0 ? '$0' : formatCurrency(tier.deductible)}
                        </span>
                      </div>
                    )}

                    {tier.comprehensiveCoverage !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Comprehensive</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tier.comprehensiveCoverage ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pricing Rules */}
      {priceRanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <IoCashOutline className="w-5 h-5 mr-2" />
              Pricing Rules (Daily Rates)
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Vehicle Value
                    </th>
                    {tierKeys.map((tier) => (
                      <th key={tier} className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {priceRanges.map((range) => (
                    <tr key={range}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        {formatPriceRange(range)}
                      </td>
                      {tierKeys.map((tier) => {
                        const price = pricing[range]?.[tier]
                        return (
                          <td key={tier} className="text-right py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {price !== undefined && price !== null
                              ? `$${price}/day`
                              : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Pricing is calculated per day based on the vehicle's market value and selected coverage tier. 
                    Final rates may include additional fees and taxes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Notes */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Coverage Configuration Notes
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Coverage tiers determine the level of protection for both host and guest</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Vehicle value ranges affect daily insurance premiums</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Excluded makes/models cannot be insured under this provider</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Revenue share determines host payout percentage on approved claims</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Modify these settings in the Settings tab (requires admin access)</span>
          </li>
        </ul>
      </div>

    </div>
  )
}