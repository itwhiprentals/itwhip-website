// app/(guest)/rentals/components/modals/TrustSafetyModal.tsx

'use client'

import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import { UserCheck, ShieldCheck, Car, Phone, Clock, AlertTriangle, CheckCircle, Users } from './icons'
import { SectionBox, BulletList } from './modal-primitives'

const hostVerificationItems = [
  { title: 'backgroundCheck', desc: 'backgroundCheckDesc' },
  { title: 'vehicleOwnership', desc: 'vehicleOwnershipDesc' },
  { title: 'insuranceVerification', desc: 'insuranceVerificationDesc' },
  { title: 'qualityStandards', desc: 'qualityStandardsDesc' },
] as const

const guestTierItems = [
  { title: 'economyStandard', desc: 'economyRequirements' },
  { title: 'luxury', desc: 'luxuryRequirements' },
  { title: 'premium', desc: 'premiumRequirements' },
  { title: 'exotic', desc: 'exoticRequirements' },
] as const

const coverageTiers = [
  { label: 'economyStandard', value: 'economyLiability' },
  { label: 'luxuryPremium', value: 'luxuryLiability' },
  { label: 'exotic', value: 'exoticLiability' },
] as const

const monitoringColumns = [
  { title: 'gpsTracking', prefix: 'gpsItem', count: 4 },
  { title: 'documentation', prefix: 'docItem', count: 4 },
  { title: 'standards', prefix: 'standardsItem', count: 4 },
] as const

const supportTiers = [
  { title: 'standardSupport', prefix: 'standardItem', count: 3 },
  { title: 'prioritySupport', prefix: 'priorityItem', count: 3 },
  { title: 'concierge', prefix: 'conciergeItem', count: 3 },
] as const

const claimsTimeline = [
  { time: '0-2hr', label: 'reportFiled' },
  { time: '2-24hr', label: 'reviewApproval' },
  { time: '24-48hr', label: 'repairAuthorized' },
  { time: '48-72hr', label: 'paymentIssued' },
] as const

const emergencyContacts = [
  { number: '911', desc: 'emergency911Desc' },
  { number: '1-855-703-0806', desc: 'urgentSupportDesc' },
  { number: '1-602-609-2577', desc: 'roadsideAssistanceDesc' },
] as const

const platformCards = [
  { title: 'noSurprises', desc: 'noSurprisesDesc' },
  { title: 'guaranteedBookings', desc: 'guaranteedBookingsDesc' },
  { title: 'fastPayments', desc: 'fastPaymentsDesc' },
] as const

const commitmentItems = ['alwaysHumanSupport', 'fastClaimResolution', 'stableReliable'] as const

