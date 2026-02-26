// app/partner/requests/[id]/components/AgreementFullPreview.tsx
// Full agreement preview with expandable accordion sections
// Matches content from the guest-facing sign page for host preview

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoScaleOutline,
  IoShieldOutline,
  IoPeopleOutline,
  IoWarningOutline,
  IoWalletOutline,
  IoCloseCircleOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoCreateOutline
} from 'react-icons/io5'

interface RequestData {
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

interface AgreementFullPreviewProps {
  requestData: RequestData
  hostName?: string
  onClose: () => void
}

// Format currency with commas and 2 decimals
function fmt(n: number | null | undefined): string {
  if (n == null) return '$0.00'
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Format date for display
function fmtDate(dateStr: string | null): string {
  if (!dateStr) return 'Pending'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

/** Accordion section wrapper */
function Section({
  icon: Icon,
  title,
  children,
  isOpen,
  onToggle,
  accentColor = 'text-gray-700 dark:text-gray-300'
}: {
  icon: typeof IoShieldCheckmarkOutline
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  accentColor?: string
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${accentColor}`} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {title}
          </span>
        </div>
        {isOpen ? (
          <IoChevronUpOutline className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <IoChevronDownOutline className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

export default function AgreementFullPreview({
  requestData,
  hostName,
  onClose
}: AgreementFullPreviewProps) {
  const t = useTranslations('PartnerRequestDetail')
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isOpen = (key: string) => openSections.has(key)

  // Calculate estimated amounts
  const dailyRate = requestData.offeredRate || 0
  const days = requestData.durationDays || 1
  const rentalSubtotal = dailyRate * days

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-4 py-3 flex items-center justify-between border-b border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('fullPreviewTitle')}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
        >
          {t('agreementPreviewCollapse')}
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">

        {/* 1. Parties */}
        <Section
          icon={IoPeopleOutline}
          title={t('fullPreviewParties')}
          isOpen={isOpen('parties')}
          onToggle={() => toggle('parties')}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-0.5">{t('fullPreviewOwner')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{hostName || t('fullPreviewYourName')}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-0.5">{t('fullPreviewRenter')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {requestData.guestName || t('fullPreviewGuestPending')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-0.5">{t('fullPreviewFacilitator')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ItWhip Technologies, Inc.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('fullPreviewGoverningLaw')}
              </p>
            </div>
          </div>
        </Section>

        {/* 2. Vehicle & Rental Period */}
        <Section
          icon={IoCarOutline}
          title={t('fullPreviewVehicleRental')}
          isOpen={isOpen('vehicle')}
          onToggle={() => toggle('vehicle')}
        >
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">{t('fullPreviewVehicle')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('fullPreviewVehiclePending')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">{t('fullPreviewStart')}</p>
                <p className="text-sm text-gray-900 dark:text-white">{fmtDate(requestData.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">{t('fullPreviewEnd')}</p>
                <p className="text-sm text-gray-900 dark:text-white">{fmtDate(requestData.endDate)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">{t('fullPreviewDuration')}</p>
                <p className="text-sm text-gray-900 dark:text-white">{days} {t('fullPreviewDays')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">{t('fullPreviewPickup')}</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {requestData.pickupCity && requestData.pickupState
                    ? `${requestData.pickupCity}, ${requestData.pickupState}`
                    : t('fullPreviewPending')}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Arizona Legal Requirements */}
        <Section
          icon={IoScaleOutline}
          title={t('fullPreviewArizonaLegal')}
          isOpen={isOpen('legal')}
          onToggle={() => toggle('legal')}
          accentColor="text-gray-700 dark:text-gray-400"
        >
          <p className="mb-3">
            {t('fullPreviewArizonaLegalDesc')}
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewARS28_3472')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewARS33_1321')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewARS28_9601')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewARS20_331')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewARS42_5061')}
            </li>
          </ul>
        </Section>

        {/* 4. Trip Protection Coverage */}
        <Section
          icon={IoShieldOutline}
          title={t('fullPreviewTripProtection')}
          isOpen={isOpen('protection')}
          onToggle={() => toggle('protection')}
          accentColor="text-green-600 dark:text-green-400"
        >
          <p className="mb-3">
            {t('fullPreviewTripProtectionDesc')}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{t('fullPreviewLiability')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">$750,000</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{t('fullPreviewDeductible')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">$500</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{t('fullPreviewPersonalEffects')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">$500</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{t('fullPreviewLossOfUse')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('fullPreviewCovered')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('fullPreviewCoverageExclusions')}
          </p>
        </Section>

        {/* 5. Terms — Driver Eligibility */}
        <Section
          icon={IoShieldCheckmarkOutline}
          title={t('fullPreviewTerms1')}
          isOpen={isOpen('terms1')}
          onToggle={() => toggle('terms1')}
        >
          <p>
            {t('fullPreviewTerms1Desc')}
          </p>
        </Section>

        {/* 6. Terms — Authorized Use */}
        <Section
          icon={IoWarningOutline}
          title={t('fullPreviewTerms2')}
          isOpen={isOpen('terms2')}
          onToggle={() => toggle('terms2')}
        >
          <p className="mb-2">{t('fullPreviewTerms2Intro')}</p>
          <ul className="space-y-1 ml-1">
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2Racing')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2Towing')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2Offroad')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2Commercial')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2Hazardous')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms2OutOfState')}
            </li>
          </ul>
        </Section>

        {/* 7. Terms — Renter Responsibilities */}
        <Section
          icon={IoDocumentTextOutline}
          title={t('fullPreviewTerms3')}
          isOpen={isOpen('terms3')}
          onToggle={() => toggle('terms3')}
        >
          <ul className="space-y-1 ml-1">
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3Fuel')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3Condition')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3Lock')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3Report')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3NoSmoking')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3NoPets')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              {t('fullPreviewTerms3Tolls')}
            </li>
          </ul>
        </Section>

        {/* 8. Terms — Accident & Emergency */}
        <Section
          icon={IoWarningOutline}
          title={t('fullPreviewTerms4')}
          isOpen={isOpen('terms4')}
          onToggle={() => toggle('terms4')}
          accentColor="text-red-500 dark:text-red-400"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs">{t('fullPreviewTerms4Heading')}</p>
            <ol className="space-y-1 list-decimal ml-4 text-xs">
              <li>{t('fullPreviewTerms4Step1')}</li>
              <li>{t('fullPreviewTerms4Step2')}</li>
              <li>{t('fullPreviewTerms4Step3')}</li>
              <li>{t('fullPreviewTerms4Step4')}</li>
              <li>{t('fullPreviewTerms4Step5')}</li>
              <li>{t('fullPreviewTerms4Step6')}</li>
            </ol>
          </div>
        </Section>

        {/* 9. Terms — Cancellation Policy */}
        <Section
          icon={IoCloseCircleOutline}
          title={t('fullPreviewTerms5')}
          isOpen={isOpen('terms5')}
          onToggle={() => toggle('terms5')}
        >
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-900 dark:text-white">72+h</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">100%</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-900 dark:text-white">24-72h</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">75%</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-900 dark:text-white">12-24h</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">50%</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-900 dark:text-white">&lt;12h</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">0%</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('fullPreviewTerms5Note')}</p>
        </Section>

        {/* 10. Terms — Security Deposit Return */}
        <Section
          icon={IoLockClosedOutline}
          title={t('fullPreviewTerms6')}
          isOpen={isOpen('terms6')}
          onToggle={() => toggle('terms6')}
        >
          <p className="mb-2">{t('fullPreviewTerms6Intro')}</p>
          <ul className="space-y-1 ml-1 mb-3">
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              <span><strong>{t('fullPreviewTerms6OnTime')}</strong> {t('fullPreviewTerms6OnTimeDesc')}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              <span><strong>{t('fullPreviewTerms6Fuel')}</strong> {t('fullPreviewTerms6FuelDesc')}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              <span><strong>{t('fullPreviewTerms6Condition')}</strong> {t('fullPreviewTerms6ConditionDesc')}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              <span><strong>{t('fullPreviewTerms6Interior')}</strong> {t('fullPreviewTerms6InteriorDesc')}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
              <span><strong>{t('fullPreviewTerms6Mileage')}</strong> {t('fullPreviewTerms6MileageDesc')}</span>
            </li>
          </ul>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              <strong>{t('fullPreviewTerms6Timeline')}</strong> {t('fullPreviewTerms6TimelineDesc')}
            </p>
          </div>
        </Section>

        {/* 11. Terms — Platform Facilitator */}
        <Section
          icon={IoGlobeOutline}
          title={t('fullPreviewTerms7')}
          isOpen={isOpen('terms7')}
          onToggle={() => toggle('terms7')}
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="mb-2">
              <strong>{t('fullPreviewTerms7Important')}</strong> {t('fullPreviewTerms7Desc1')}
            </p>
            <p>{t('fullPreviewTerms7Desc2')}</p>
          </div>
        </Section>

        {/* 12. Terms — E-Signature Consent */}
        <Section
          icon={IoCreateOutline}
          title={t('fullPreviewTerms8')}
          isOpen={isOpen('terms8')}
          onToggle={() => toggle('terms8')}
        >
          <p>{t('fullPreviewTerms8Desc')}</p>
        </Section>

        {/* 13. Payment Summary */}
        <Section
          icon={IoWalletOutline}
          title={t('fullPreviewPayment')}
          isOpen={isOpen('payment')}
          onToggle={() => toggle('payment')}
          accentColor="text-orange-600 dark:text-orange-400"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('fullPreviewDailyRate')}</span>
              <span className="text-gray-900 dark:text-white">{fmt(dailyRate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('fullPreviewRentalDays', { days })}</span>
              <span className="text-gray-900 dark:text-white">{fmt(rentalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700 font-semibold">
              <span className="text-gray-900 dark:text-white">{t('fullPreviewTotal')}</span>
              <span className="text-orange-600 dark:text-orange-400">{fmt(requestData.totalAmount)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('fullPreviewPaymentNote')}
          </p>
        </Section>

      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {t('fullPreviewFooter')}
        </p>
      </div>
    </div>
  )
}
