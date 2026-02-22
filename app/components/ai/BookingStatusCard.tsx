'use client'

import {
  IoClose,
  IoCarSportOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoWarning,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoFlash,
} from 'react-icons/io5'
import { useTranslations } from 'next-intl'
import type { BookingData } from '@/app/lib/ai-booking/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookingStatusCardProps {
  bookings: BookingData[]
  onDismiss?: () => void
}

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  CONFIRMED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  ON_HOLD: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  ACTIVE: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  CANCELLED: { bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-500 dark:text-gray-500', dot: 'bg-gray-400' },
}

const VERIFICATION_STYLES: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  APPROVED: { icon: <IoCheckmarkCircle size={12} />, label: 'Verified', color: 'text-emerald-600 dark:text-emerald-400' },
  SUBMITTED: { icon: <IoTimeOutline size={12} />, label: 'Processing', color: 'text-blue-600 dark:text-blue-400' },
  PENDING: { icon: <IoWarning size={12} />, label: 'Pending', color: 'text-amber-600 dark:text-amber-400' },
  REJECTED: { icon: <IoWarning size={12} />, label: 'Rejected', color: 'text-red-600 dark:text-red-400' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return '—'
  return `$${Number(amount).toFixed(2)}`
}

/** Convert STATUS_CODE to ALL CAPS display: ON_HOLD → ON HOLD */
function formatStatus(status: string): string {
  return status.replace(/_/g, ' ')
}

// ---------------------------------------------------------------------------
// Single booking row
// ---------------------------------------------------------------------------

function BookingRow({ booking, t }: { booking: BookingData; t: ReturnType<typeof useTranslations> }) {
  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING
  const verificationStyle = VERIFICATION_STYLES[booking.verificationStatus] || VERIFICATION_STYLES.PENDING

  return (
    <div className="relative border border-gray-100 dark:border-gray-700/50 rounded-lg overflow-hidden">
      {/* Status accent — left border colored by booking status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStyle.dot}`} />

      <div className="pl-4 pr-3 py-3 space-y-2">
        {/* Top row: booking code + status badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
            {booking.bookingCode}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {formatStatus(booking.status)}
          </span>
        </div>

        {/* Vehicle */}
        {booking.car && (
          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
            <IoCarSportOutline size={13} className="text-gray-400 flex-shrink-0" />
            <span className="font-medium">
              {booking.car.year} {booking.car.make} {booking.car.model}
            </span>
            {booking.car.instantBook && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-primary font-medium">
                <IoFlash size={10} /> Instant
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <IoCalendarOutline size={13} className="text-gray-400 flex-shrink-0" />
          <span>{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</span>
          {booking.numberOfDays && (
            <span className="text-gray-400">({booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'})</span>
          )}
        </div>

        {/* Financial row */}
        <div className="flex items-center gap-3 text-xs">
          <IoWalletOutline size={13} className="text-gray-400 flex-shrink-0" />
          {booking.dailyRate !== null && (
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(booking.dailyRate)}<span className="text-gray-400">/day</span>
            </span>
          )}
          {booking.totalAmount !== null && (
            <span className="font-semibold text-gray-900 dark:text-white">
              {t('bookingTotal')}: {formatCurrency(booking.totalAmount)}
            </span>
          )}
          {booking.depositAmount !== null && Number(booking.depositAmount) > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              {t('bookingDeposit')}: {formatCurrency(booking.depositAmount)}
            </span>
          )}
        </div>

        {/* Verification status */}
        <div className="flex items-center gap-1.5 text-xs">
          <IoShieldCheckmarkOutline size={13} className="text-gray-400 flex-shrink-0" />
          <span className={`inline-flex items-center gap-1 font-medium ${verificationStyle.color}`}>
            {verificationStyle.icon}
            {t('bookingVerification')}: {verificationStyle.label}
          </span>
        </div>

        {/* Hold reason warning */}
        {booking.holdReason && (
          <div className="flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
            <IoWarning size={13} className="flex-shrink-0 mt-0.5" />
            <span>{t('bookingHoldReason')}: {formatStatus(booking.holdReason)}</span>
          </div>
        )}

        {/* Trip status (if active) */}
        {booking.tripStatus && booking.tripStatus !== 'NOT_STARTED' && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium pl-5">
            Trip: {formatStatus(booking.tripStatus)}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BookingStatusCard({ bookings, onDismiss }: BookingStatusCardProps) {
  const t = useTranslations('ChoeAI')

  if (!bookings || bookings.length === 0) return null

  // Stripe identity status (same for all bookings from same guest)
  const identityStatus = bookings[0]?.stripeIdentityStatus

  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {t('bookingStatusTitle')}
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Dismiss"
          >
            <IoClose size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Identity verification banner */}
      {identityStatus && identityStatus !== 'verified' && (
        <div className="mx-4 mb-2 flex flex-col items-center text-center py-1.5 text-amber-600 dark:text-amber-400">
          <IoWarning size={15} className="mb-1" />
          <span className="text-[11px] font-medium">
            {identityStatus === 'requires_input'
              ? t('bookingIdentityIncomplete')
              : identityStatus === 'processing'
              ? t('bookingIdentityProcessing')
              : t('bookingIdentityNotStarted')}
          </span>
          {identityStatus !== 'processing' && (
            <span className="text-[10px] text-amber-500 dark:text-amber-500 mt-0.5">
              {t('bookingIdentityAction')}
            </span>
          )}
        </div>
      )}

      {/* Booking list */}
      <div className="px-4 pb-3 space-y-2">
        {bookings.map((b) => (
          <BookingRow key={b.bookingCode} booking={b} t={t} />
        ))}
      </div>
    </div>
  )
}