interface TrustSafetyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TrustSafetyModal({ isOpen, onClose }: TrustSafetyModalProps) {
  const t = useTranslations('TrustSafety')

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('title')} size="large">
      <div className="prose prose-sm max-w-none">

            {/* Professional Platform Overview */}
            <section className="mb-6">
              <SectionBox color="gray">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('platformOverview')}</h3>
                <p className="text-xs text-gray-800 dark:text-gray-200 mb-3">{t('platformOverviewDesc')}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { stat: '2,847+', label: 'verifiedHosts' },
                    { stat: '48hr', label: 'claimsResolution' },
                    { stat: '24/7', label: 'humanSupport' },
                  ].map(({ stat, label }) => (
                    <div key={label} className="text-center bg-white dark:bg-gray-800 rounded p-2">
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t(label)}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Comprehensive Verification */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <UserCheck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('verificationSystem')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionBox color="gray">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{t('hostVerification')}</h4>
                  <div className="space-y-2">
                    {hostVerificationItems.map(({ title, desc }) => (
                      <div key={title} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{t(title)}</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{t(desc)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBox>

                <SectionBox color="gray">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{t('guestScreening')}</h4>
                  <div className="space-y-2">
                    {guestTierItems.map(({ title, desc }) => (
                      <div key={title} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{t(title)}</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{t(desc)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBox>
              </div>
            </section>

            {/* Comprehensive Protection */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <ShieldCheck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('protectionIncluded')}
              </h3>

              <SectionBox color="white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('coverageByTier')}</h4>
                    <ul className="text-xs space-y-1">
                      {coverageTiers.map(({ label, value }) => (
                        <li key={label} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t(label)}:</span>
                          <span className="font-medium">{t(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('whatsIncluded')}</h4>
                    <BulletList items={Array.from({ length: 5 }, (_, i) => t(`whatsIncludedItem${i + 1}`))} />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-800 dark:text-gray-200">
                    <strong>{t('importantLabel')}</strong> {t('protectionImportant')}
                  </p>
                </div>
              </SectionBox>
            </section>

            {/* Real-Time Monitoring & Safety */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Car className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('vehicleSafety')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {monitoringColumns.map(({ title, prefix, count }) => (
                  <SectionBox key={title} color="gray" className="!p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">{t(title)}</h4>
                    <BulletList
                      items={Array.from({ length: count }, (_, i) => t(`${prefix}${i + 1}`))}
                      className="text-xs text-gray-700 dark:text-gray-300 space-y-1"
                    />
                  </SectionBox>
                ))}
              </div>
            </section>

            {/* 24/7 Professional Support */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('professionalSupport')}
              </h3>

              <SectionBox color="gray">
                <p className="text-xs text-gray-800 dark:text-gray-200 mb-3">{t('supportDescription')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {supportTiers.map(({ title, prefix, count }) => (
                    <div key={title} className="bg-white dark:bg-gray-800 rounded p-3">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">{t(title)}</h4>
                      <BulletList
                        items={Array.from({ length: count }, (_, i) => t(`${prefix}${i + 1}`))}
                        className="text-xs text-gray-700 dark:text-gray-300 space-y-1"
                      />
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Fast Claims Resolution */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('claimsResolutionTitle')}
              </h3>

              <SectionBox color="gray">
                <p className="text-xs text-gray-800 dark:text-gray-200 mb-3">{t('claimsResolutionDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {claimsTimeline.map(({ time, label }) => (
                    <div key={label} className="text-center bg-white dark:bg-gray-800 rounded p-2">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{time}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t(label)}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Emergency Response */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('emergencyResponse')}
              </h3>

              <SectionBox color="gray">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('emergencyContacts')}</h4>
                    <div className="space-y-2">
                      {emergencyContacts.map(({ number, desc }) => (
                        <p key={number} className="text-xs text-gray-800 dark:text-gray-200">
                          <strong>{number}:</strong> {t(desc)}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('immediateActions')}</h4>
                    <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <li key={i}>{i + 1}. {t(`actionItem${i + 1}`)}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-800 dark:text-gray-200">
                    <strong>{t('ourPromise')}</strong> {t('ourPromiseDesc')}
                  </p>
                </div>
              </SectionBox>
            </section>

            {/* Platform Reliability */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {t('platformStability')}
              </h3>

              <SectionBox color="gray">
                <p className="text-xs text-gray-800 dark:text-gray-200 mb-3">{t('platformStabilityDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {platformCards.map(({ title, desc }) => (
                    <div key={title} className="text-center bg-white dark:bg-gray-800 rounded p-3">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">{t(title)}</h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{t(desc)}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>

            {/* Safety Best Practices */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3">{t('safetyBestPractices')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('forGuests')}</h4>
                  <BulletList
                    items={Array.from({ length: 7 }, (_, i) => t(`guestTip${i + 1}`))}
                    className="text-xs text-gray-600 dark:text-gray-300 space-y-1"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('platformGuarantees')}</h4>
                  <BulletList
                    items={Array.from({ length: 7 }, (_, i) => t(`guarantee${i + 1}`))}
                    className="text-xs text-gray-600 dark:text-gray-300 space-y-1"
                  />
                </div>
              </div>
            </section>

            {/* Trust Commitment */}
            <section className="mb-6">
              <SectionBox color="gray">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('ourCommitment')}</h4>
                <p className="text-xs text-gray-800 dark:text-gray-200 mb-3">{t('ourCommitmentDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {commitmentItems.map((key) => (
                    <div key={key} className="text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-xs text-gray-700 dark:text-gray-300">{t(key)}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </section>
          </div>
    </BottomSheet>
  )
}
