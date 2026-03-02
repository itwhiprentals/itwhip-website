'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoDocumentTextOutline,
  IoChevronUpOutline,
  IoChevronDownOutline
} from 'react-icons/io5'
import AgreementPreferenceStep from './AgreementPreferenceStep'

interface RentalAgreementCardProps {
  agreementUploaded: boolean
  agreementPreference: string | null
  expanded: boolean
  onToggle: () => void
  onRefresh: () => void
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
    sections?: unknown[] | null
  }
  requestData: {
    id: string
    guestName: string | null
    offeredRate: number | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    pickupCity: string | null
    pickupState: string | null
    totalAmount: number | null
    hostEarnings: number | null
  }
  hostName?: string
  hostEmail?: string
}

export default function RentalAgreementCard({
  agreementUploaded,
  agreementPreference,
  expanded,
  onToggle,
  onRefresh,
  existingAgreement,
  requestData,
  hostName,
  hostEmail,
}: RentalAgreementCardProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [agreementPref, setAgreementPref] = useState<'ITWHIP' | 'OWN' | 'BOTH'>(
    (agreementPreference as 'ITWHIP' | 'OWN' | 'BOTH') || 'ITWHIP'
  )
  const [localAgreement, setLocalAgreement] = useState(existingAgreement)

  // Fetch existing agreement data
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/agreement')
        if (res.ok) {
          const data = await res.json()
          if (data.agreement?.url) {
            setLocalAgreement({
              url: data.agreement.url,
              fileName: data.agreement.fileName,
              validationScore: data.agreement.validationScore,
              validationSummary: data.agreement.validationSummary,
              sections: data.agreement.sections || null,
            })
          }
        }
      } catch {
        // Non-critical
      }
    }
    if (!existingAgreement?.url) {
      fetchAgreement()
    }
  }, [existingAgreement])

  return (
    <div id="agreement-section" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Collapsible Header — matches BookingAgreementSection */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalAgreement')}</h3>
        </div>
        <div className="flex items-center gap-2">
          {agreementPref === 'OWN' && (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-purple-600 text-white">OWN</span>
          )}
          {agreementPref === 'BOTH' && (
            <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-purple-600 text-white">ITWHIP + OWN</span>
          )}
          <span className={`px-2 py-0.5 text-xs rounded font-medium text-white uppercase ${
            agreementUploaded || agreementPref === 'ITWHIP' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {agreementUploaded || agreementPref === 'ITWHIP' ? t('uploaded') : t('notUploaded')}
          </span>
          {expanded ? (
            <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
          ) : (
            <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Agreement Preference — same as ManualBookingView */}
          <AgreementPreferenceStep
            hideButton
            initialPreference={agreementPref}
            onSelectionChange={(pref) => setAgreementPref(pref)}
            onComplete={() => {}}
            existingAgreement={localAgreement}
            requestData={requestData}
            hostName={hostName}
            hostEmail={hostEmail}
          />
        </div>
      )}
    </div>
  )
}
