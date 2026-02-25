// app/(guest)/dashboard/components/RestrictionGuard.tsx
'use client'

import { ReactNode } from 'react'
import { SuspensionInfo, RestrictionType, RESTRICTION_CONFIG } from '../types'

// SVG Icons
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

interface RestrictionGuardProps {
  suspensionInfo: SuspensionInfo | null
  restrictionType?: RestrictionType
  children: ReactNode
  onRestricted?: () => void
  showInlineMessage?: boolean
  carPrice?: number // For legacy compatibility
  carType?: string  // Car type for luxury/premium checks
}

export default function RestrictionGuard({
  suspensionInfo,
  restrictionType,
  children,
  onRestricted,
  showInlineMessage = true,
  carPrice,
  carType
}: RestrictionGuardProps) {
  
  // If no suspension info, allow everything
  if (!suspensionInfo) {
    return <>{children}</>
  }

  // Check if account is banned or suspended
  const isBanned = suspensionInfo.suspensionLevel === 'BANNED'
  const isSuspended = suspensionInfo.suspensionLevel === 'SOFT' || suspensionInfo.suspensionLevel === 'HARD'

  // If banned or suspended, block all booking actions
  if (isBanned || isSuspended) {
    if (onRestricted) onRestricted()
    
    if (!showInlineMessage) return null

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
              {isBanned ? 'Account Banned' : 'Account Suspended'}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {isBanned 
                ? 'Your account has been permanently banned. You cannot make bookings.'
                : 'Your account is temporarily suspended. New bookings are disabled.'}
            </p>
            <a
              href="/dashboard"
              className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline mt-2 inline-block"
            >
              View account status →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check specific restriction types
  if (restrictionType) {
    let isRestricted = false
    let restrictionMessage = ''

    switch (restrictionType) {
      case 'INSTANT_BOOK':
        isRestricted = suspensionInfo.requiresManualApproval === true
        restrictionMessage = 'Instant booking is disabled. You must wait for host approval.'
        break

      case 'LUXURY_CARS': {
        const ct = (carType || '').toUpperCase()
        if (['LUXURY', 'EXOTIC', 'CONVERTIBLE'].includes(ct)) {
          isRestricted = suspensionInfo.canBookLuxury === false
          restrictionMessage = 'You cannot book luxury vehicles (Luxury, Exotic, or Convertible) at this time due to account restrictions.'
        }
        break
      }

      case 'PREMIUM_CARS': {
        const ct = (carType || '').toUpperCase()
        if (ct === 'EXOTIC') {
          isRestricted = suspensionInfo.canBookPremium === false
          restrictionMessage = 'You cannot book exotic/premium vehicles at this time due to account restrictions.'
        }
        break
      }

      case 'MANUAL_APPROVAL':
        isRestricted = suspensionInfo.requiresManualApproval === true
        restrictionMessage = 'All bookings require manual approval from hosts.'
        break
    }

    // If restricted, show message or call callback
    if (isRestricted) {
      if (onRestricted) onRestricted()
      
      if (!showInlineMessage) return null

      const config = RESTRICTION_CONFIG[restrictionType]

      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                {config.label}
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {restrictionMessage}
              </p>
              {suspensionInfo.suspensionExpiresAt && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Restriction expires: {new Date(suspensionInfo.suspensionExpiresAt).toLocaleDateString()}
                </p>
              )}
              <a
                href="/dashboard"
                className="text-sm text-yellow-600 dark:text-yellow-400 underline hover:no-underline mt-2 inline-block"
              >
                View account restrictions →
              </a>
            </div>
          </div>
        </div>
      )
    }
  }

  // No restrictions apply, render children
  return <>{children}</>
}

// Helper hook for checking restrictions programmatically
export function useRestrictionCheck(suspensionInfo: SuspensionInfo | null) {
  const checkRestriction = (restrictionType: RestrictionType, carType?: string): boolean => {
    if (!suspensionInfo) return false

    // Check if banned or suspended
    if (suspensionInfo.suspensionLevel) return true

    const ct = (carType || '').toUpperCase()

    // Check specific restrictions
    switch (restrictionType) {
      case 'INSTANT_BOOK':
        return suspensionInfo.requiresManualApproval === true

      case 'LUXURY_CARS':
        if (['LUXURY', 'EXOTIC', 'CONVERTIBLE'].includes(ct)) {
          return suspensionInfo.canBookLuxury === false
        }
        return false

      case 'PREMIUM_CARS':
        if (ct === 'EXOTIC') {
          return suspensionInfo.canBookPremium === false
        }
        return false

      case 'MANUAL_APPROVAL':
        return suspensionInfo.requiresManualApproval === true

      default:
        return false
    }
  }

  const canInstantBook = !checkRestriction('INSTANT_BOOK')
  const canBookLuxury = (carType: string) => !checkRestriction('LUXURY_CARS', carType)
  const canBookPremium = (carType: string) => !checkRestriction('PREMIUM_CARS', carType)
  const needsManualApproval = checkRestriction('MANUAL_APPROVAL')

  return {
    checkRestriction,
    canInstantBook,
    canBookLuxury,
    canBookPremium,
    needsManualApproval,
    isRestricted: suspensionInfo?.suspensionLevel !== null
  }
}