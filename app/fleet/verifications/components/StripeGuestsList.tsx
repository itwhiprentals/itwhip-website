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
  IoImageOutline,
  IoClose,
} from 'react-icons/io5'
import type { StripeGuestProfile } from '../types'

interface StripeGuestsListProps {
  guests: StripeGuestProfile[]
  totalVerified: number
  totalProfiles: number
}

const FLEET_KEY = 'phoenix-fleet-2847'
const stripeFileUrl = (fileId: string) => `/fleet/api/stripe-file?key=${FLEET_KEY}&id=${fileId}`

export default function StripeGuestsList({ guests, totalVerified, totalProfiles }: StripeGuestsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

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
      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxUrl(null)}>
            <IoClose className="w-8 h-8" />
          </button>
          <img src={lightboxUrl} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}

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
                  <VerifiedDetails guest={g} onViewPhoto={setLightboxUrl} />
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
function VerifiedDetails({ guest, onViewPhoto }: { guest: StripeGuestProfile; onViewPhoto: (url: string) => void }) {
  const s = guest.stripe

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Use Stripe-extracted data with fallback to profile fields
  const dob = s.verifiedDob || guest.dateOfBirth
  const dlNumber = s.verifiedIdNumber || guest.driverLicenseNumber
  const dlExpiry = s.verifiedIdExpiry || guest.driverLicenseExpiry
  const isExpired = dlExpiry ? new Date(dlExpiry) < new Date() : false

  return (
    <div className="space-y-3">
      {/* ID Photos */}
      {(s.docFrontFileId || s.docBackFileId || s.selfieFileId) && (
        <div className="grid grid-cols-3 gap-2">
          <StripePhotoThumb label="ID Front" fileId={s.docFrontFileId} onView={onViewPhoto} />
          <StripePhotoThumb label="ID Back" fileId={s.docBackFileId} onView={onViewPhoto} />
          <StripePhotoThumb label="Selfie" fileId={s.selfieFileId} onView={onViewPhoto} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <DetailCell
          icon={<IoPersonOutline className="text-blue-500" />}
          label="Verified Name"
          value={[s.verifiedFirstName, s.verifiedLastName].filter(Boolean).join(' ') || <NotExtracted />}
        />
        <DetailCell
          icon={<IoCalendarOutline className="text-blue-500" />}
          label="Date of Birth"
          value={
            dob ? (
              <span>
                {formatDate(dob)}
                {!s.verifiedDob && guest.dateOfBirth && <SourceBadge label="Profile" />}
              </span>
            ) : <NotExtracted />
          }
        />
        <DetailCell
          icon={<IoCardOutline className="text-blue-500" />}
          label="DL Number"
          value={
            dlNumber ? (
              <span>
                {dlNumber}
                {!s.verifiedIdNumber && guest.driverLicenseNumber && <SourceBadge label="Profile" />}
              </span>
            ) : <NotExtracted />
          }
          mono={!!dlNumber}
        />
        <DetailCell
          icon={<IoTimeOutline className={isExpired ? 'text-red-500' : 'text-blue-500'} />}
          label="DL Expiry"
          value={
            dlExpiry ? (
              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                {formatDate(dlExpiry)}
                {isExpired && ' (Expired)'}
                {!s.verifiedIdExpiry && guest.driverLicenseExpiry && <SourceBadge label="Profile" />}
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
    </div>
  )
}

// ─── Source Badge (shows when data comes from profile, not Stripe) ───────
function SourceBadge({ label }: { label: string }) {
  return (
    <span className="ml-1 px-1 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      {label}
    </span>
  )
}

// ─── Stripe Photo Thumbnail ──────────────────────────────────────────────
function StripePhotoThumb({ label, fileId, onView }: { label: string; fileId: string | null; onView: (url: string) => void }) {
  const [errored, setErrored] = useState(false)

  if (!fileId) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
        <IoImageOutline className="w-6 h-6 text-gray-400 mb-1" />
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] text-gray-400">N/A</span>
      </div>
    )
  }

  if (errored) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
        <IoTimeOutline className="w-6 h-6 text-amber-400 mb-1" />
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] text-amber-500">Expired</span>
      </div>
    )
  }

  const url = stripeFileUrl(fileId)
  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
      onClick={() => onView(url)}
    >
      <img
        src={url}
        alt={label}
        className="w-full h-24 object-cover"
        loading="lazy"
        onError={() => setErrored(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
        <span className="text-[10px] text-white bg-black/50 w-full text-center py-0.5">{label}</span>
      </div>
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
