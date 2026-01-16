// app/partner/dashboard/components/tracking/ProviderFeatureMatrix.tsx
// Compact feature availability grid for tracking demo mode
// Shows which features are available based on selected providers

'use client'

import { useMemo } from 'react'
import { IoCheckmarkCircle, IoFlash, IoLockClosed } from 'react-icons/io5'
import type { ProviderId, FeatureId, FeatureMatrixProps } from '@/app/partner/tracking/shared/types'
import {
  PROVIDER_FEATURES,
  getCombinedFeatures,
  getITWhipPlusAddedFeatures,
  ITWHIP_PLUS
} from '@/app/partner/tracking/shared/providers'

// Feature status types
type FeatureStatus = 'available' | 'itwhip-plus' | 'unavailable'

interface FeatureDisplayInfo {
  id: FeatureId
  label: string
  icon: React.ComponentType<{ className?: string }>
  status: FeatureStatus
  color: string
  providers: string[]
}

export default function ProviderFeatureMatrix({
  selectedProviders,
  onFeatureClick,
  showITWhipPlus = true,
  className = ''
}: FeatureMatrixProps) {
  // Calculate feature availability
  const featureStatuses = useMemo((): FeatureDisplayInfo[] => {
    const combinedFeatures = getCombinedFeatures(selectedProviders)
    const itwhipPlusFeatures = getITWhipPlusAddedFeatures(selectedProviders)

    return PROVIDER_FEATURES.map(feature => {
      let status: FeatureStatus = 'unavailable'

      if (combinedFeatures[feature.id]) {
        status = 'available'
      } else if (showITWhipPlus && itwhipPlusFeatures.includes(feature.id)) {
        status = 'itwhip-plus'
      }

      return {
        id: feature.id,
        label: feature.label,
        icon: feature.icon,
        status,
        color: feature.color,
        providers: feature.providers
      }
    })
  }, [selectedProviders, showITWhipPlus])

  // Count available features
  const availableCount = featureStatuses.filter(f => f.status === 'available').length
  const itwhipPlusCount = featureStatuses.filter(f => f.status === 'itwhip-plus').length

  // Color mapping for feature icons
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    red: 'text-red-400 bg-red-500/20',
    orange: 'text-orange-400 bg-orange-500/20'
  }

  const handleFeatureClick = (featureId: FeatureId) => {
    if (onFeatureClick) {
      onFeatureClick(featureId)
    }
  }

  return (
    <div className={className}>
      {/* Header with counts */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          Available Features
        </span>
        <div className="flex items-center gap-3 text-xs">
          {availableCount > 0 && (
            <span className="flex items-center gap-1">
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">{availableCount}</span>
              <span className="text-gray-600">included</span>
            </span>
          )}
          {itwhipPlusCount > 0 && (
            <span className="flex items-center gap-1">
              <IoFlash className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-medium">{itwhipPlusCount}</span>
              <span className="text-gray-600">w/ Plus</span>
            </span>
          )}
        </div>
      </div>

      {/* Feature Grid - 2 columns x 4 rows */}
      <div className="grid grid-cols-2 gap-2">
        {featureStatuses.map((feature) => {
          const IconComponent = feature.icon
          const isClickable = feature.status !== 'unavailable' && onFeatureClick
          const colors = colorClasses[feature.color] || colorClasses.blue

          return (
            <button
              key={feature.id}
              onClick={() => isClickable && handleFeatureClick(feature.id)}
              disabled={!isClickable}
              className={`
                group relative flex items-center gap-2 p-2.5 rounded-lg
                border transition-all duration-200
                ${feature.status === 'available'
                  ? 'bg-gray-800/80 border-gray-700 hover:border-gray-600 cursor-pointer'
                  : feature.status === 'itwhip-plus'
                  ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50 cursor-pointer'
                  : 'bg-gray-900/30 border-gray-800/50 cursor-not-allowed opacity-50'
                }
              `}
            >
              {/* Feature Icon */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                transition-all duration-200
                ${feature.status === 'available'
                  ? colors
                  : feature.status === 'itwhip-plus'
                  ? 'text-amber-400 bg-amber-500/20'
                  : 'text-gray-600 bg-gray-800/50'
                }
              `}>
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Feature Label */}
              <div className="flex-1 text-left min-w-0">
                <span className={`
                  text-xs font-medium truncate block
                  ${feature.status === 'available'
                    ? 'text-white'
                    : feature.status === 'itwhip-plus'
                    ? 'text-amber-200'
                    : 'text-gray-600'
                  }
                `}>
                  {feature.label}
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {feature.status === 'available' ? (
                  <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
                ) : feature.status === 'itwhip-plus' ? (
                  <IoFlash className="w-4 h-4 text-amber-400" />
                ) : (
                  <IoLockClosed className="w-4 h-4 text-gray-700" />
                )}
              </div>

              {/* Hover tooltip for ItWhip+ features */}
              {feature.status === 'itwhip-plus' && (
                <div className="
                  absolute -top-8 left-1/2 -translate-x-1/2
                  opacity-0 group-hover:opacity-100 transition-opacity
                  bg-gray-900 border border-amber-500/30 rounded px-2 py-1
                  text-[10px] text-amber-300 whitespace-nowrap z-10
                  pointer-events-none
                ">
                  {ITWHIP_PLUS.monthlyPrice === 'Free' ? 'Free with ItWhip+' : `Requires ItWhip+ (${ITWHIP_PLUS.monthlyPrice})`}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ItWhip+ Upsell Banner */}
      {showITWhipPlus && itwhipPlusCount > 0 && (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <IoFlash className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-amber-200">
                Unlock All Features with ItWhip+
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {ITWHIP_PLUS.monthlyPrice === 'Free'
                  ? <>Fill the gaps from any provider — <span className="text-green-400 font-medium">Free for all hosts!</span></>
                  : <>Fill the gaps from any provider for just{' '}<span className="text-amber-400 font-medium">{ITWHIP_PLUS.monthlyPrice}</span></>
                }
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {featureStatuses
                  .filter(f => f.status === 'itwhip-plus')
                  .map(f => (
                    <span
                      key={f.id}
                      className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded"
                    >
                      +{f.label}
                    </span>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* No Providers Selected State */}
      {selectedProviders.length === 0 && (
        <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-center">
          <IoLockClosed className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            Select providers above to see available features
          </p>
        </div>
      )}
    </div>
  )
}
