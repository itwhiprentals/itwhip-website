// app/partner/bookings/[id]/components/VerificationSection.tsx
// Extracted verification status section for manual bookings

'use client'

import { useTranslations } from 'next-intl'
import {
  IoShieldOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoSendOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
} from 'react-icons/io5'

interface Renter {
  verification: {
    identity: {
      status: string
      verifiedAt: string | null
      verifiedName: string | null
    }
    email: { verified: boolean }
    phone: { verified: boolean }
  }
}

interface VerificationSectionProps {
  renter: Renter
  booking: { paymentType: string | null }
  isManualBooking: boolean
  expanded: boolean
  onToggle: () => void
  sendVerificationRequest: () => void
  sendingVerification: boolean
  getVerificationStatusColor: (status: string) => string
  onLearnMoreVerification?: () => void
}

export function VerificationSection({
  renter,
  booking,
  isManualBooking,
  expanded,
  onToggle,
  sendVerificationRequest,
  sendingVerification,
  getVerificationStatusColor,
  onLearnMoreVerification,
}: VerificationSectionProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoShieldOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdGuestVerification')}</h3>
          {renter.verification.identity.status === 'verified' ? (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t('bdVerified')}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {t('bdPending')}
            </span>
          )}
        </div>
        {expanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Identity Verification */}
          <div className={`p-4 rounded-lg ${
            renter.verification.identity.status === 'verified'
              ? 'bg-green-50 dark:bg-green-900/20'
              : renter.verification.identity.status === 'pending'
              ? 'bg-yellow-50 dark:bg-yellow-900/20'
              : 'bg-gray-50 dark:bg-gray-700/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{t('bdIdentityVerification')}</span>
              <span className={`flex items-center gap-1 ${getVerificationStatusColor(renter.verification.identity.status)}`}>
                {renter.verification.identity.status === 'verified' ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                ) : renter.verification.identity.status === 'pending' ? (
                  <IoTimeOutline className="w-5 h-5" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5" />
                )}
                {renter.verification.identity.status === 'verified' ? t('bdVerified') :
                 renter.verification.identity.status === 'pending' ? t('bdPending') :
                 renter.verification.identity.status === 'failed' ? t('bdFailed') : t('bdNotStarted')}
              </span>
            </div>

            {renter.verification.identity.status === 'verified' && (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {renter.verification.identity.verifiedName && (
                  <p>{t('bdName')}: {renter.verification.identity.verifiedName}</p>
                )}
                {renter.verification.identity.verifiedAt && (
                  <p>{t('bdVerified')}: {new Date(renter.verification.identity.verifiedAt).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {renter.verification.identity.status !== 'verified' && (
              isManualBooking && !booking.paymentType ? (
                <div className="mt-3">
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <IoTimeOutline className="w-4 h-4" />
                    {t('bdSendVerificationLink')}
                  </button>
                  <p className="text-xs text-gray-400 mt-1 text-center">{t('bdVerificationDisabledUntilPayment')}</p>
                </div>
              ) : (
                <button
                  onClick={sendVerificationRequest}
                  disabled={sendingVerification}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {sendingVerification ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoSendOutline className="w-4 h-4" />
                  )}
                  {t('bdSendVerificationLink')}
                </button>
              )
            )}
          </div>

          {/* Email & Phone Verification */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              renter.verification.email.verified
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdEmail')}</span>
                {renter.verification.email.verified ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              renter.verification.phone.verified
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdPhone')}</span>
                {renter.verification.phone.verified ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Learn more about guest verification */}
          {onLearnMoreVerification && (
            <button
              onClick={(e) => { e.stopPropagation(); onLearnMoreVerification() }}
              className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
            >
              {t('bdVerificationLearnMore')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
