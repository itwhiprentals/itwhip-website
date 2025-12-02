// app/host/profile/components/tabs/InsuranceTab.tsx
'use client'

import { IoLockClosedOutline, IoInformationCircleOutline, IoCheckmarkCircleOutline, IoArrowForwardOutline, IoShieldCheckmarkOutline, IoWarningOutline } from 'react-icons/io5'
import { TabType } from '../TabNavigation'
import PlatformInsuranceSection from '../insurance/PlatformInsuranceSection'
import HostInsuranceSection from '../insurance/HostInsuranceSection'
import VehicleCoverageSection from '../insurance/VehicleCoverageSection'
import { EARNINGS_TIERS, determineHostTier, getTierComparison } from '@/app/fleet/financial-constants'

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

interface HostProfile {
  id: string
  commissionRate: number
  earningsTier?: 'BASIC' | 'STANDARD' | 'PREMIUM'
  usingLegacyInsurance?: boolean
  insuranceProviderId?: string
  insuranceProvider?: InsuranceProvider
  insurancePolicyNumber?: string
  insuranceActive?: boolean
  insuranceAssignedAt?: string
  hostInsuranceProvider?: string
  hostInsuranceStatus?: 'ACTIVE' | 'PENDING' | 'DEACTIVATED' | 'EXPIRED'
  hostPolicyNumber?: string
  hostInsuranceExpires?: string
  p2pInsuranceStatus?: string
  p2pInsuranceProvider?: string
  p2pPolicyNumber?: string
  p2pInsuranceExpires?: string
  commercialInsuranceStatus?: string
  commercialInsuranceProvider?: string
  commercialPolicyNumber?: string
  commercialInsuranceExpires?: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

interface InsuranceData {
  host: {
    id: string
    name: string
    email: string
    insuranceProvider?: any
    insurancePolicyNumber?: string
    insuranceActive?: boolean
    hostInsuranceProvider?: string
    hostPolicyNumber?: string
    hostInsuranceExpires?: string
    hostInsuranceStatus?: string
  }
  vehicles: any[]
  summary: {
    totalVehicles: number
    coveredVehicles: number
    gapVehicles: number
  }
}

interface InsuranceTabProps {
  profile: HostProfile
  insuranceData: InsuranceData | null
  loadingInsurance: boolean
  isApproved: boolean
  onShowPolicyModal: () => void
  onShowInsuranceForm: (mode: 'submit' | 'update' | 'reactivate') => void
  onDeactivateInsurance: () => void
  onTabChange: (tab: TabType) => void
}

export default function InsuranceTab({
  profile,
  insuranceData,
  loadingInsurance,
  isApproved,
  onShowPolicyModal,
  onShowInsuranceForm,
  onDeactivateInsurance,
  onTabChange
}: InsuranceTabProps) {
  // Determine current tier
  const currentTier = determineHostTier(profile)
  const tierComparison = getTierComparison()

  // Handle adding new insurance
  const handleAddInsurance = () => {
    onShowInsuranceForm('submit')
  }

  // Handle renewing expired insurance
  const handleRenewInsurance = () => {
    onShowInsuranceForm('submit')
  }

  // Get host's insurance provider name
  const getInsuranceProviderName = () => {
    if (currentTier === 'PREMIUM') {
      return profile.commercialInsuranceProvider || 'Commercial Insurance'
    } else if (currentTier === 'STANDARD') {
      return profile.usingLegacyInsurance 
        ? profile.hostInsuranceProvider 
        : profile.p2pInsuranceProvider || 'P2P Insurance'
    }
    return null
  }

  const insuranceProviderName = getInsuranceProviderName()

  // If not approved, show tier selection interface (required for verification)
  if (!isApproved) {
    return (
      <div className="space-y-6">
        {/* Verification Required Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Select Your Insurance Tier
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Choose your earnings tier to complete verification. This determines your earnings rate and insurance requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Tier Selection Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* BASIC Tier - 40% */}
          <div className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
            currentTier === 'BASIC'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic</h3>
              {currentTier === 'BASIC' && (
                <IoCheckmarkCircleOutline className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">40%</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">earnings</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Platform insurance covers your vehicles. No additional insurance required.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>No insurance required</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Platform coverage included</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>60% platform fee</span>
              </li>
            </ul>
            <button
              disabled={currentTier === 'BASIC'}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                currentTier === 'BASIC'
                  ? 'bg-purple-600 text-white cursor-default'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {currentTier === 'BASIC' ? 'Current Tier' : 'Select Basic'}
            </button>
          </div>

          {/* STANDARD Tier - 75% */}
          <div className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
            currentTier === 'STANDARD'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Standard</h3>
              {currentTier === 'STANDARD' && (
                <IoCheckmarkCircleOutline className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">75%</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">earnings</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              P2P insurance required. Better earnings with peer-to-peer coverage.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>P2P insurance required</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Higher earnings rate</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>25% platform fee</span>
              </li>
            </ul>
            <button
              disabled={currentTier === 'STANDARD'}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                currentTier === 'STANDARD'
                  ? 'bg-purple-600 text-white cursor-default'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {currentTier === 'STANDARD' ? 'Current Tier' : 'Select Standard'}
            </button>
          </div>

          {/* PREMIUM Tier - 90% */}
          <div className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
            currentTier === 'PREMIUM'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Premium</h3>
              {currentTier === 'PREMIUM' && (
                <IoCheckmarkCircleOutline className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">90%</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">earnings</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Commercial insurance required. Highest earnings for professional hosts.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Commercial insurance required</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Maximum earnings rate</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>10% platform fee</span>
              </li>
            </ul>
            <button
              disabled={currentTier === 'PREMIUM'}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                currentTier === 'PREMIUM'
                  ? 'bg-purple-600 text-white cursor-default'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {currentTier === 'PREMIUM' ? 'Current Tier' : 'Select Premium'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Important Information</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• You must select a tier to complete host verification</li>
            <li>• You can upgrade your tier anytime after approval</li>
            <li>• Standard and Premium tiers require insurance verification</li>
            <li>• Basic tier is perfect for getting started quickly</li>
          </ul>
        </div>
      </div>
    )
  }

  // If approved, show full insurance sections
  return (
    <div className="space-y-6">
      {/* Dynamic Insurance Status Banner */}
      {currentTier === 'BASIC' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <IoWarningOutline className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0 sm:mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-yellow-900 dark:text-yellow-200">
                  Insurance Status: Platform Primary Coverage
                </h3>
                <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 text-xs font-bold rounded w-fit">
                  BASIC TIER
                </span>
              </div>
              <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Your earnings:</strong> 40% per booking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Coverage:</strong> Platform insurance covers all trips (60% platform fee includes coverage)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Guest protection:</strong> Fully covered on every trip</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Upgrade:</strong> Add your own insurance to earn 75-90% per booking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {currentTier === 'STANDARD' && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0 sm:mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-green-900 dark:text-green-200">
                  Insurance Active: Your P2P Insurance
                </h3>
                <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 text-xs font-bold rounded w-fit">
                  PRIMARY
                </span>
              </div>
              <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-green-800 dark:text-green-300">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Your earnings:</strong> 75% per booking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Your insurance:</strong> {insuranceProviderName} - Primary coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Platform insurance:</strong> Secondary/backup coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Guest options:</strong> Can upgrade coverage at checkout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {currentTier === 'PREMIUM' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <IoCheckmarkCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0 sm:mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-purple-900 dark:text-purple-200">
                  Insurance Active: Your Commercial Insurance
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-xs font-bold rounded">
                    PRIMARY
                  </span>
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold rounded">
                    MAX TIER
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-purple-800 dark:text-purple-300">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Your earnings:</strong> 90% per booking (Maximum tier!)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Your insurance:</strong> {insuranceProviderName} - Primary coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Platform insurance:</strong> Secondary/backup coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Guest options:</strong> Can upgrade coverage at checkout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tier Comparison Cards - Now with breathing room */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {tierComparison.map((tier) => {
          const isCurrentTier = currentTier === tier.tier
          const isLowerTier = tier.order < (currentTier === 'BASIC' ? 1 : currentTier === 'STANDARD' ? 2 : 3)
          
          return (
            <div
              key={tier.tier}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                isCurrentTier
                  ? `${tier.badgeColor} border-current shadow-lg scale-105`
                  : isLowerTier
                  ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'
              }`}
            >
              {/* Current Tier Badge */}
              {isCurrentTier && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    Current
                  </span>
                </div>
              )}

              {/* Tier Number */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Tier {tier.order}
                </span>
                {!isCurrentTier && !isLowerTier && (
                  <IoArrowForwardOutline className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Tier Name */}
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                isCurrentTier ? tier.accentColor : 'text-gray-900 dark:text-white'
              }`}>
                {tier.name}
              </h3>

              {/* Earnings Percentage */}
              <div className="mb-3">
                <span className={`text-3xl sm:text-4xl font-bold ${
                  isCurrentTier ? tier.accentColor : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {Math.round(tier.hostEarnings * 100)}%
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  earnings
                </span>
              </div>

              {/* Insurance Required */}
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Required:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {tier.insuranceRequired}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {tier.insuranceType}
              </p>

              {/* Platform Fee (small) */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Platform fee: {Math.round(tier.platformFee * 100)}%
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          💡 <strong>How to upgrade:</strong> Add your P2P insurance to reach 75%, or add commercial insurance to reach 90% earnings.
        </p>
      </div>

      {/* Loading State */}
      {loadingInsurance ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading insurance data...</p>
        </div>
      ) : (
        <>
          {/* Platform Insurance Section (Tier 1) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <PlatformInsuranceSection
              provider={profile.insuranceProvider}
              policyNumber={profile.insurancePolicyNumber}
              isActive={profile.insuranceActive}
              currentTier={currentTier}
              onViewPolicy={onShowPolicyModal}
            />
          </div>

          {/* Host's Personal Insurance Section (Tier 2 & 3) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <HostInsuranceSection
              profile={profile}
              currentTier={currentTier}
              onAddInsurance={handleAddInsurance}
              onUpdateInsurance={handleRenewInsurance}
              onReactivateInsurance={() => onShowInsuranceForm('reactivate')}
              onDeactivateInsurance={onDeactivateInsurance}
            />
          </div>

          {/* Vehicle Coverage Summary */}
          {insuranceData && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <VehicleCoverageSection insuranceData={insuranceData} />
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start">
              <IoInformationCircleOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-2">Important Information</p>
                <ul className="space-y-1 text-xs sm:text-sm">
                  <li>• Platform insurance covers all trips automatically (included in 60% platform fee)</li>
                  <li>• Adding your P2P insurance <strong>increases earnings from 40% to 75%</strong></li>
                  <li>• Adding commercial insurance <strong>increases earnings to 90%</strong> (maximum tier)</li>
                  <li>• Only ACTIVE insurance provides tier benefits - PENDING status remains at 40%</li>
                  <li>• You cannot modify insurance during active bookings</li>
                  <li>• Deleting insurance immediately affects your tier</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}