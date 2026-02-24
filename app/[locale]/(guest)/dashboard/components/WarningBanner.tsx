// app/(guest)/dashboard/components/WarningBanner.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  SuspensionInfo,
  WARNING_CATEGORY_CONFIG,
  RESTRICTION_CONFIG,
  RestrictionType,
  WarningCategory
} from '../types'
import AppealBottomSheet from '@/app/components/moderation/AppealBottomSheet'
import CommunityGuidelinesSheet from '@/app/components/moderation/CommunityGuidelinesSheet'

const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface WarningBannerProps {
  suspensionInfo: SuspensionInfo
  moderationHistory?: any[]
  guestId: string
  onAppealSuccess?: () => void
}

export default function WarningBanner({
  suspensionInfo,
  moderationHistory,
  guestId,
  onAppealSuccess
}: WarningBannerProps) {
  const [showAppealSheet, setShowAppealSheet] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [appealSubmitted, setAppealSubmitted] = useState(false)
  const [warningDismissed, setWarningDismissed] = useState(false)

  const { 
    suspensionLevel, 
    suspensionExpiresAt, 
    warningCount,
    canBookLuxury,
    canBookPremium,
    requiresManualApproval
  } = suspensionInfo

  // Get activeWarningCount from suspensionInfo
  const activeWarningCount = suspensionInfo.activeWarningCount || 0

  console.log('[WarningBanner] Status:', {
    suspensionLevel,
    warningCount,
    activeWarningCount,
    canBookLuxury,
    canBookPremium,
    requiresManualApproval
  })

  const activeRestrictions = useMemo(() => {
    const restrictions: RestrictionType[] = []
    
    if (requiresManualApproval) restrictions.push('MANUAL_APPROVAL')
    if (!canBookLuxury) restrictions.push('LUXURY_CARS')
    if (!canBookPremium) restrictions.push('PREMIUM_CARS')
    
    return restrictions
  }, [requiresManualApproval, canBookLuxury, canBookPremium])

  const latestWarning = useMemo(() => {
    if (!moderationHistory || moderationHistory.length === 0) return null
    
    const warnings = moderationHistory.filter(
      (action: any) => action.actionType === 'WARNING'
    )
    
    return warnings.length > 0 ? warnings[0] : null
  }, [moderationHistory])

  const daysRemaining = useMemo(() => {
    if (!suspensionExpiresAt) return null
    
    const now = new Date()
    const expiryDate = new Date(suspensionExpiresAt)
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }, [suspensionExpiresAt])

  const handleAppealClick = () => {
    setShowAppealSheet(true)
  }

  const handleAppealClose = () => {
    setShowAppealSheet(false)
  }

  const handleAppealSubmitSuccess = () => {
    setShowAppealSheet(false)
    setAppealSubmitted(true)
    if (onAppealSuccess) {
      onAppealSuccess()
    }
  }

  // ========================================================================
  // CRITICAL FIX: Only show warning banner if there are ACTIVE warnings
  // ========================================================================
  if (!suspensionLevel && activeWarningCount > 0) {
    const warningCategory = latestWarning?.warningCategory as WarningCategory | undefined
    const categoryConfig = warningCategory ? WARNING_CATEGORY_CONFIG[warningCategory] : null
    const severityColor = activeWarningCount === 1 ? 'yellow' : activeWarningCount === 2 ? 'orange' : 'red'

    // After guidelines acknowledgment — show compact "dismissed" banner
    if (warningDismissed) {
      return (
        <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full rounded-lg p-3 mt-3 mb-3 border bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Warning Dismissed
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Thank you for reviewing our Community Guidelines. Your account is back in good standing.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // After appeal submission — show compact "under review" banner
    if (appealSubmitted) {
      return (
        <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full rounded-lg p-3 mt-3 mb-3 border bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Appeal Under Review
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                We'll review your appeal within 24-48 hours and notify you of the outcome.
              </p>
            </div>
            <button
              onClick={handleAppealClick}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-400 dark:border-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 flex-shrink-0"
            >
              View Status
            </button>
          </div>
          <AppealBottomSheet
            isOpen={showAppealSheet}
            onClose={handleAppealClose}
            guestId={guestId}
            onSuccess={handleAppealSubmitSuccess}
          />
        </div>
      )
    }

    return (
      <>
        <div className={`-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full rounded-lg p-3 md:p-4 mt-3 md:mt-4 mb-3 md:mb-4 border ${
          severityColor === 'yellow'
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
            : severityColor === 'orange'
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-start">
            <AlertCircle className={`w-5 h-5 md:w-6 md:h-6 mt-0.5 mr-2 md:mr-3 flex-shrink-0 ${
              severityColor === 'yellow'
                ? 'text-yellow-600 dark:text-yellow-400'
                : severityColor === 'orange'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400'
            }`} />
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm md:text-base font-bold mb-1 md:mb-2 ${
                severityColor === 'yellow'
                  ? 'text-yellow-800 dark:text-yellow-200'
                  : severityColor === 'orange'
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {activeWarningCount} Active Account Warning{activeWarningCount > 1 ? 's' : ''}
              </h3>

              <p className={`text-xs md:text-sm mb-2 md:mb-3 ${
                severityColor === 'yellow'
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : severityColor === 'orange'
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                Your account has been flagged for review. Click &quot;View Details &amp; Appeal&quot; to see the reason and submit an appeal if you believe this is a mistake.
              </p>

              {activeRestrictions.length > 0 && (
                <div className="mb-2 md:mb-3">
                  <p className={`text-xs md:text-sm font-semibold mb-1 md:mb-2 ${
                    severityColor === 'yellow'
                      ? 'text-yellow-900 dark:text-yellow-100'
                      : severityColor === 'orange'
                      ? 'text-orange-900 dark:text-orange-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    Restrictions Applied:
                  </p>
                  <div className="space-y-0.5 md:space-y-1">
                    {activeRestrictions.map((restriction) => {
                      const config = RESTRICTION_CONFIG[restriction]
                      return (
                        <p key={restriction} className={`text-xs md:text-sm flex items-center ${
                          severityColor === 'yellow'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : severityColor === 'orange'
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
                          <span className="font-medium">{config.label}</span>
                          <span className="mx-1 md:mx-2">-</span>
                          <span className="truncate">{config.description}</span>
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAppealClick}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    severityColor === 'yellow'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : severityColor === 'orange'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  View Details & Appeal
                </button>

                <button
                  onClick={() => setShowGuidelines(true)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 border rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    severityColor === 'yellow'
                      ? 'border-yellow-600 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                      : severityColor === 'orange'
                      ? 'border-orange-600 text-orange-800 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                      : 'border-red-600 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}
                >
                  Community Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>

        <AppealBottomSheet
          isOpen={showAppealSheet}
          onClose={handleAppealClose}
          guestId={guestId}
          onSuccess={handleAppealSubmitSuccess}
        />
        <CommunityGuidelinesSheet
          isOpen={showGuidelines}
          onClose={() => setShowGuidelines(false)}
          canAcknowledge={activeWarningCount === 1}
          guestId={guestId}
          onAcknowledge={() => {
            setShowGuidelines(false)
            setWarningDismissed(true)
            if (onAppealSuccess) onAppealSuccess()
          }}
        />
      </>
    )
  } else if (!suspensionLevel && warningCount > 0) {
    console.log('[WarningBanner] ❌ Not showing banner - No active warnings (total:', warningCount, ', active:', activeWarningCount, ')')
  }

  // SOFT SUSPENSION BANNER
  if (suspensionLevel === 'SOFT') {
    console.log('[WarningBanner] ✅ Showing soft suspension banner')
    return (
      <>
        <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mt-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                Account Temporarily Restricted
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Your account has been temporarily restricted. Click "View Details & Appeal" to see the reason and submit an appeal.
              </p>
              <div className="space-y-0.5 mb-3">
                <p className="flex items-center text-[11px] leading-tight text-yellow-700 dark:text-yellow-300">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  You can still view your bookings and profile
                </p>
                <p className="flex items-center text-[11px] leading-tight text-yellow-700 dark:text-yellow-300">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  Active trips can continue normally
                </p>
                <p className="flex items-center text-[11px] leading-tight text-yellow-700 dark:text-yellow-300">
                  <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  New bookings are temporarily disabled
                </p>
              </div>
              {suspensionExpiresAt && (
                <p className="text-[11px] text-yellow-700 dark:text-yellow-300 mb-3">
                  <strong>Expires:</strong> {new Date(suspensionExpiresAt).toLocaleString()}
                  {daysRemaining !== null && ` (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)`}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAppealClick}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details & Appeal
                </button>
              </div>
            </div>
          </div>
        </div>

        <AppealBottomSheet
          isOpen={showAppealSheet}
          onClose={handleAppealClose}
          guestId={guestId}
          onSuccess={handleAppealSubmitSuccess}
        />
      </>
    )
  }

  // HARD SUSPENSION BANNER
  if (suspensionLevel === 'HARD') {
    console.log('[WarningBanner] ✅ Showing hard suspension banner')
    return (
      <>
        <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-600 rounded-lg p-4 mt-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-2">
                Account Suspended - Action Required
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                Your account has been suspended. Click "View Details & Appeal" to see the reason and submit an appeal if you believe this action was taken in error.
              </p>
              <div className="space-y-0.5 mb-3">
                <p className="flex items-center text-[11px] leading-tight text-orange-700 dark:text-orange-300">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  View booking history and profile
                </p>
                <p className="flex items-center text-[11px] leading-tight text-orange-700 dark:text-orange-300">
                  <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  Cannot make new bookings
                </p>
                <p className="flex items-center text-[11px] leading-tight text-orange-700 dark:text-orange-300">
                  <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  Future bookings have been cancelled
                </p>
              </div>
              {suspensionExpiresAt && (
                <p className="text-[11px] text-orange-700 dark:text-orange-300 mb-3">
                  <strong>Expires:</strong> {new Date(suspensionExpiresAt).toLocaleString()}
                  {daysRemaining !== null && ` (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)`}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAppealClick}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details & Appeal
                </button>
              </div>
            </div>
          </div>
        </div>

        <AppealBottomSheet
          isOpen={showAppealSheet}
          onClose={handleAppealClose}
          guestId={guestId}
          onSuccess={handleAppealSubmitSuccess}
        />
      </>
    )
  }

  // PERMANENT BAN BANNER
  if (suspensionLevel === 'BANNED') {
    console.log('[WarningBanner] ✅ Showing permanent ban banner')
    return (
      <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-red-50 dark:bg-red-900/20 border border-red-500 dark:border-red-700 rounded-lg p-4 mt-4 mb-4">
        <div className="flex items-start">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
              Account Permanently Banned
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Your account has been permanently restricted from using our platform. Contact support for more information.
            </p>
            <div className="space-y-0.5 mb-3">
              <p className="flex items-center text-[11px] leading-tight text-red-700 dark:text-red-300">
                <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                You cannot access platform services
              </p>
              <p className="flex items-center text-[11px] leading-tight text-red-700 dark:text-red-300">
                <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                All future bookings have been cancelled
              </p>
              <p className="flex items-center text-[11px] leading-tight text-red-700 dark:text-red-300">
                <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                Full refunds have been issued
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="mailto:info@itwhip.com"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Email Support
              </Link>
              <Link
                href="/support"
                className="px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('[WarningBanner] ❌ No banner to show - suspensionLevel:', suspensionLevel, ', activeWarningCount:', activeWarningCount)
  return null
}