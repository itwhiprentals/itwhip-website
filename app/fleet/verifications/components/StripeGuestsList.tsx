// app/fleet/verifications/components/StripeGuestsList.tsx
// Full list of all guests who have gone through Stripe Identity verification
'use client'

import { useState } from 'react'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoCardOutline,
  IoLocationOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
} from 'react-icons/io5'
import type { StripeGuestProfile } from '../types'

interface StripeGuestsListProps {
  guests: StripeGuestProfile[]
  totalVerified: number
  totalProfiles: number
}

export default function StripeGuestsList({ guests, totalVerified, totalProfiles }: StripeGuestsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (guests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <IoCardOutline className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No Stripe Identity records found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <IoCheckmarkCircle className="text-green-500" />
          {totalVerified} verified
        </span>
        <span>{totalProfiles} total sessions</span>
      </div>

      {/* Guest rows */}
      {guests.map(g => {
        const expanded = expandedId === g.profileId
        const isVerified = g.stripe.verified
        const verifiedName = [g.stripe.verifiedFirstName, g.stripe.verifiedLastName].filter(Boolean).join(' ')

        return (
          <div
            key={g.profileId}
            className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
              isVerified
                ? 'border-blue-200 dark:border-blue-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Row header */}
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setExpandedId(expanded ? null : g.profileId)}
            >
              {/* Avatar */}
              {g.photoUrl ? (
                <img src={g.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <IoPersonOutline className="text-gray-400" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{g.name}</span>
                  <StatusPill status={g.stripe.status} />
                  {g.bookingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                      {g.bookingCount} booking{g.bookingCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>{g.email}</span>
                  {isVerified && verifiedName && (
                    <span className="text-blue-600 dark:text-blue-400">ID: {verifiedName}</span>
                  )}
                </div>
              </div>

              {/* Verified date */}
              <div className="text-right flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {g.stripe.verifiedAt ? (
                  <span className="flex items-center gap-1">
                    <IoCalendarOutline className="w-3.5 h-3.5" />
                    {new Date(g.stripe.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </div>

              {expanded
                ? <IoChevronUpOutline className="text-gray-400 flex-shrink-0" />
                : <IoChevronDownOutline className="text-gray-400 flex-shrink-0" />
              }
            </div>

            {/* Expanded details */}
            {expanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                {isVerified ? (
                  <VerifiedDetails guest={g} />
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Stripe Identity status: <strong>{g.stripe.status || 'unknown'}</strong></p>
                    {g.stripe.sessionId && (
                      <p className="font-mono text-xs mt-1">Session: {g.stripe.sessionId}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Status Pill ─────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string | null }) {
  if (!status) return null

  const config: Record<string, string> = {
    verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    requires_input: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config[status] || 'bg-gray-100 text-gray-500'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Not Extracted Label ─────────────────────────────────────────────────
function NotExtracted() {
  return (
    <span className="text-gray-400 dark:text-gray-500 italic font-normal">Not extracted by Stripe</span>
  )
}

// ─── Verified Details Grid ───────────────────────────────────────────────
function VerifiedDetails({ guest }: { guest: StripeGuestProfile }) {
  const s = guest.stripe

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isExpired = s.verifiedIdExpiry ? new Date(s.verifiedIdExpiry) < new Date() : false

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <DetailCell
          icon={<IoPersonOutline className="text-blue-500" />}
          label="Verified Name"
          value={[s.verifiedFirstName, s.verifiedLastName].filter(Boolean).join(' ') || <NotExtracted />}
        />
        <DetailCell
          icon={<IoCalendarOutline className="text-blue-500" />}
          label="Date of Birth"
          value={formatDate(s.verifiedDob) || <NotExtracted />}
        />
        <DetailCell
          icon={<IoCardOutline className="text-blue-500" />}
          label="DL Number"
          value={s.verifiedIdNumber || <NotExtracted />}
          mono={!!s.verifiedIdNumber}
        />
        <DetailCell
          icon={<IoTimeOutline className={isExpired ? 'text-red-500' : 'text-blue-500'} />}
          label="DL Expiry"
          value={
            s.verifiedIdExpiry ? (
              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                {formatDate(s.verifiedIdExpiry)}
                {isExpired && ' (Expired)'}
              </span>
            ) : <NotExtracted />
          }
        />
        <DetailCell
          icon={<IoCalendarOutline className="text-blue-500" />}
          label="Verified At"
          value={formatDate(s.verifiedAt) || '—'}
        />
        <DetailCell
          icon={<IoCardOutline className="text-blue-500" />}
          label="Document Type"
          value={<span className="capitalize">{s.documentType?.replace(/_/g, ' ') || 'driving license'}</span>}
        />
        {s.verifiedAddress && (
          <DetailCell
            icon={<IoLocationOutline className="text-blue-500" />}
            label="Address"
            value={s.verifiedAddress}
            span2
          />
        )}
        {s.reportId && (
          <DetailCell
            icon={<IoCardOutline className="text-gray-400" />}
            label="Report ID"
            value={s.reportId}
            mono
            span2
          />
        )}
      </div>
      {/* Info note about Stripe extraction limits */}
      {(!s.verifiedDob || !s.verifiedIdNumber || !s.verifiedIdExpiry) && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Some fields weren&apos;t extracted by Stripe for this verification. Future verifications will request full document data. Claude AI verification can fill in missing fields from the DL image.
        </p>
      )}
    </div>
  )
}

// ─── Detail Cell ─────────────────────────────────────────────────────────
function DetailCell({
  icon, label, value, mono, span2,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
  span2?: boolean
}) {
  return (
    <div className={`flex items-start gap-1.5 ${span2 ? 'col-span-2' : ''}`}>
      <span className="w-3.5 h-3.5 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-gray-900 dark:text-white font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}
