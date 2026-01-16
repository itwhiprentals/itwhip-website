// app/partner/dashboard/components/tracking/ProviderSelector.tsx
// Provider selection component for tracking demo mode
// Horizontal checkbox list with provider names and pricing

'use client'

import { useMemo } from 'react'
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5'
import type { ProviderId, ProviderSelectorProps } from '@/app/partner/tracking/shared/types'
import { PROVIDER_CAPABILITIES, formatProviderPrice } from '@/app/partner/tracking/shared/providers'

// Provider logo/icon colors for visual distinction
const PROVIDER_COLORS: Record<ProviderId, string> = {
  bouncie: 'from-emerald-500 to-green-600',
  smartcar: 'from-blue-500 to-indigo-600',
  zubie: 'from-orange-500 to-amber-600',
  moovetrax: 'from-red-500 to-rose-600',
  trackimo: 'from-purple-500 to-violet-600'
}

export default function ProviderSelector({
  selectedProviders,
  onSelectionChange,
  showPricing = true,
  className = ''
}: ProviderSelectorProps) {
  // Calculate combined coverage when providers are selected
  const coverageInfo = useMemo(() => {
    if (selectedProviders.length === 0) {
      return { count: 0, total: 8, percentage: 0 }
    }

    const allFeatures = new Set<string>()
    selectedProviders.forEach(providerId => {
      const provider = PROVIDER_CAPABILITIES.find(p => p.id === providerId)
      if (provider) {
        Object.entries(provider.features).forEach(([feature, available]) => {
          if (available) allFeatures.add(feature)
        })
      }
    })

    return {
      count: allFeatures.size,
      total: 8,
      percentage: Math.round((allFeatures.size / 8) * 100)
    }
  }, [selectedProviders])

  const handleToggle = (providerId: ProviderId) => {
    if (selectedProviders.includes(providerId)) {
      onSelectionChange(selectedProviders.filter(id => id !== providerId))
    } else {
      onSelectionChange([...selectedProviders, providerId])
    }
  }

  return (
    <div className={className}>
      {/* Provider Selection Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          Select Providers to Compare
        </span>
        {selectedProviders.length > 0 && (
          <span className="text-xs text-gray-500">
            <span className="text-green-400 font-medium">{coverageInfo.count}</span>
            <span className="text-gray-600">/</span>
            <span>{coverageInfo.total}</span>
            <span className="text-gray-600 ml-1">features</span>
          </span>
        )}
      </div>

      {/* Provider Checkboxes - Responsive Grid */}
      <div className="flex flex-wrap gap-2">
        {PROVIDER_CAPABILITIES.map((provider) => {
          const isSelected = selectedProviders.includes(provider.id)
          const gradientColor = PROVIDER_COLORS[provider.id]

          return (
            <button
              key={provider.id}
              onClick={() => handleToggle(provider.id)}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-lg
                border transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'bg-gray-800 border-gray-600 shadow-md'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                }
              `}
            >
              {/* Checkbox Icon */}
              <div className={`
                flex items-center justify-center w-5 h-5 rounded-md
                transition-all duration-200
                ${isSelected
                  ? `bg-gradient-to-br ${gradientColor}`
                  : 'bg-gray-800 border border-gray-700'
                }
              `}>
                {isSelected ? (
                  <IoCheckmarkCircle className="w-4 h-4 text-white" />
                ) : (
                  <IoEllipseOutline className="w-3 h-3 text-gray-600" />
                )}
              </div>

              {/* Provider Info */}
              <div className="flex flex-col items-start">
                <span className={`
                  text-sm font-medium transition-colors
                  ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                `}>
                  {provider.name}
                </span>
                {showPricing && (
                  <span className={`
                    text-xs transition-colors
                    ${isSelected ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {formatProviderPrice(provider)}
                  </span>
                )}
              </div>

              {/* Device Type Badge */}
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded uppercase font-medium
                ${isSelected
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-800 text-gray-600'
                }
              `}>
                {provider.deviceType === 'api' ? 'API' :
                 provider.deviceType === 'obd' ? 'OBD' :
                 provider.deviceType === 'gps-tracker' ? 'GPS' : 'HYB'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Coverage Bar */}
      {selectedProviders.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full transition-all duration-500 ease-out
                  ${coverageInfo.percentage === 100
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : coverageInfo.percentage >= 75
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    : coverageInfo.percentage >= 50
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-orange-500 to-red-400'
                  }
                `}
                style={{ width: `${coverageInfo.percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 min-w-[45px] text-right">
              {coverageInfo.percentage}%
            </span>
          </div>
          {coverageInfo.percentage < 100 && (
            <p className="text-[10px] text-gray-600 mt-1.5">
              Add <span className="text-amber-400 font-medium">ITWhip+</span> to unlock all 8 features
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedProviders.length === 0 && (
        <p className="text-xs text-gray-600 mt-2 text-center">
          Select one or more providers to see available features
        </p>
      )}
    </div>
  )
}
