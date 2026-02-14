// app/partner/dashboard/components/TierProgressCard.tsx
// Commission Tier Progress Card - B2B Feature showing tier progression

'use client'

import { useTranslations } from 'next-intl'
import {
  IoTrophyOutline,
  IoChevronUpOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface TierProgressCardProps {
  currentRate: number
  fleetSize: number
  tier: {
    current: string
    vehiclesNeeded: number
    nextTier: string | null
    nextTierRate: number | null
  }
}

const tiers = [
  { name: 'Standard', minVehicles: 0, maxVehicles: 9, rate: 0.25, color: 'gray' },
  { name: 'Gold', minVehicles: 10, maxVehicles: 49, rate: 0.20, color: 'yellow' },
  { name: 'Platinum', minVehicles: 50, maxVehicles: 99, rate: 0.15, color: 'blue' },
  { name: 'Diamond', minVehicles: 100, maxVehicles: Infinity, rate: 0.10, color: 'purple' }
]

export default function TierProgressCard({
  currentRate,
  fleetSize,
  tier
}: TierProgressCardProps) {
  const t = useTranslations('PartnerDashboard')
  const currentTierIndex = tiers.findIndex(tc => tc.name === tier.current)
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null

  const getProgressToNextTier = () => {
    if (!nextTier) return 100
    const currentTierConfig = tiers[currentTierIndex]
    const vehiclesInCurrentTier = fleetSize - currentTierConfig.minVehicles
    const vehiclesNeededForNext = nextTier.minVehicles - currentTierConfig.minVehicles
    return Math.min((vehiclesInCurrentTier / vehiclesNeededForNext) * 100, 100)
  }

  const progress = getProgressToNextTier()

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return 'from-purple-500 to-purple-600'
      case 'Platinum': return 'from-blue-500 to-blue-600'
      case 'Gold': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierBgColor = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      case 'Platinum': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'Gold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <IoTrophyOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('tierCommissionTier')}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tierGrowFleet')}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getTierBgColor(tier.current)}`}>
            {t('tierPartner', { tier: tier.current })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Current Rate Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tierCommissionRate')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {(currentRate * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('tierYouKeep', { percent: ((1 - currentRate) * 100).toFixed(0) })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tierFleetSize')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{fleetSize}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tierVehicles')}</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                {t('tierProgressTo', { tier: nextTier.name })}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('tierMoreVehiclesNeeded', { count: tier.vehiclesNeeded })}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getTierColor(nextTier.name)} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{t('tierVehicleCount', { count: fleetSize })}</span>
              <span>{t('tierVehicleCount', { count: nextTier.minVehicles })}</span>
            </div>
          </div>
        )}

        {/* Tier Ladder */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {tiers.map((tierConfig, index) => {
            const isCurrentTier = tierConfig.name === tier.current
            const isUnlocked = index <= currentTierIndex
            const isNextTier = index === currentTierIndex + 1

            return (
              <div
                key={tierConfig.name}
                className={`relative p-2.5 rounded-lg text-center transition-all ${
                  isCurrentTier
                    ? 'bg-gray-50 dark:bg-gray-700 border-2 border-orange-500'
                    : isUnlocked
                    ? 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                    {t('tierCurrent')}
                  </div>
                )}
                {isNextTier && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                    {t('tierNext')}
                  </div>
                )}

                <div className="mb-1">
                  {isUnlocked ? (
                    <IoCheckmarkCircleOutline className={`w-4 h-4 mx-auto ${
                      isCurrentTier ? 'text-orange-500' : 'text-green-500'
                    }`} />
                  ) : (
                    <IoLockClosedOutline className="w-4 h-4 mx-auto text-gray-400" />
                  )}
                </div>

                <p className={`text-xs font-semibold ${
                  isCurrentTier
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {tierConfig.name}
                </p>

                <p className={`text-base font-bold ${
                  isCurrentTier
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {(tierConfig.rate * 100).toFixed(0)}%
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('tierCars', { count: tierConfig.minVehicles })}
                </p>
              </div>
            )
          })}
        </div>

        {/* Diamond Tier Benefits */}
        {tier.current !== 'Diamond' && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <IoTrophyOutline className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t('tierUnlockDiamond')}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('tierDiamondBenefitsDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
