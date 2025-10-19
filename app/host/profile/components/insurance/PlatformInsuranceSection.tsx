// app/host/profile/components/insurance/PlatformInsuranceSection.tsx
'use client'

import { IoCheckmarkCircleOutline, IoWarningOutline, IoTrendingUpOutline, IoArrowForwardOutline } from 'react-icons/io5'
import { EARNINGS_TIERS } from '@/app/fleet/financial-constants'

interface InsuranceProvider {
  id: string
  name: string
  type: string
  isActive: boolean
  coverageNotes?: string
  contractStart?: string
  contractEnd?: string
  revenueShare?: number
}

interface PlatformInsuranceSectionProps {
  provider?: InsuranceProvider
  policyNumber?: string
  isActive?: boolean
  currentTier: 'BASIC' | 'STANDARD' | 'PREMIUM'
  onViewPolicy: () => void
}

export default function PlatformInsuranceSection({
  provider,
  policyNumber,
  isActive,
  currentTier,
  onViewPolicy
}: PlatformInsuranceSectionProps) {
  const basicTier = EARNINGS_TIERS.BASIC
  const standardTier = EARNINGS_TIERS.STANDARD
  const premiumTier = EARNINGS_TIERS.PREMIUM
  const isBasicTier = currentTier === 'BASIC'

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Platform Trip Insurance
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isBasicTier 
              ? 'Currently using platform insurance (Tier 1 - Basic)'
              : 'Platform insurance available as backup coverage'
            }
          </p>
        </div>
        {provider && (
          <button
            onClick={onViewPolicy}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Policy Details
          </button>
        )}
      </div>

      {/* Insurance Assigned - Green Banner */}
      {provider ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                  Insurance Active
                </p>
                <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
                  All trips are automatically insured per-trip.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Provider Name Card */}
            <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Provider Name</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {provider.name}
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded">
                {provider.type}
              </span>
            </div>

            {/* Policy Number Card */}
            <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Policy Number</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white font-mono break-all">
                {policyNumber || 'Not Set'}
              </p>
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                isActive 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
              }`}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* ✅ NEW: Earnings Impact Card (Only show if at Basic tier) */}
          {isBasicTier && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <IoTrendingUpOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Want to Earn More?
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Add your own insurance to increase your earnings per booking.
                  </p>
                </div>
              </div>

              {/* Earnings Comparison - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Current: Basic */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border-2 border-gray-400 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Current</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {Math.round(basicTier.hostEarnings * 100)}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Basic Tier
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Platform insurance
                  </p>
                </div>

                {/* Upgrade Option 1: P2P */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-2 border-green-500 dark:border-green-700 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <IoArrowForwardOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Add P2P</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {Math.round(standardTier.hostEarnings * 100)}%
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                    Standard Tier
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                    +{Math.round((standardTier.hostEarnings - basicTier.hostEarnings) * 100)}% more
                  </p>
                </div>

                {/* Upgrade Option 2: Commercial */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-2 border-purple-500 dark:border-purple-700 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <IoArrowForwardOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Add Commercial</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {Math.round(premiumTier.hostEarnings * 100)}%
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                    Premium Tier
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
                    +{Math.round((premiumTier.hostEarnings - basicTier.hostEarnings) * 100)}% more
                  </p>
                </div>
              </div>

              {/* Earnings Example */}
              <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Example:</strong> On a $1,000 booking:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${(basicTier.hostEarnings * 1000).toFixed(0)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      ${(standardTier.hostEarnings * 1000).toFixed(0)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">With P2P</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      ${(premiumTier.hostEarnings * 1000).toFixed(0)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">With Commercial</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Ready to increase your earnings?
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Scroll down to add your P2P or Commercial insurance →
                </p>
              </div>
            </div>
          )}

          {/* Message for Standard/Premium tier hosts */}
          {!isBasicTier && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                ℹ️ Platform insurance remains available as backup coverage for all your trips.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* No Insurance Assigned - Yellow Warning */
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoWarningOutline className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                No Insurance Assigned
              </p>
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                Your account does not have an assigned insurance provider yet. Contact support if you need assistance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}