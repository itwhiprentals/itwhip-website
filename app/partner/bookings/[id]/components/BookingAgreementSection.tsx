// app/partner/bookings/[id]/components/BookingAgreementSection.tsx
// Extracted agreement section from ManualBookingView
// Handles agreement preference display, status banners, and send/preview/download actions

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoSendOutline
} from 'react-icons/io5'
import AgreementPreferenceStep from '@/app/partner/requests/[id]/components/AgreementPreferenceStep'

// ─── Interfaces ───────────────────────────────────────────────

interface BookingAgreementData {
  id: string
  agreementStatus: string | null
  agreementSentAt: string | null
  agreementSignedAt: string | null
  agreementSignedPdfUrl: string | null
  signerName: string | null
  dailyRate: number
  startDate: string
  endDate: string
  numberOfDays: number
  totalAmount: number
  subtotal: number
  pickupLocation: string
  guestName: string
  recruitmentAgreementPreference: string | null
}

interface BookingAgreementSectionProps {
  booking: BookingAgreementData
  renterName: string | null
  partnerName: string | null
  partnerEmail: string | null
  commissionRate: number
  onRefresh: () => void
  showToast: (type: 'success' | 'error', message: string) => void
}

// ─── Component ────────────────────────────────────────────────

export default function BookingAgreementSection({
  booking,
  renterName,
  partnerName,
  partnerEmail,
  commissionRate,
  onRefresh,
  showToast
}: BookingAgreementSectionProps) {
  const t = useTranslations('PartnerBookings')

  const [expanded, setExpanded] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)
  const [agreementPref, setAgreementPref] = useState(booking.recruitmentAgreementPreference || 'ITWHIP')
  const [existingAgreement, setExistingAgreement] = useState<{
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
    sections?: unknown[] | null
  } | undefined>(undefined)

  // Fetch existing agreement data (URL, sections, etc.)
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/agreement')
        if (res.ok) {
          const data = await res.json()
          if (data.agreement?.url) {
            setExistingAgreement({
              url: data.agreement.url,
              fileName: data.agreement.fileName,
              validationScore: data.agreement.validationScore,
              validationSummary: data.agreement.validationSummary,
              sections: data.agreement.sections || null
            })
          }
        }
      } catch {
        // Non-critical
      }
    }
    fetchAgreement()
  }, [])

  const sendAgreement = async () => {
    setSendingAgreement(true)
    try {
      const res = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', data.message || t('bdAgreementSentSuccess'))
        onRefresh()
      } else if (data.status === 'already_signed') {
        showToast('success', t('bdAgreementAlreadySigned'))
        onRefresh()
      } else {
        showToast('error', data.error || t('bdFailedSendAgreement'))
      }
    } catch {
      showToast('error', t('bdFailedSendAgreement'))
    } finally {
      setSendingAgreement(false)
    }
  }

  // For OWN: preview opens partner's uploaded PDF directly (fetched at send time)
  const getPreviewUrl = () => {
    if (agreementPref === 'OWN') {
      // OWN partners don't have ItWhip preview — they manage their own PDF
      return null
    }
    return `/api/agreements/preview?bookingId=${booking.id}`
  }

  const previewUrl = getPreviewUrl()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalAgreement')}</h3>
          {booking.agreementStatus === 'signed' ? (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('bdSigned')}</span>
          ) : booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {booking.agreementStatus === 'viewed' ? t('bdViewed') : t('bdSent')}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{t('bdNotSent')}</span>
          )}
          {agreementPref === 'OWN' && (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">OWN</span>
          )}
          {agreementPref === 'BOTH' && (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">ITWHIP + OWN</span>
          )}
        </div>
        {expanded ? <IoChevronUpOutline className="w-5 h-5 text-gray-400" /> : <IoChevronDownOutline className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Signed Banner + Download */}
          {booking.agreementStatus === 'signed' && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('bdAgreementSigned')}</p>
                <span className="text-xs text-green-600 dark:text-green-400">
                  — {t('bdSignedByOn', { name: booking.signerName || '', date: booking.agreementSignedAt ? new Date(booking.agreementSignedAt).toLocaleDateString() : 'N/A' })}
                </span>
              </div>
              {booking.agreementSignedPdfUrl && (
                <a
                  href={booking.agreementSignedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                >
                  <IoDownloadOutline className="w-3.5 h-3.5" />
                  {t('bdDownloadSignedAgreement')}
                </a>
              )}
            </div>
          )}

          {/* Awaiting Signature Banner */}
          {(booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed') && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {booking.agreementStatus === 'viewed' ? t('bdCustomerReviewing') : t('bdAwaitingSignature')}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t('bdSentOn', { date: booking.agreementSentAt ? new Date(booking.agreementSentAt).toLocaleDateString() : 'N/A' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agreement Preference — same as onboarding, no save button */}
          <AgreementPreferenceStep
            hideButton
            initialPreference={agreementPref as 'ITWHIP' | 'OWN' | 'BOTH'}
            onSelectionChange={(pref) => setAgreementPref(pref)}
            onComplete={() => {}}
            existingAgreement={existingAgreement}
            requestData={{
              id: booking.id,
              guestName: renterName || booking.guestName || null,
              offeredRate: booking.dailyRate,
              startDate: booking.startDate,
              endDate: booking.endDate,
              durationDays: booking.numberOfDays,
              pickupCity: booking.pickupLocation?.split(',')[0]?.trim() || null,
              pickupState: booking.pickupLocation?.split(',')[1]?.trim() || null,
              totalAmount: booking.totalAmount,
              hostEarnings: booking.subtotal - (booking.subtotal * commissionRate)
            }}
            hostName={partnerName || undefined}
            hostEmail={partnerEmail || undefined}
          />

          {/* Agreement Actions — Preview / Send (shown when not yet signed) */}
          {booking.agreementStatus !== 'signed' && (
            <div className="flex flex-wrap gap-3 mt-4">
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoEyeOutline className="w-4 h-4" />
                  {t('bdPreview')}
                </a>
              )}
              <button
                onClick={sendAgreement}
                disabled={sendingAgreement}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center gap-2"
              >
                {sendingAgreement ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoSendOutline className="w-4 h-4" />
                )}
                {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed'
                  ? t('bdResendAgreement') : t('bdSendForSignature')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
