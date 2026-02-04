// app/fleet/guests/[id]/banking/components/LockedPaymentMethodBadge.tsx
'use client'

import { IoLockClosedOutline } from 'react-icons/io5'

interface LockedPaymentMethodBadgeProps {
  reason: 'booking' | 'claim'
  bookingCode?: string
}

export function LockedPaymentMethodBadge({ reason, bookingCode }: LockedPaymentMethodBadgeProps) {
  if (reason === 'claim') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
        <IoLockClosedOutline className="text-sm" />
        Locked (Claim)
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
      <IoLockClosedOutline className="text-sm" />
      Locked {bookingCode ? `(${bookingCode})` : '(Active Booking)'}
    </span>
  )
}
