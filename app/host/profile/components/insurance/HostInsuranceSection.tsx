// app/host/profile/components/insurance/HostInsuranceSection.tsx
'use client'

import { useState } from 'react'
import { IoWarningOutline, IoShieldCheckmarkOutline, IoTrendingUpOutline, IoAddCircleOutline, IoTrashOutline, IoSwapHorizontalOutline } from 'react-icons/io5'
import { EARNINGS_TIERS } from '@/app/fleet/financial-constants'
import InsuranceManagementModal from './InsuranceManagementModal'

interface HostProfile {
  id?: string
  earningsTier?: 'BASIC' | 'STANDARD' | 'PREMIUM'
  usingLegacyInsurance?: boolean
  hostInsuranceStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DEACTIVATED' | 'EXPIRED'
  hostInsuranceProvider?: string
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
}

interface HostInsuranceSectionProps {
  profile: HostProfile
  currentTier: 'BASIC' | 'STANDARD' | 'PREMIUM'
  onAddInsurance: () => void
  onUpdateInsurance: () => void
  onReactivateInsurance: () => void
  onDeactivateInsurance: () => void
}

export default function HostInsuranceSection({
  profile,
  currentTier,
  onAddInsurance,
  onUpdateInsurance,
  onReactivateInsurance,
  onDeactivateInsurance
}: HostInsuranceSectionProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: 'DELETE' | 'TOGGLE' | null
    insuranceType?: 'P2P' | 'COMMERCIAL'
    targetTier?: any
  }>({
    isOpen: false,
    action: null
  })
  const [isCheckingBookings, setIsCheckingBookings] = useState(false)
  const [bookingStatus, setBookingStatus] = useState<any>(null)

  const standardTier = EARNINGS_TIERS.STANDARD
  const premiumTier = EARNINGS_TIERS.PREMIUM

  // Determine P2P insurance status (handles legacy)
  const p2pStatus = profile.usingLegacyInsurance 
    ? profile.hostInsuranceStatus 
    : profile.p2pInsuranceStatus
  
  const p2pProvider = profile.usingLegacyInsurance
    ? profile.hostInsuranceProvider
    : profile.p2pInsuranceProvider
    
  const p2pPolicyNumber = profile.usingLegacyInsurance
    ? profile.hostPolicyNumber
    : profile.p2pPolicyNumber
    
  const p2pExpires = profile.usingLegacyInsurance
    ? profile.hostInsuranceExpires
    : profile.p2pInsuranceExpires

  const hasP2P = p2pProvider && p2pPolicyNumber
  const hasCommercial = profile.commercialInsuranceProvider && profile.commercialPolicyNumber

  // Check active bookings
  const checkActiveBookings = async () => {
    setIsCheckingBookings(true)
    try {
      const response = await fetch('/api/host/bookings/active')
      const data = await response.json()
      setBookingStatus(data)
      return data
    } catch (error) {
      console.error('Error checking bookings:', error)
      return null
    } finally {
      setIsCheckingBookings(false)
    }
  }

  // Handle delete insurance
  const handleDeleteInsurance = async (type: 'P2P' | 'COMMERCIAL') => {
    const bookings = await checkActiveBookings()
    
    // Calculate target tier after deletion
    let targetTier
    if (type === 'P2P' && profile.commercialInsuranceStatus === 'ACTIVE') {
      targetTier = { tier: 'PREMIUM', hostEarnings: 0.90, platformCommission: 0.10 }
    } else if (type === 'P2P' && profile.commercialInsuranceStatus === 'INACTIVE') {
      // If deleting P2P and Commercial is INACTIVE, Commercial will auto-activate
      targetTier = { tier: 'PREMIUM', hostEarnings: 0.90, platformCommission: 0.10 }
    } else if (type === 'COMMERCIAL' && p2pStatus === 'ACTIVE') {
      targetTier = { tier: 'STANDARD', hostEarnings: 0.75, platformCommission: 0.25 }
    } else if (type === 'COMMERCIAL' && p2pStatus === 'INACTIVE') {
      // If deleting Commercial and P2P is INACTIVE, P2P will auto-activate
      targetTier = { tier: 'STANDARD', hostEarnings: 0.75, platformCommission: 0.25 }
    } else {
      targetTier = { tier: 'BASIC', hostEarnings: 0.40, platformCommission: 0.60 }
    }

    setModalState({
      isOpen: true,
      action: 'DELETE',
      insuranceType: type,
      targetTier
    })
  }

  // Handle toggle
  const handleToggleInsurance = async (targetType: 'P2P' | 'COMMERCIAL') => {
    await checkActiveBookings()
    
    const targetTier = targetType === 'COMMERCIAL'
      ? { tier: 'PREMIUM', hostEarnings: 0.90, platformCommission: 0.10 }
      : { tier: 'STANDARD', hostEarnings: 0.75, platformCommission: 0.25 }

    setModalState({
      isOpen: true,
      action: 'TOGGLE',
      insuranceType: targetType,
      targetTier
    })
  }

  // Confirm action
  const handleConfirmAction = async (confirmationText?: string) => {
    if (!modalState.action) return

    try {
      if (modalState.action === 'DELETE') {
        const response = await fetch('/api/host/insurance/manage', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: modalState.insuranceType,
            confirmationText
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete insurance')
        }
        
        window.location.reload()
        
      } else if (modalState.action === 'TOGGLE') {
        // Use the new toggle endpoint
        const response = await fetch('/api/host/insurance/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType: modalState.insuranceType
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to toggle insurance')
        }
        
        window.location.reload()
      }
    } catch (error: any) {
      throw error
    }
  }

  // Status badge color helper
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case 'INACTIVE':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      case 'DEACTIVATED':
      case 'EXPIRED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
    }
  }

  // Card border color helper
  const getCardBorderColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'INACTIVE':
        return 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-75'
      case 'PENDING':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Insurance
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your insurance to control your earnings tier
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* P2P INSURANCE SECTION */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  P2P Insurance (Standard Tier)
                </h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${standardTier.badgeColor}`}>
                Earn {Math.round(standardTier.hostEarnings * 100)}%
              </span>
            </div>

            {hasP2P ? (
              <div className="space-y-3">
                <div className={`border rounded-lg p-3 sm:p-4 ${getCardBorderColor(p2pStatus)}`}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {p2pProvider}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                        Policy: {p2pPolicyNumber}
                      </p>
                      {p2pExpires && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Expires: {new Date(p2pExpires).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(p2pStatus)}`}>
                      {p2pStatus}
                    </span>
                  </div>

                  {/* Earnings Display */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Your Earnings:</span>
                      <span className={`font-semibold text-lg ${
                        p2pStatus === 'ACTIVE' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {p2pStatus === 'ACTIVE' ? '75%' : currentTier === 'PREMIUM' ? '90%' : '40%'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - BETTER UX: Only show toggle in ACTIVE section */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {p2pStatus === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleDeleteInsurance('P2P')}
                          disabled={isCheckingBookings}
                          className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                          Delete P2P
                        </button>
                        {/* ✅ ONLY show toggle if Commercial EXISTS and is INACTIVE */}
                        {hasCommercial && profile.commercialInsuranceStatus === 'INACTIVE' && (
                          <button
                            onClick={() => handleToggleInsurance('COMMERCIAL')}
                            disabled={isCheckingBookings}
                            className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <IoSwapHorizontalOutline className="w-4 h-4" />
                            Switch to Commercial
                          </button>
                        )}
                      </>
                    )}

                    {/* ✅ INACTIVE: Only show Delete button (no toggle) */}
                    {p2pStatus === 'INACTIVE' && (
                      <button
                        onClick={() => handleDeleteInsurance('P2P')}
                        disabled={isCheckingBookings}
                        className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                        Delete P2P Insurance
                      </button>
                    )}
                    
                    {p2pStatus === 'PENDING' && (
                      <div className="flex-1 text-center text-sm text-yellow-700 dark:text-yellow-300 py-2">
                        ⏳ Pending admin approval - Cannot modify
                      </div>
                    )}
                    
                    {p2pStatus === 'EXPIRED' && (
                      <button
                        onClick={onAddInsurance}
                        className="flex-1 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Renew Insurance
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {p2pStatus === 'ACTIVE' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
                      ✓ You're earning <strong>75% of each booking</strong> with active P2P insurance
                    </p>
                  </div>
                )}

                {p2pStatus === 'INACTIVE' && (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      ℹ️ This insurance is <strong>on standby</strong>. Currently using Commercial insurance (90%).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* No P2P Insurance CTA */
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoTrendingUpOutline className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Increase Earnings to 75%
                    </p>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 mb-3">
                      Add your P2P car sharing insurance to earn 75% per booking.
                    </p>
                    <button
                      onClick={onAddInsurance}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <IoAddCircleOutline className="w-4 h-4" />
                      Add P2P Insurance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COMMERCIAL INSURANCE SECTION */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Commercial Insurance (Premium Tier)
                </h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${premiumTier.badgeColor}`}>
                Earn {Math.round(premiumTier.hostEarnings * 100)}%
              </span>
            </div>

            {hasCommercial ? (
              <div className="space-y-3">
                <div className={`border rounded-lg p-3 sm:p-4 ${getCardBorderColor(profile.commercialInsuranceStatus)}`}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {profile.commercialInsuranceProvider}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                        Policy: {profile.commercialPolicyNumber}
                      </p>
                      {profile.commercialInsuranceExpires && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Expires: {new Date(profile.commercialInsuranceExpires).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(profile.commercialInsuranceStatus)}`}>
                      {profile.commercialInsuranceStatus}
                    </span>
                  </div>

                  {/* Earnings Display */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Your Earnings:</span>
                      <span className={`font-semibold text-lg ${
                        profile.commercialInsuranceStatus === 'ACTIVE' 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {profile.commercialInsuranceStatus === 'ACTIVE' ? '90%' : currentTier === 'STANDARD' ? '75%' : '40%'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - BETTER UX: Only show toggle in ACTIVE section */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {profile.commercialInsuranceStatus === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleDeleteInsurance('COMMERCIAL')}
                          disabled={isCheckingBookings}
                          className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                          Delete Commercial
                        </button>
                        {/* ✅ ONLY show toggle if P2P EXISTS and is INACTIVE */}
                        {hasP2P && p2pStatus === 'INACTIVE' && (
                          <button
                            onClick={() => handleToggleInsurance('P2P')}
                            disabled={isCheckingBookings}
                            className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <IoSwapHorizontalOutline className="w-4 h-4" />
                            Switch to P2P
                          </button>
                        )}
                      </>
                    )}

                    {/* ✅ INACTIVE: Only show Delete button (no toggle) */}
                    {profile.commercialInsuranceStatus === 'INACTIVE' && (
                      <button
                        onClick={() => handleDeleteInsurance('COMMERCIAL')}
                        disabled={isCheckingBookings}
                        className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                        Delete Commercial Insurance
                      </button>
                    )}
                    
                    {profile.commercialInsuranceStatus === 'PENDING' && (
                      <div className="flex-1 text-center text-sm text-yellow-700 dark:text-yellow-300 py-2">
                        ⏳ Pending admin approval - Cannot modify
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {profile.commercialInsuranceStatus === 'ACTIVE' && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">
                      🎉 You're at maximum earnings: <strong>90% of each booking</strong>!
                    </p>
                  </div>
                )}

                {profile.commercialInsuranceStatus === 'INACTIVE' && (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      ℹ️ This insurance is <strong>on standby</strong>. Currently using P2P insurance (75%).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* No Commercial Insurance CTA */
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoTrendingUpOutline className="w-5 h-5 text-purple-600 dark:text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
                      Maximize Earnings at 90%
                    </p>
                    <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 mb-3">
                      Add commercial insurance to reach the maximum tier and earn 90% per booking.
                    </p>
                    <button
                      onClick={onAddInsurance}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <IoAddCircleOutline className="w-4 h-4" />
                      Add Commercial Insurance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Modal */}
      <InsuranceManagementModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null })}
        action={modalState.action}
        insuranceType={modalState.insuranceType}
        currentTier={{
          tier: currentTier,
          hostEarnings: currentTier === 'PREMIUM' ? 0.90 : currentTier === 'STANDARD' ? 0.75 : 0.40,
          platformCommission: currentTier === 'PREMIUM' ? 0.10 : currentTier === 'STANDARD' ? 0.25 : 0.60
        }}
        targetTier={modalState.targetTier}
        onConfirm={handleConfirmAction}
        hasActiveBookings={bookingStatus?.hasActiveBookings}
        nextAvailableDate={bookingStatus?.nextAvailableDate}
      />
    </>
  )
}