// app/host/cars/[id]/components/UpdateDeclarationModal.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoCloseOutline, 
  IoWarningOutline, 
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
  IoLockClosedOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoCashOutline
} from 'react-icons/io5'
import { DECLARATION_CONFIGS, getEarningsTierInfo } from '@/app/lib/constants/declarations'
import type { DeclarationType, InsuranceType } from '@/app/types/compliance'

interface ActiveClaim {
  id: string
  type: string
  status: string
  createdAt: string
  estimatedCost?: number
}

interface UpdateDeclarationModalProps {
  carId: string
  currentDeclaration: DeclarationType
  actualAvgGap: number
  earningsTier: number
  insuranceType: InsuranceType
  hasActiveClaim: boolean
  activeClaim?: ActiveClaim
  onClose: () => void
  onSuccess: () => void
}

export default function UpdateDeclarationModal({
  carId,
  currentDeclaration,
  actualAvgGap,
  earningsTier,
  insuranceType,
  hasActiveClaim,
  activeClaim,
  onClose,
  onSuccess
}: UpdateDeclarationModalProps) {
  
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationType>(currentDeclaration)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const earningsTierInfo = getEarningsTierInfo(insuranceType)
  const hasChanged = selectedDeclaration !== currentDeclaration

  const handleSubmit = async () => {
    if (!hasChanged) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/host/cars/${carId}/intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify({
          action: 'update_usage',
          newUsage: selectedDeclaration
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update declaration')
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error updating declaration:', err)
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format claim status
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // ✅ FIXED: Show lock screen if EITHER flag is true OR claim exists
  if (hasActiveClaim || activeClaim) {
    
    // ✅ PREVENT BODY SCROLL WHEN MODAL IS OPEN
    useEffect(() => {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
      
      return () => {
        document.body.style.overflow = 'unset'
        document.body.style.paddingRight = '0px'
      }
    }, [])
    
    return (
      <>
        {/* Backdrop - FULL COVERAGE */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />

        {/* Lock Screen Modal - MOBILE OPTIMIZED */}
        <div className="fixed inset-0 z-[70] pointer-events-none flex items-end md:items-center md:justify-center">
          <div className="pointer-events-auto w-full md:max-w-lg">
            <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl md:rounded-2xl shadow-2xl min-h-[65vh] max-h-[90vh] overflow-hidden flex flex-col animate-slide-up md:animate-scale-in">
              
              {/* Mobile Handle */}
              <div className="flex justify-center pt-2 pb-1 md:hidden flex-shrink-0">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header - COMPACT */}
              <div className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <IoLockClosedOutline className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white">
                    Declaration Locked
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content - SCROLLABLE, COMPACT SPACING */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-3">
                
                {/* Lock Message - COMPACT */}
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoLockClosedOutline className="w-7 h-7 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                    Cannot Update Declaration
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Declaration changes are locked while claims are being processed to prevent 
                    manipulation and ensure claim integrity.
                  </p>
                </div>

                {/* Active Claim Details - COMPACT */}
                {activeClaim && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <IoAlertCircleOutline className="w-4 h-4 text-orange-500" />
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                        Active Claim Details
                      </h4>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {activeClaim.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {formatStatus(activeClaim.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-0.5">
                          <IoCalendarOutline className="w-3 h-3" />
                          Filed
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {formatDate(activeClaim.createdAt)}
                        </span>
                      </div>
                      
                      {activeClaim.estimatedCost && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-0.5">
                            <IoCashOutline className="w-3 h-3" />
                            Estimated Cost
                          </span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            ${activeClaim.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Information Box - COMPACT */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                        When Can I Update?
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                        Once your claim is resolved (approved, denied, or closed), you'll be able to 
                        update your usage declaration. This ensures claim decisions are based on your 
                        original declared usage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - COMPACT, FIXED AT BOTTOM */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 md:px-6 md:py-4 flex-shrink-0">
                <div className="flex gap-2.5">
                  {activeClaim && (
                    <Link
                      href={`/host/claims/${activeClaim.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-xs text-center"
                    >
                      View Claim Details
                    </Link>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ✅ NORMAL FORM - Show if no active claim
  
  // ✅ PREVENT BODY SCROLL FOR NORMAL FORM TOO
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = '0px'
    
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [])
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] pointer-events-none flex items-end md:items-center md:justify-center">
        <div className="pointer-events-auto w-full md:max-w-2xl">
          <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl md:rounded-2xl shadow-2xl min-h-[65vh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up md:animate-scale-in">
            
            {/* Mobile Handle */}
            <div className="flex justify-center pt-2 pb-1 md:hidden flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white">
                Update Usage Declaration
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-3 md:space-y-4">
              
              {/* Important Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                      Important: Earnings Tier Unchanged
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                      Your <span className="font-semibold">{earningsTier}% earnings tier</span> is based 
                      on your insurance level ({earningsTierInfo.description}) and will NOT change. 
                      This declaration only affects claim approval processes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Current Declaration
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {DECLARATION_CONFIGS[currentDeclaration].label}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Max {DECLARATION_CONFIGS[currentDeclaration].maxGap} miles between trips
                </p>
                {actualAvgGap > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    Your Average: <span className="font-semibold text-orange-600 dark:text-orange-400">{Math.round(actualAvgGap)} miles</span>
                  </p>
                )}
              </div>

              {/* Declaration Options */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  Select New Declaration
                </h3>

                {(Object.keys(DECLARATION_CONFIGS) as DeclarationType[]).map((declaration) => {
                  const config = DECLARATION_CONFIGS[declaration]
                  const isSelected = selectedDeclaration === declaration
                  const isCurrent = currentDeclaration === declaration
                  const willComply = actualAvgGap > 0 && actualAvgGap <= config.maxGap

                  return (
                    <button
                      key={declaration}
                      onClick={() => setSelectedDeclaration(declaration)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {config.label}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                Current
                              </span>
                            )}
                            {willComply && !isCurrent && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                <IoCheckmarkCircleOutline className="w-3 h-3" />
                                Fits
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 leading-relaxed">
                            {config.description}
                          </p>
                          
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Allowed Gap:</span> Max {config.maxGap} miles between trips
                              </p>
                            </div>
                            
                            <div className="flex items-start gap-1.5">
                              <IoDocumentTextOutline className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Tax:</span> {config.taxImplication}
                              </p>
                            </div>
                            
                            <div className="flex items-start gap-1.5">
                              <IoInformationCircleOutline className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {config.insuranceNote}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Radio Button */}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Claim Impact Warning */}
              {hasChanged && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-semibold text-yellow-900 dark:text-yellow-300 mb-0.5">
                        Claim Processing Impact
                      </h3>
                      <p className="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed">
                        {DECLARATION_CONFIGS[selectedDeclaration].claimImpact}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* More Settings Link */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/host/cars/${carId}/edit?tab=registration`}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 inline-flex items-center gap-1 transition-colors"
                >
                  <IoSettingsOutline className="w-3.5 h-3.5" />
                  More settings available in Registration tab
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs text-red-800 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 md:px-6 md:py-4 flex-shrink-0">
              <div className="flex gap-2.5">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !hasChanged}
                  className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors font-medium text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <IoCheckmarkCircleOutline className="w-4 h-4" />
                      {hasChanged ? 'Update Declaration' : 'No Changes'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}