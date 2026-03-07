// app/partner/bookings/[id]/components/CustomerSection.tsx
// Extracted customer/guest section from booking detail page

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5'
import { formatPhoneNumber } from '@/app/utils/helpers'

interface Renter {
  id: string
  name: string
  email: string
  phone: string | null
  photo: string | null
  memberSince: string | null
  reviewerProfileId: string | null
  manuallyVerifiedByHost?: boolean
  verification: {
    identity: {
      status: string
      verifiedAt: string | null
      verifiedName: string | null
      verifiedDOB: string | null
      verifiedAddress: string | null
    }
    email: {
      verified: boolean
      verifiedAt: string | null
    }
    phone: {
      verified: boolean
    }
    documents?: {
      verified: boolean
      verifiedAt: string | null
      verifiedBy: string | null
    }
    adminOverride?: {
      isVerified: boolean
      fullyVerified: boolean
    }
  }
}

interface GuestHistory {
  totalBookings: number
  totalSpent: number
  bookings: { id: string }[]
  reviews: { id: string }[]
}

interface CustomerSectionProps {
  renter: Renter
  booking: {
    id: string
    status: string
    paymentStatus: string
    paymentType: string | null
    guestStripeVerified: boolean
    verificationMethod?: string | null
    onboardingCompletedAt?: string | null
    agreementStatus?: string | null
  }
  isGuestDriven: boolean
  isManualBooking: boolean
  guestInsurance: any
  guestHistory: GuestHistory | null
  vehicle: { instantBook: boolean } | null
  activeTooltip: string | null
  setActiveTooltip: (tooltip: string | null) => void
  setShowOnboardModal: (show: boolean) => void
  setConfirmAction: (action: {
    title: string
    message: string
    onConfirm: () => void
    isDangerous?: boolean
  } | null) => void
  verifyGuest: () => void
  verifyingGuest: boolean
  formatCurrency: (amount: number) => string
}

export function CustomerSection({
  renter,
  booking,
  isGuestDriven,
  isManualBooking,
  guestInsurance,
  guestHistory,
  vehicle,
  activeTooltip,
  setActiveTooltip,
  setShowOnboardModal,
  setConfirmAction,
  verifyGuest,
  verifyingGuest,
  formatCurrency,
}: CustomerSectionProps) {
  const t = useTranslations('PartnerBookings')

  const isVerified = booking.guestStripeVerified
    || renter.verification.identity.status === 'verified'
    || renter.verification.adminOverride?.isVerified
    || renter.verification.adminOverride?.fullyVerified
    || renter.verification.documents?.verified
    || renter.manuallyVerifiedByHost

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {renter.photo ? (
            <div className="w-14 h-14 rounded-full border border-white shadow-sm overflow-hidden">
              <img
                src={renter.photo}
                alt={renter.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
              <IoPersonOutline className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white">{renter.name}</h3>
              <div className="relative group">
                {isVerified ? (
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600 dark:text-green-400 cursor-pointer" />
                ) : (
                  <IoShieldOutline className="w-4 h-4 text-red-500 dark:text-red-400 cursor-pointer" />
                )}
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
                  {isVerified ? t('bdVerified') : t('bdNotVerified')}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
                </div>
              </div>
            </div>
            {/* Guest-driven: hide direct contact — host communicates via platform */}
            {!isGuestDriven ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <IoMailOutline className="w-4 h-4" />
                  {renter.email}
                </div>
                {renter.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCallOutline className="w-4 h-4" />
                    +1 {formatPhoneNumber(renter.phone)}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('bdContactViaPlatform')}
              </p>
            )}
            {renter.memberSince && (
              <p className="text-xs text-gray-400 mt-1">
                {t('bdMemberSince')} {new Date(renter.memberSince).toLocaleDateString()}
              </p>
            )}
            {guestHistory && (
              <p className="text-xs text-gray-400 mt-0.5">
                {guestHistory.totalBookings} {t('bdBookingsLabel', { count: guestHistory.totalBookings })} · {formatCurrency(guestHistory.totalSpent)} {t('bdSpentLabel')}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
            ACTIVE MEMBER
          </span>
        </div>
      </div>

      {/* Guest Status Badges + View Profile */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Insured Badge — insurance is ALWAYS optional, never red */}
        {(() => {
          const isCovered = guestInsurance?.provided
          return (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'insured' ? null : 'insured') }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                  isCovered
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <IoShieldOutline className="w-3 h-3" />
                {isCovered ? t('bdInsured') : t('bdInsuranceNotProvided')}
              </button>
              {activeTooltip === 'insured' && (
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                  <p className="font-semibold mb-1">{isCovered ? t('bdInsuranceCoverage') : t('bdInsuranceNotCovered')}</p>
                  <p>{isCovered ? t('bdInsuranceCoverageDesc') : t('bdInsuranceNotCoveredDesc')}</p>
                  <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                </div>
              )}
            </div>
          )
        })()}

        {/* Payment Badge — standard bookings only (manual shows payment in header) */}
        {isGuestDriven && !isManualBooking && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'payment' ? null : 'payment') }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              <IoWalletOutline className="w-3 h-3" />
              {booking.paymentStatus === 'PAID' ? t('bdPaymentCharged') : t('bdPaymentHold')}
            </button>
            {activeTooltip === 'payment' && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                <p className="font-semibold mb-1">
                  {booking.paymentStatus === 'PAID' ? t('bdPaymentCapturedTitle') : t('bdPaymentOnHold')}
                </p>
                <p>{booking.paymentStatus === 'PAID' ? t('bdPaymentCapturedDesc') : t('bdPaymentOnHoldDesc')}</p>
                <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
              </div>
            )}
          </div>
        )}

        {/* Onboard Badge — standard bookings only (no onboarding in manual bookings) */}
        {isGuestDriven && !isManualBooking && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (booking.onboardingCompletedAt) {
                  setShowOnboardModal(true)
                } else {
                  setActiveTooltip(activeTooltip === 'onboard' ? null : 'onboard')
                }
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                booking.onboardingCompletedAt
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              {booking.onboardingCompletedAt
                ? <IoCheckmarkCircleOutline className="w-3 h-3" />
                : <IoCloseCircleOutline className="w-3 h-3" />
              }
              {booking.onboardingCompletedAt ? t('bdOnboarded') : t('bdNotOnboarded')}
            </button>
            {activeTooltip === 'onboard' && !booking.onboardingCompletedAt && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                <p className="font-semibold mb-1">{t('bdOnboardingPending')}</p>
                <p>{t('bdOnboardingPendingDesc')}</p>
                <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
              </div>
            )}
          </div>
        )}

        {/* View Profile — far right, matches View Vehicle style */}
        <Link
          href={`/partner/customers/${renter.id}`}
          className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {t('bdViewProfile')} →
        </Link>
      </div>
    </div>
  )
}
