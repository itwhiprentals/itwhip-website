// app/fleet/guests/[id]/banking/components/ClaimAlertBanner.tsx
'use client'

import { IoWarningOutline, IoLockClosedOutline, IoTimeOutline } from 'react-icons/io5'
import { ActiveClaim, formatCurrency, formatDate } from '../types'

interface ClaimAlertBannerProps {
  activeClaims: ActiveClaim[]
  totalClaimAmount: number
}

export function ClaimAlertBanner({ activeClaims, totalClaimAmount }: ClaimAlertBannerProps) {
  if (activeClaims.length === 0) return null

  // Find the most urgent claim (one with closest response deadline)
  const urgentClaim = activeClaims.find(c => c.guestResponseDeadline)
  const hoursRemaining = urgentClaim?.guestResponseDeadline
    ? Math.max(0, Math.floor((new Date(urgentClaim.guestResponseDeadline).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
      <div className="flex items-start gap-3">
        <IoWarningOutline className="text-xl text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-red-800 dark:text-red-200">
              {activeClaims.length} Active Claim{activeClaims.length > 1 ? 's' : ''}
            </span>
            <span className="text-sm px-2 py-0.5 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-full flex items-center gap-1">
              <IoLockClosedOutline className="text-xs" />
              Card Locked
            </span>
          </div>

          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Total pending: <span className="font-semibold">{formatCurrency(totalClaimAmount)}</span>
          </p>

          {/* Urgent deadline warning */}
          {hoursRemaining !== null && hoursRemaining <= 48 && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <IoTimeOutline className="text-orange-600" />
              <span className={`${hoursRemaining <= 24 ? 'text-red-700 font-medium' : 'text-orange-700'}`}>
                Response deadline: {hoursRemaining}h remaining
              </span>
            </div>
          )}

          {/* Claim details */}
          <div className="mt-3 space-y-2">
            {activeClaims.map(claim => (
              <div
                key={claim.id}
                className="text-sm p-2 bg-red-100/50 dark:bg-red-900/30 rounded"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-medium text-red-800 dark:text-red-200">
                    {claim.type.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-red-700 dark:text-red-300">
                    {formatCurrency(claim.approvedAmount || claim.estimatedCost)}
                  </span>
                </div>
                <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">
                  {claim.carDetails} • {claim.bookingCode}
                </p>
                <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${
                  claim.status === 'APPROVED' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200' :
                  claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
