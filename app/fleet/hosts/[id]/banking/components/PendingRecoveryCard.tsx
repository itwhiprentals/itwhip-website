// app/fleet/hosts/[id]/banking/components/PendingRecoveryCard.tsx
'use client'

import { IoTimeOutline, IoChevronForwardOutline } from 'react-icons/io5'
import { PendingClaim, formatCurrency } from '../types'

interface PendingRecoveryCardProps {
  pendingRecovery: number
  pendingClaimsCount: number
  pendingClaims: PendingClaim[]
  onViewClaim?: (claimId: string) => void
}

export function PendingRecoveryCard({
  pendingRecovery,
  pendingClaimsCount,
  pendingClaims,
  onViewClaim
}: PendingRecoveryCardProps) {
  if (pendingRecovery <= 0 || pendingClaimsCount === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Grayed out to indicate pending status */}
      <div className="p-4 sm:p-6 bg-orange-50/50 dark:bg-orange-900/10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending Recovery</span>
          <IoTimeOutline className="text-orange-500 w-5 h-5" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 opacity-75">
          {formatCurrency(pendingRecovery)}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {pendingClaimsCount} claim{pendingClaimsCount !== 1 ? 's' : ''} awaiting guest payment
        </p>
      </div>

      {/* Claims List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {pendingClaims.slice(0, 3).map(claim => (
          <PendingClaimRow
            key={claim.id}
            claim={claim}
            onViewClaim={onViewClaim}
          />
        ))}

        {pendingClaims.length > 3 && (
          <div className="p-3 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              +{pendingClaims.length - 3} more claim{pendingClaims.length - 3 !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recovery amounts will be added to current balance once guests are charged
        </p>
      </div>
    </div>
  )
}

interface PendingClaimRowProps {
  claim: PendingClaim
  onViewClaim?: (claimId: string) => void
}

function PendingClaimRow({ claim, onViewClaim }: PendingClaimRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
            Approved
          </span>
        )
      case 'GUEST_RESPONDED':
        return (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            Response Received
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            {status}
          </span>
        )
    }
  }

  const getDeadlineText = (deadline: string | null) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const hoursRemaining = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (hoursRemaining < 0) {
      return <span className="text-red-600 dark:text-red-400">Deadline passed</span>
    } else if (hoursRemaining < 24) {
      return <span className="text-orange-600 dark:text-orange-400">{hoursRemaining}h remaining</span>
    }
    return null
  }

  return (
    <div
      className={`p-3 sm:p-4 ${onViewClaim ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer' : ''}`}
      onClick={() => onViewClaim?.(claim.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {claim.carDetails}
            </span>
            {getStatusBadge(claim.status)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {claim.bookingCode} • {claim.guestName}
          </p>
          {claim.guestResponseDeadline && (
            <p className="text-xs mt-1">
              {getDeadlineText(claim.guestResponseDeadline)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm whitespace-nowrap">
            {formatCurrency(claim.pendingAmount)}
          </span>
          {onViewClaim && (
            <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  )
}
