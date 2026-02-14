// app/(guest)/rentals/components/modals/CancellationPolicyModal.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'

// Icon Components
const Clock = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DollarSign = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldCheck = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

interface CancellationPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CancellationPolicyModal({
  isOpen,
  onClose
}: CancellationPolicyModalProps) {
  const t = useTranslations('CancellationPolicy')
  const [refundCalculator, setRefundCalculator] = useState({
    tripTotal: 500,
    numberOfDays: 3,
    hoursBeforePickup: 48,
  })

  const calculateRefund = () => {
    const { tripTotal, numberOfDays, hoursBeforePickup } = refundCalculator
    const safeDays = Math.max(1, numberOfDays)
    const avgDailyCost = tripTotal / safeDays
    let penaltyAmount = 0
    let penaltyDays = 0
    let serviceFeeRefund = 0

    if (hoursBeforePickup >= 24) {
      penaltyAmount = 0
      penaltyDays = 0
      if (hoursBeforePickup >= 168) {
        serviceFeeRefund = tripTotal * 0.10
      }
    } else {
      penaltyDays = safeDays > 2 ? 1 : 0.5
      penaltyAmount = Math.round(avgDailyCost * penaltyDays * 100) / 100
    }

    const refundAmount = Math.max(0, tripTotal - penaltyAmount)
    return {
      penaltyAmount,
      penaltyDays,
      amount: refundAmount,
      avgDailyCost: Math.round(avgDailyCost * 100) / 100,
      serviceFee: serviceFeeRefund,
      total: refundAmount + serviceFeeRefund,
    }
  }

  const refund = calculateRefund()

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="large"
    >
        {/* Deposit Always Released Notice */}
        <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-xs text-green-800 dark:text-green-200">
              <strong>{t('depositAlwaysReleased')}:</strong> {t('depositAlwaysReleasedDesc')}
            </p>
          </div>
        </div>

          <div className="prose prose-sm max-w-none">
            {/* Quick Reference Timeline — 2 tiers */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('cancellationTimeline')}</h3>

              {/* Mobile: vertical timeline */}
              <div className="sm:hidden space-y-0">
                {[
                  { time: '24+ hours before pickup', refund: 'Full refund', color: 'bg-green-500', textColor: 'text-green-700', subColor: 'text-green-600' },
                  { time: 'Less than 24 hours', refund: '1-day penalty*', color: 'bg-amber-500', textColor: 'text-amber-700', subColor: 'text-amber-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`} />
                      {i < 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-xs font-semibold ${item.textColor}`}>{item.time}</p>
                      <p className={`text-xs ${item.subColor}`}>{item.refund}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 ml-6">*Trips 1-2 days: half-day penalty. Trips 3+ days: 1-day penalty.</p>
              </div>

              {/* Desktop: horizontal timeline */}
              <div className="hidden sm:block">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="relative">
                    <div className="absolute top-1.5 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    <div className="absolute top-1.5 left-0 w-1/2 h-1.5 bg-green-500 rounded-l-full" />
                    <div className="absolute top-1.5 left-1/2 w-1/2 h-1.5 bg-amber-500 rounded-r-full" />

                    <div className="relative flex justify-between pt-5">
                      <div className="text-center w-1/2">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">{t('twentyFourPlusHours')}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{t('fullRefund')}</p>
                      </div>
                      <div className="text-center w-1/2">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t('lessThan24Hours')}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{t('oneDayPenalty')}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    {t('penaltyDisclaimer')}
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Calculator */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                {t('refundCalculator')}
              </h3>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      {t('tripTotal')}
                    </label>
                    <input
                      type="number"
                      value={refundCalculator.tripTotal}
                      onChange={(e) => setRefundCalculator({
                        ...refundCalculator,
                        tripTotal: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      step="50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      {t('numberOfDays')}
                    </label>
                    <input
                      type="number"
                      value={refundCalculator.numberOfDays}
                      onChange={(e) => setRefundCalculator({
                        ...refundCalculator,
                        numberOfDays: parseInt(e.target.value) || 1
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      {t('hoursBeforePickup')}
                    </label>
                    <input
                      type="number"
                      value={refundCalculator.hoursBeforePickup}
                      onChange={(e) => setRefundCalculator({
                        ...refundCalculator,
                        hoursBeforePickup: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('avgDailyCost')}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${refund.avgDailyCost.toFixed(2)}</span>
                    </div>
                    {refund.penaltyAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('penalty')} ({refund.penaltyDays === 1 ? t('oneDay') : t('halfDay')}):</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">-${refund.penaltyAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('tripRefund')}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${refund.amount.toFixed(2)}</span>
                    </div>
                    {refund.serviceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('serviceFeeRefund')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${refund.serviceFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('securityDeposit')}:</span>
                      <span className="text-xs text-green-600 dark:text-green-400">{t('alwaysReleased')}</span>
                    </div>
                    <div className="border-t dark:border-gray-600 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">{t('totalRefund')}:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">${refund.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Note: Trip Protection is embedded in our service and remains active until pickup time, providing peace of mind even after cancellation.
                </p>
              </div>
            </section>

            {/* Guest Cancellation Policy */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('guestCancellationPolicy')}</h3>

              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">24+ Hours Before Pickup &mdash; Free Cancellation</h4>
                      <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                        <li>&bull; 100% refund of rental cost</li>
                        <li>&bull; Full service fee refund if 7+ days before</li>
                        <li>&bull; Security deposit released immediately</li>
                        <li>&bull; Credits and bonus balances fully restored</li>
                        <li>&bull; Trip Protection coverage continues until pickup time</li>
                        <li>&bull; No impact on your rental history</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">{t('lateCancellationTitle')}</h4>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                        <li>&bull; <strong>Trips 3+ days:</strong> Penalty = 1 day&apos;s average cost</li>
                        <li>&bull; <strong>Trips 1-2 days:</strong> Penalty = 50% of 1 day&apos;s average cost</li>
                        <li>&bull; Security deposit always released in full</li>
                        <li>&bull; Penalty applied proportionally across payment sources</li>
                        <li>&bull; Trip Protection remains active until pickup</li>
                        <li>&bull; Host may offer reschedule option</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* What's Always Refunded */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('alwaysRefunded')}</h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <ul className="text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                    <span><strong>Security deposit</strong> &mdash; 100% released regardless of timing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                    <span><strong>Deposit wallet funds</strong> &mdash; fully returned to your wallet</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                    <span><strong>Service fee</strong> &mdash; if cancelled 7+ days before pickup</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Host Cancellation Policy */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('hostCancellationPolicy')}</h3>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">{t('whenHostCancels')}</h4>
                    <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
                      <li>&bull; Guest receives 100% refund including all fees</li>
                      <li>&bull; Trip Protection fee fully refunded</li>
                      <li>&bull; ItWhip provides $50 travel credit for inconvenience</li>
                      <li>&bull; Priority assistance finding alternative vehicle</li>
                      <li>&bull; We may cover price difference for comparable car</li>
                      <li>&bull; Host faces penalties and possible suspension</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Trip Protection & Cancellation */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('tripProtectionCancellations')}</h3>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">{t('tripProtectionWithCancellations')}</h4>
                    <div className="text-xs text-green-800 dark:text-green-200 space-y-2">
                      <p>
                        <strong>Coverage Continues:</strong> Even after you cancel, Trip Protection remains active until your
                        original pickup time. This means if you change your mind or rebook, you&apos;re still covered.
                      </p>
                      <p>
                        <strong>No Separate Charge:</strong> Trip Protection is included in every rental at no additional cost.
                        It&apos;s part of our platform service, not a separate insurance product you need to cancel.
                      </p>
                      <p>
                        <strong>Protection Benefits:</strong> If something happens to prevent your trip (covered emergency,
                        natural disaster, etc.), Trip Protection may provide additional refund consideration beyond standard policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Circumstances */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('specialCircumstances')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('coveredByTripProtection')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Full refunds may be provided for:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>&bull; Death or serious illness (documentation required)</li>
                    <li>&bull; Natural disasters affecting area</li>
                    <li>&bull; Government travel restrictions</li>
                    <li>&bull; Vehicle mechanical failure (host&apos;s fault)</li>
                    <li>&bull; Jury duty or court subpoena</li>
                    <li>&bull; Military deployment</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('notCoveredNoRefund')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    No refunds provided for:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>&bull; No-show without cancellation</li>
                    <li>&bull; Failed verification at pickup</li>
                    <li>&bull; Invalid or suspended license</li>
                    <li>&bull; DUI/DWI discovered</li>
                    <li>&bull; False information provided</li>
                    <li>&bull; Credit card declined at pickup</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Documentation Required:</strong> For special circumstance refunds, you must provide documentation
                  within 14 days of cancellation. Our Trip Protection team reviews each case individually.
                </p>
              </div>
            </section>

            {/* How to Cancel */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('howToCancel')}</h3>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Open the ItWhip app or website and log in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Go to &quot;My Trips&quot; in your dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Select the booking you want to cancel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Click &quot;Modify or Cancel Booking&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">5.</span>
                    <span>Review refund amount and penalty (if any) then confirm</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">6.</span>
                    <span>Receive instant confirmation with refund timeline</span>
                  </li>
                </ol>

                <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <strong>Pro Tip:</strong> Before cancelling, message your host about rescheduling. Many hosts prefer
                    to modify dates rather than lose the booking entirely.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Processing */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('refundProcessing')}</h3>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('processingTimeline')}</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>&bull; Credit/Debit Cards: 5-10 business days</li>
                      <li>&bull; PayPal: 3-5 business days</li>
                      <li>&bull; Apple Pay/Google Pay: 3-5 business days</li>
                      <li>&bull; ItWhip credit: Instant (can use immediately)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('importantNotes')}</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>&bull; Refunds go to original payment method</li>
                      <li>&bull; Bank processing times may vary</li>
                      <li>&bull; Arizona Transaction Privilege Tax refunded per state law</li>
                      <li>&bull; Security deposit is always released &mdash; never charged on cancellation</li>
                      <li>&bull; Trip Protection ensures coverage until pickup time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t('faq')}</h3>

              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: How is the late cancellation penalty calculated?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: We calculate the average daily cost of your trip (total / number of days). For trips 3 or more days,
                    the penalty is 1 day&apos;s average cost. For trips 1-2 days, it&apos;s half a day&apos;s average cost. This is fairer
                    than a flat percentage &mdash; a 10-day trip only loses 1 day, not a huge chunk.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: What happens to my security deposit if I cancel?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Your security deposit is always released in full on cancellation, no matter when you cancel.
                    No damage occurred, so no deposit is charged. If it was held via your deposit wallet, the funds
                    are instantly returned to your wallet.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: What happens to my Trip Protection if I cancel?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Trip Protection remains active until your original pickup time. It&apos;s included in every rental and
                    continues to cover you for any qualifying events, even after cancellation.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: Can I modify my booking instead of cancelling?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Yes! Contact the host through messages to request date changes. Many hosts are flexible and prefer
                    modification over cancellation. Changes may incur price differences but avoid cancellation penalties.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: I used credits/bonus to pay. How does the penalty work?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: The penalty is split proportionally across all payment sources. For example, if you paid 50% with
                    credits and 50% with your card, the penalty is split 50/50 between credits and card. Your deposit
                    wallet is always fully returned regardless.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Support */}
            <section className="mb-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('needHelp')}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  Our support team is available 24/7 to assist with cancellations and special circumstances
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Phone:</strong> 1-800-ITWHIP-1 (Priority for same-day trips)
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Email:</strong> info@itwhip.com
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>In-App:</strong> Chat with support directly
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Response Time:</strong> Under 10 minutes for urgent cancellations
                  </p>
                </div>
              </div>
            </section>

            {/* Policy Links */}
            <div className="border-t dark:border-gray-600 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                This policy works in conjunction with our comprehensive Trip Protection
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a href="/protection/coverage-details" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Trip Protection Details
                </a>
                <a href="/terms" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Terms of Service
                </a>
                <a href="/protection/claims" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Claims Process
                </a>
                <a href="/host/cancellation" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Host Guidelines
                </a>
              </div>
            </div>
          </div>

    </BottomSheet>
  )
}
