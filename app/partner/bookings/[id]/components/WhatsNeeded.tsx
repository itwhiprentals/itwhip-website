// app/partner/bookings/[id]/components/WhatsNeeded.tsx
// Extracted "What's Needed" checklist section from booking detail page

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoDownloadOutline,
  IoSendOutline,
} from 'react-icons/io5'

interface WhatsNeededProps {
  booking: {
    paymentType: string | null
    agreementStatus: string | null
    signerName?: string | null
    agreementSignedAt?: string | null
    agreementSignedPdfUrl?: string | null
    originalBookingId?: string | null
    vehicleAccepted?: boolean
  }
  guestInsurance: any
  partner: { stripeConnected: boolean } | null
  sendAgreement: () => void
}

export function WhatsNeeded({
  booking,
  guestInsurance,
  partner,
  sendAgreement,
}: WhatsNeededProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
        {t('bdWhatsNeeded')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insurance — guest-submitted */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-gray-200/70 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdInsurance')}</span>
            </div>
            {/* #13/#16 — Insurance is ALWAYS optional, never red */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
              guestInsurance?.provided
                ? 'bg-green-600 text-white'
                : 'bg-gray-400 text-white'
            }`}>
              {guestInsurance?.provided ? t('bdProvided') : t('bdOptional')}
            </span>
          </div>
          <div className="px-4 py-3">
            {guestInsurance?.provided ? (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{guestInsurance.provider}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t('bdPolicyNumber')}: {guestInsurance.policyNumber}
                </p>
                {guestInsurance.coverageType && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{guestInsurance.coverageType}</p>
                )}
                {guestInsurance.expiryDate && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t('bdExpires')}: {new Date(guestInsurance.expiryDate).toLocaleDateString()}
                  </p>
                )}
                {(guestInsurance.cardFrontUrl || guestInsurance.cardBackUrl) && (
                  <div className="flex gap-2 mt-1">
                    {guestInsurance.cardFrontUrl && (
                      <a href={guestInsurance.cardFrontUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">
                        {t('bdCardFront')}
                      </a>
                    )}
                    {guestInsurance.cardBackUrl && (
                      <a href={guestInsurance.cardBackUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">
                        {t('bdCardBack')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('bdGuestNoInsurance')}
              </p>
            )}
          </div>
        </div>

        {/* Agreement */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-gray-200/70 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <IoDocumentTextOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdAgreement')}</span>
            </div>
            {/* #13 — Cash: optional gray, Card: required red if not signed */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
              booking.agreementStatus === 'signed'
                ? 'bg-green-600 text-white'
                : booking.paymentType === 'CASH'
                  ? 'bg-gray-400 text-white'
                  : 'bg-red-500 text-white'
            }`}>
              {booking.agreementStatus === 'signed'
                ? t('bdSigned')
                : booking.paymentType === 'CASH'
                  ? t('bdOptional')
                  : t('bdRequired')}
            </span>
          </div>
          <div className="px-4 py-3">
            {booking.agreementStatus === 'signed' ? (
              <div className="space-y-2">
                {booking.signerName && booking.agreementSignedAt && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('bdSignedBy', { name: booking.signerName })}
                    <span className="hidden sm:inline"> · </span>
                    <br className="sm:hidden" />
                    {new Date(booking.agreementSignedAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {booking.agreementSignedPdfUrl && (
                  <a
                    href={booking.agreementSignedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-md text-xs font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                  >
                    <IoDownloadOutline className="w-3.5 h-3.5" />
                    {t('bdDownloadSignedAgreement')}
                  </a>
                )}
              </div>
            ) : (
              <>
                {booking.originalBookingId && booking.paymentType === 'CARD' && !booking.vehicleAccepted ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t('bdWaitingAcceptance')}
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? t('bdAwaitingSignature') : t('bdNotSentYet')}
                    </p>
                    <button
                      onClick={sendAgreement}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                    >
                      <IoSendOutline className="w-3.5 h-3.5" />
                      {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? t('bdResend') : t('bdSendForSignature')}
                    </button>
                  </>
                )}
                {booking.originalBookingId && booking.paymentType === 'CARD' && booking.vehicleAccepted && (
                  <p className="mt-1.5 text-[11px] text-green-600 dark:text-green-400">
                    {t('bdGuestAccepted')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stripe Connect / Bank Account */}
        <Link href="/partner/revenue" className="block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-shadow hover:shadow-md">
          <div className="px-4 py-3 flex items-center justify-between bg-gray-200/70 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <IoWalletOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdBankAccount')}</span>
            </div>
            {/* #13 — Cash: not required gray, Card: required red if not connected */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
              partner?.stripeConnected
                ? 'bg-green-600 text-white'
                : booking.paymentType === 'CASH'
                  ? 'bg-gray-400 text-white'
                  : 'bg-red-500 text-white'
            }`}>
              {partner?.stripeConnected
                ? t('bdConnected')
                : booking.paymentType === 'CASH'
                  ? t('bdNotRequired')
                  : t('bdNotConnected')}
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {partner?.stripeConnected
                ? t('bdBankConnected')
                : booking.paymentType === 'CASH'
                  ? t('bdBankNotRequiredCash')
                  : t('bdBankNotConnected')}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
