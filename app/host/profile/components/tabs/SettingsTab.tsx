// app/host/profile/components/tabs/SettingsTab.tsx
'use client'

import { IoSaveOutline, IoTimeOutline, IoBanOutline, IoTrendingUpOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'
import { EARNINGS_TIERS, determineHostTier, getTierConfig } from '@/app/fleet/financial-constants'

interface HostProfile {
  id: string
  commissionRate: number
  earningsTier?: 'BASIC' | 'STANDARD' | 'PREMIUM'
  usingLegacyInsurance?: boolean
  hostInsuranceStatus?: 'ACTIVE' | 'PENDING' | 'DEACTIVATED' | 'EXPIRED'
  p2pInsuranceStatus?: string
  commercialInsuranceStatus?: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

interface FormData {
  autoApproveBookings: boolean
  requireDeposit: boolean
  depositAmount: number
}

interface SettingsTabProps {
  profile: HostProfile
  formData: FormData
  savingSettings: boolean
  isApproved: boolean
  isSuspended: boolean
  onFormChange: (data: Partial<FormData>) => void
  onSave: () => void
  onTabChange?: (tab: string) => void
}

export default function SettingsTab({
  profile,
  formData,
  savingSettings,
  isApproved,
  isSuspended,
  onFormChange,
  onSave,
  onTabChange
}: SettingsTabProps) {
  // Determine current tier
  const currentTier = determineHostTier(profile)
  const tierConfig = getTierConfig(currentTier)
  
  // Check if host can upgrade
  const canUpgrade = currentTier !== 'PREMIUM'
  const nextTier = tierConfig.nextTier
  const nextTierConfig = nextTier ? getTierConfig(nextTier as 'BASIC' | 'STANDARD' | 'PREMIUM') : null

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pending State Banner */}
      {!isApproved && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <IoTimeOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Settings Available After Approval
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                You'll be able to configure booking settings, deposits, and preferences once your account is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suspended State Banner */}
      {isSuspended && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Settings Locked
              </p>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
                Settings cannot be modified while your account is suspended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-3 sm:space-y-4">
        {/* Auto-approve Bookings */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
          !isApproved || isSuspended ? 'opacity-50' : ''
        }`}>
          <div className="mb-3 sm:mb-0">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              Auto-approve Bookings
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automatically accept booking requests that meet your requirements
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoApproveBookings}
              onChange={(e) => onFormChange({ autoApproveBookings: e.target.checked })}
              disabled={!isApproved || isSuspended}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
        </div>

        {/* Require Security Deposit */}
        <div className={`p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
          !isApproved || isSuspended ? 'opacity-50' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <div className="mb-3 sm:mb-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Require Security Deposit
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Hold a refundable deposit for potential damages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireDeposit}
                onChange={(e) => onFormChange({ requireDeposit: e.target.checked })}
                disabled={!isApproved || isSuspended}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Deposit Amount Input */}
          {formData.requireDeposit && isApproved && !isSuspended && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deposit Amount
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => onFormChange({ depositAmount: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="50"
                  className="w-full pl-8 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* ✅ NEW: Your Earnings Tier Display */}
        <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Left: Earnings Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <IoShieldCheckmarkOutline className={`w-5 h-5 ${tierConfig.accentColor}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Your Earnings
                </h3>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl sm:text-4xl font-bold ${tierConfig.accentColor}`}>
                  {Math.round(tierConfig.hostEarnings * 100)}%
                </span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  per booking
                </span>
              </div>

              {/* Tier Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${tierConfig.badgeColor}`}>
                  {tierConfig.name} Tier
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tierConfig.description}
                </span>
              </div>

              {/* Platform Fee Info (small text) */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Platform fee: {Math.round(tierConfig.platformFee * 100)}% • 
                You keep ${((tierConfig.hostEarnings * 1000)).toFixed(0)} of every $1,000 booking
              </p>
            </div>

            {/* Right: Upgrade CTA (if not at max tier) */}
            {canUpgrade && nextTierConfig && onTabChange && (
              <div className="sm:ml-4">
                <button
                  onClick={() => onTabChange('insurance')}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-sm transition-all hover:shadow-md flex items-center justify-center gap-2 ${
                    nextTier === 'STANDARD' 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <IoTrendingUpOutline className="w-4 h-4" />
                  <span className="whitespace-nowrap">
                    Upgrade to {Math.round(nextTierConfig.hostEarnings * 100)}%
                  </span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center sm:text-right">
                  {nextTierConfig.description}
                </p>
              </div>
            )}

            {/* Max Tier Reached */}
            {!canUpgrade && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  Maximum Tier!
                </span>
              </div>
            )}
          </div>

          {/* Tier Progression Visual (Mobile & Desktop) */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Earnings Progression</span>
              <span className="font-medium">{tierConfig.name}</span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  currentTier === 'BASIC' ? 'bg-gray-400' :
                  currentTier === 'STANDARD' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}
                style={{ 
                  width: currentTier === 'BASIC' ? '33%' : 
                         currentTier === 'STANDARD' ? '66%' : 
                         '100%' 
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${currentTier === 'BASIC' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                40%
              </span>
              <span className={`text-xs ${currentTier === 'STANDARD' ? 'font-bold text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                75%
              </span>
              <span className={`text-xs ${currentTier === 'PREMIUM' ? 'font-bold text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                90%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isApproved && !isSuspended && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onSave}
            disabled={savingSettings}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base font-medium"
          >
            {savingSettings ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}