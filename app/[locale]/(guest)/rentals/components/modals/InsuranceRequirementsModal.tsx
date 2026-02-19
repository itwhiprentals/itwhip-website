// app/(guest)/rentals/components/modals/InsuranceRequirementsModal.tsx

'use client'

import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import { ShieldCheck, CheckCircle, AlertCircle, XCircle, ClockIcon, DocumentText, CashIcon } from './icons'
import { IconListItem, SectionBox, NumberedStep, BulletList } from './modal-primitives'

interface InsuranceRequirementsModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleType?: 'economy' | 'standard' | 'luxury' | 'premium' | 'exotic'
}

const coverageByType = {
  economy: { liability: '$750,000', deductible: '$500', commission: '15%' },
  standard: { liability: '$750,000', deductible: '$500', commission: '15%' },
  luxury: { liability: '$1,000,000', deductible: '$750', commission: '18%' },
  premium: { liability: '$1,000,000', deductible: '$1,000', commission: '20%' },
  exotic: { liability: '$2,000,000', deductible: '$2,500', commission: '22%' },
}

const liabilityKeys = ['thirdPartyLiability', 'bodilyInjury', 'propertyDamage', 'medicalPayments'] as const
const damageKeys = ['collisionCoverage', 'comprehensiveCoverage', 'deductibleOnly', 'uninsuredMotorist'] as const
const responsibilityKeys = [
  { bold: 'validLicense', desc: 'validLicenseDesc' },
  { bold: 'followTrafficLaws', desc: 'followTrafficLawsDesc' },
  { bold: 'reportIncidents', desc: 'reportIncidentsDesc' },
  { bold: 'payDeductible', desc: 'payDeductibleDesc' },
  { bold: 'returnOnTime', desc: 'returnOnTimeDesc' },
] as const
const claimsSteps = [
  { bold: 'ensureSafety', desc: 'ensureSafetyDesc' },
  { bold: 'call911', desc: 'call911Desc' },
  { bold: 'documentEverything', desc: 'documentEverythingDesc' },
  { bold: 'contactItWhip', desc: 'contactItWhipDesc' },
  { bold: 'submitClaim', desc: 'submitClaimDesc' },
] as const

const faqItems = [
  { q: 'faqQ1', a: 'faqA1' },
  { q: 'faqQ2', a: 'faqA2' },
  { q: 'faqQ3', a: 'faqA3' },
  { q: 'faqQ4', a: 'faqA4' },
] as const

export default function InsuranceRequirementsModal({
  isOpen,
  onClose,
  vehicleType = 'standard'
}: InsuranceRequirementsModalProps) {
  const t = useTranslations('InsuranceRequirements')
  const coverage = coverageByType[vehicleType]
  const params = { liability: coverage.liability, deductible: coverage.deductible, commission: coverage.commission, vehicleType }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('title')} size="large">
      <div className="prose prose-sm max-w-none">

            {/* Protection Included Banner */}
            <SectionBox color="green" className="mb-4 sm:mb-6">
              <div className="flex items-start">
                <ShieldCheck className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-900 mb-1">{t('bannerTitle')}</h4>
                  <p className="text-xs text-green-800">
                    {t('bannerDescription', { commission: coverage.commission, liability: coverage.liability })}
                  </p>
                </div>
              </div>
            </SectionBox>

            {/* What's Included Section */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                {t('whatsIncluded')}
              </h3>

              <SectionBox color="white" className="mb-3 sm:mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">{t('liabilityProtection')}</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                      {liabilityKeys.map((key) => (
                        <IconListItem key={key} icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />}>
                          {t(key, params)}
                        </IconListItem>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">{t('physicalDamage')}</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                      {damageKeys.map((key) => (
                        <IconListItem key={key} icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />}>
                          {t(key, params)}
                        </IconListItem>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionBox>

              {/* Additional Benefits */}
              <SectionBox color="blue">
                <h4 className="text-sm font-medium text-blue-900 mb-2">{t('additionalBenefits')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { Icon: ClockIcon, title: 'support247', desc: 'roadsideAssistance' },
                    { Icon: DocumentText, title: 'fastClaims', desc: 'fastClaimsDesc' },
                    { Icon: CashIcon, title: 'noHiddenFees', desc: 'noHiddenFeesDesc' },
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} className="flex items-start">
                      <Icon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">{t(title)}</p>
                        <p className="text-xs text-blue-700">{t(desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Guest Responsibilities */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                {t('yourResponsibilities')}
              </h3>

              <SectionBox color="white" className="mb-3 sm:mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">{t('guestMust')}</h4>
                <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                  {responsibilityKeys.map(({ bold, desc }) => (
                    <IconListItem key={bold} icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />}>
                      <strong>{t(bold)}</strong> {t(desc, params)}
                    </IconListItem>
                  ))}
                </ul>
              </SectionBox>

              <SectionBox color="amber">
                <h4 className="text-sm font-medium text-amber-900 mb-2">{t('importantNotes')}</h4>
                <BulletList
                  items={Array.from({ length: 4 }, (_, i) => t(`importantNote${i + 1}`))}
                  className="text-xs text-amber-800 space-y-1"
                />
              </SectionBox>
            </section>

            {/* What's Not Covered */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                {t('exclusions')}
              </h3>

              <SectionBox color="red">
                <h4 className="text-sm font-medium text-red-900 mb-2 sm:mb-3">{t('notCovered')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <BulletList
                    items={Array.from({ length: 4 }, (_, i) => t(`notCovered${i + 1}`))}
                    className="text-xs text-red-800 space-y-1"
                  />
                  <BulletList
                    items={Array.from({ length: 4 }, (_, i) => t(`notCovered${i + 5}`))}
                    className="text-xs text-red-800 space-y-1"
                  />
                </div>
              </SectionBox>
            </section>

            {/* Claims Process */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3">{t('incidentOccurs')}</h3>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">{t('quickClaimsProcess')}</h4>
                <ol className="text-xs text-gray-600 space-y-2">
                  {claimsSteps.map(({ bold, desc }, i) => (
                    <NumberedStep key={bold} step={i + 1}>
                      <strong>{t(bold)}</strong> {t(desc)}
                    </NumberedStep>
                  ))}
                </ol>

                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100 rounded">
                  <p className="text-xs text-green-800">
                    <strong>{t('fastResolutionTitle')}</strong> {t('fastResolutionDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3">{t('faq')}</h3>
              <div className="space-y-3">
                {faqItems.map(({ q, a }) => (
                  <div key={q} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t(q)}</h4>
                    <p className="text-xs text-gray-600">{t(a, params)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-4 sm:mb-6">
              <SectionBox color="purple">
                <h4 className="text-sm font-medium text-purple-900 mb-3 text-center">{t('supportAvailable')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  {[
                    { label: 'emergencyClaims', value: '1-855-703-0806' },
                    { label: 'roadsideAssistanceLabel', value: '1-602-609-2577' },
                    { label: 'generalSupport', value: 'info@itwhip.com' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-medium text-purple-800 mb-1">{t(label)}</p>
                      <p className="text-xs sm:text-sm font-bold text-purple-900">{value}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Legal Disclaimer */}
            <section className="mb-4 sm:mb-6">
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>{t('legalNoticeLabel')}</strong> {t('legalNoticeText')}
                </p>
              </div>
            </section>
          </div>
    </BottomSheet>
  )
}
