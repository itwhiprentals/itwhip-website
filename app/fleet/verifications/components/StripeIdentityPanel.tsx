// app/fleet/verifications/components/StripeIdentityPanel.tsx
// Displays Stripe Identity verification data for a booking's guest
'use client'

import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPersonOutline,
  IoCardOutline,
  IoCalendarOutline,
  IoLocationOutline,
} from 'react-icons/io5'

interface StripeData {
  status: string | null
  verified: boolean
  verifiedAt: string | null
  reportId: string | null
  verifiedFirstName: string | null
  verifiedLastName: string | null
  verifiedDob: string | null
  verifiedIdNumber: string | null
  verifiedIdExpiry: string | null
  verifiedAddress: string | null
  profileName: string | null
  profileEmail: string | null
  fullyVerified: boolean | null
}

interface StripeIdentityPanelProps {
  stripe: StripeData | null
  guestName: string | null
  formatTimeAgo: (d: string | null) => string
}

export default function StripeIdentityPanel({ stripe, guestName, formatTimeAgo }: StripeIdentityPanelProps) {
  if (!stripe) {
    return (
      <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <IoCardOutline />
          <span>No Stripe Identity — guest has no account</span>
        </div>
      </div>
    )
  }

  if (!stripe.verified) {
    const statusLabel =
      stripe.status === 'pending' ? 'Pending' :
      stripe.status === 'requires_input' ? 'Requires Input' :
      stripe.status === 'canceled' ? 'Canceled' :
      stripe.status || 'Not Started'

    const statusColor =
      stripe.status === 'pending' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
      stripe.status === 'requires_input' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
      'text-gray-500 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'

    return (
      <div className={`rounded-lg p-3 border ${statusColor}`}>
        <div className="flex items-center gap-1.5 text-xs">
          <IoCardOutline />
          <span className="font-medium">Stripe Identity: {statusLabel}</span>
        </div>
      </div>
    )
  }

  // Verified — show full data
  const verifiedName = [stripe.verifiedFirstName, stripe.verifiedLastName].filter(Boolean).join(' ')
  const nameMatches = verifiedName && guestName
    ? verifiedName.toLowerCase() === guestName.toLowerCase() ||
      guestName.toLowerCase().includes(stripe.verifiedFirstName?.toLowerCase() || '') &&
      guestName.toLowerCase().includes(stripe.verifiedLastName?.toLowerCase() || '')
    : null

  const formatDob = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatExpiry = (d: string | null) => {
    if (!d) return '—'
    const date = new Date(d)
    const now = new Date()
    const expired = date < now
    return (
      <span className={expired ? 'text-red-600' : ''}>
        {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        {expired && ' (Expired)'}
      </span>
    )
  }

  return (
    <div className="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
          <IoCardOutline />
          Stripe Identity Verified
        </h4>
        <div className="flex items-center gap-2">
          {stripe.reportId && (
            <span className="text-xs text-gray-400 font-mono">{stripe.reportId.slice(0, 12)}...</span>
          )}
          {stripe.verifiedAt && (
            <span className="text-xs text-gray-400">{formatTimeAgo(stripe.verifiedAt)}</span>
          )}
        </div>
      </div>

      {/* Verified data grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* Name */}
        <div className="flex items-start gap-1.5">
          <IoPersonOutline className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 dark:text-gray-400">Verified Name</p>
            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              {verifiedName || '—'}
              {nameMatches !== null && (
                nameMatches
                  ? <IoCheckmarkCircle className="text-green-500 w-3.5 h-3.5" />
                  : <IoCloseCircle className="text-red-500 w-3.5 h-3.5" />
              )}
            </p>
          </div>
        </div>

        {/* DOB */}
        <div className="flex items-start gap-1.5">
          <IoCalendarOutline className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 dark:text-gray-400">Date of Birth</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatDob(stripe.verifiedDob)}</p>
          </div>
        </div>

        {/* ID Number */}
        <div className="flex items-start gap-1.5">
          <IoCardOutline className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 dark:text-gray-400">ID Number</p>
            <p className="font-medium text-gray-900 dark:text-white font-mono">
              {stripe.verifiedIdNumber || '—'}
            </p>
          </div>
        </div>

        {/* ID Expiry */}
        <div className="flex items-start gap-1.5">
          <IoCalendarOutline className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 dark:text-gray-400">ID Expiry</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatExpiry(stripe.verifiedIdExpiry)}
            </p>
          </div>
        </div>

        {/* Address */}
        {stripe.verifiedAddress && (
          <div className="flex items-start gap-1.5 col-span-2">
            <IoLocationOutline className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Verified Address</p>
              <p className="font-medium text-gray-900 dark:text-white">{stripe.verifiedAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* Comparison with booking name */}
      {verifiedName && guestName && nameMatches === false && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
          <strong>Name mismatch:</strong> Stripe verified &ldquo;{verifiedName}&rdquo; but booking says &ldquo;{guestName}&rdquo;
        </div>
      )}
    </div>
  )
}
