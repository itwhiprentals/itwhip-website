// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingModals.tsx

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import { XCircle, DocumentText, ShieldCheck, Calendar, ArrowForward } from './Icons'
import { calculateRefund, formatCurrency } from '../utils/helpers'
import BottomSheet from '@/app/components/BottomSheet'

// Import all modal components from the main rentals area
import RentalAgreementModal from '@/app/[locale]/(guest)/rentals/components/modals/RentalAgreementModal'
import InsuranceRequirementsModal from '@/app/[locale]/(guest)/rentals/components/modals/InsuranceRequirementsModal'
import CancellationPolicyModal from '@/app/[locale]/(guest)/rentals/components/modals/CancellationPolicyModal'
import TrustSafetyModal from '@/app/[locale]/(guest)/rentals/components/modals/TrustSafetyModal'

interface CancellationDialogProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export const CancellationDialog: React.FC<CancellationDialogProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm
}) => {
  const t = useTranslations('BookingDetail')
  const [cancellationReason, setCancellationReason] = useState('')
  const refundInfo = calculateRefund(booking)
  const hasPenalty = refundInfo.penaltyAmount > 0
  const subtotal = booking.subtotal || (booking.dailyRate * (booking.numberOfDays || 1))
  const penaltyPercent = subtotal > 0 ? Math.round((refundInfo.penaltyAmount / subtotal) * 100) : 0
  const hasCreditsOrBonus = (booking.creditsApplied || 0) > 0 || (booking.bonusApplied || 0) > 0
  const hasWalletDeposit = (booking.depositFromWallet || 0) > 0
  const hasCardDeposit = (booking.depositFromCard || 0) > 0
  const hasMultipleSources = hasCreditsOrBonus || hasWalletDeposit
  const cardLabel = booking.cardBrand && booking.cardLast4
    ? `${booking.cardBrand.charAt(0).toUpperCase() + booking.cardBrand.slice(1)} •••• ${booking.cardLast4}`
    : null
  // Accurate total: sum of all refund destinations
  const totalBack = hasMultipleSources
    ? refundInfo.totalCardRefund + refundInfo.creditsRestored + refundInfo.bonusRestored + refundInfo.depositFromWallet
    : refundInfo.refundAmount + booking.depositAmount

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('cancelBookingTitle')}
      size="large"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            {t('keepBooking')}
          </button>
          <button
            onClick={() => onConfirm(cancellationReason)}
            disabled={!cancellationReason}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('yesCancel')}
          </button>
        </div>
      }
    >
      {/* Policy tier badge */}
      {refundInfo.tier === 'free' ? (
        <div className="mb-3 p-2.5 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 text-sm mt-0.5">&#10003;</span>
          <p className="text-xs font-medium text-green-800 dark:text-green-200">
            {t('freeCancellationBadge')}
          </p>
        </div>
      ) : refundInfo.tier === 'moderate' ? (
        <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <span className="text-amber-600 dark:text-amber-400 text-sm mt-0.5">&#9888;</span>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            {t('moderateCancelBadge', { penalty: formatCurrency(refundInfo.penaltyAmount), percent: penaltyPercent })}
          </p>
        </div>
      ) : refundInfo.tier === 'late' ? (
        <div className="mb-3 p-2.5 bg-red-600 rounded-lg flex items-start gap-2">
          <span className="text-white text-sm mt-0.5">&#9888;</span>
          <p className="text-xs font-medium text-white">
            {t('lateCancelBadge', { penalty: formatCurrency(refundInfo.penaltyAmount), percent: penaltyPercent })}
          </p>
        </div>
      ) : (
        <div className="mb-3 p-2.5 bg-red-800 rounded-lg flex items-start gap-2">
          <span className="text-white text-sm mt-0.5">&#10007;</span>
          <p className="text-xs font-medium text-white">
            {t('noRefundBadge')}
          </p>
        </div>
      )}

      {/* What You Paid */}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t('whatYouPaid')}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {t('baseRental', {
                days: booking.numberOfDays || 1,
                rate: formatCurrency(booking.dailyRate)
              })}
            </span>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.subtotal || (booking.dailyRate * (booking.numberOfDays || 1)))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('serviceFeeLine')} <span className="text-gray-400 text-[10px]">({t('nonRefundable')})</span></span>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.serviceFee)}</span>
          </div>
          {booking.insuranceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('insuranceLine', { tier: booking.insuranceType || 'Basic' })} <span className="text-gray-400 text-[10px]">({t('nonRefundable')})</span></span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.insuranceFee)}</span>
            </div>
          )}
          {booking.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('deliveryFeeLine')} <span className="text-gray-400 text-[10px]">({t('nonRefundable')})</span></span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('taxesLine')}</span>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.taxes)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-gray-100">{t('tripTotalLine')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
          {hasCreditsOrBonus && (
            <>
              {(booking.creditsApplied || 0) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('creditsAppliedLine')}</span>
                  <span className="font-semibold">(-{formatCurrency(booking.creditsApplied!)})</span>
                </div>
              )}
              {(booking.bonusApplied || 0) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('bonusAppliedLine')}</span>
                  <span className="font-semibold">(-{formatCurrency(booking.bonusApplied!)})</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span className="text-gray-700 dark:text-gray-300">{t('youPaidWithCard')}</span>
                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.chargeAmount || booking.totalAmount)}</span>
              </div>
            </>
          )}
          {hasCardDeposit && hasWalletDeposit ? (
            <>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{t('depositFromCardLine')}</span>
                <span>{formatCurrency(booking.depositFromCard!)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{t('depositFromWalletLine')}</span>
                <span>{formatCurrency(booking.depositFromWallet!)}</span>
              </div>
            </>
          ) : hasWalletDeposit ? (
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>{t('depositFromWalletLine')}</span>
              <span>{formatCurrency(booking.depositFromWallet!)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>{t('securityDepositHeld')}</span>
              <span>{formatCurrency(booking.depositAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Refund Breakdown */}
      <div className="mb-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t('refundBreakdown')}</p>
        <div className="space-y-1.5 text-xs">

          {/* ── Not refunded ── */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('notRefundedSection')}</p>
          {refundInfo.nonRefundableFees > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('nonRefundableFeesTotal')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.nonRefundableFees)}</span>
            </div>
          )}
          {booking.taxes > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('taxesLine')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.taxes)}</span>
            </div>
          )}
          {hasPenalty && (
            <div className="flex justify-between">
              <span className="font-semibold text-red-600">{t('cancellationPenalty')}</span>
              <span className="font-semibold text-red-600">{formatCurrency(refundInfo.penaltyAmount)}</span>
            </div>
          )}

          {/* Separator */}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

          {/* ── Your refund ── */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('yourRefundSection')}</p>
          {hasMultipleSources ? (
            <>
              {refundInfo.creditsRestored > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{t('creditsRestoredLine')}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.creditsRestored)}</span>
                </div>
              )}
              {refundInfo.bonusRestored > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{t('bonusRestoredLine')}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.bonusRestored)}</span>
                </div>
              )}
              {refundInfo.depositFromWallet > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{t('depositWalletRestored')}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.depositFromWallet)}</span>
                </div>
              )}
              {refundInfo.totalCardRefund > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    {cardLabel ? t('refundToCardLabel', { card: cardLabel }) : t('cardRefundLine')}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.totalCardRefund)}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {cardLabel ? t('refundToCardLabel', { card: cardLabel }) : t('tripRefundLine')}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(refundInfo.refundAmount)}</span>
              </div>
              {booking.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{t('depositReleased')}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(booking.depositAmount)}</span>
                </div>
              )}
            </>
          )}

          {/* Total back to you */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-gray-100">{t('totalBackToYou')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(totalBack)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason dropdown */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reasonRequired')} <span className="text-red-500">*</span>
        </label>
        <select
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">{t('selectReason')}</option>
          <option value="plans_changed">{t('reasonPlansChanged')}</option>
          <option value="found_alternative">{t('reasonFoundAlternative')}</option>
          <option value="dates_wrong">{t('reasonDatesWrong')}</option>
          <option value="price_concern">{t('reasonPriceConcern')}</option>
          <option value="personal_emergency">{t('reasonEmergency')}</option>
          <option value="host_communication">{t('reasonHostIssue')}</option>
          <option value="vehicle_concern">{t('reasonVehicleConcern')}</option>
          <option value="other">{t('reasonOther')}</option>
        </select>
      </div>

      <p className="text-xs text-gray-500">
        {t('refundProcessingInfo')}
      </p>
    </BottomSheet>
  )
}

interface PolicyFooterProps {
  booking: Booking
  compact?: boolean
}

export const PolicyFooter: React.FC<PolicyFooterProps> = ({ booking, compact }) => {
  const t = useTranslations('BookingDetail')
  const [showRentalAgreement, setShowRentalAgreement] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)

  return (
    <>
      <div className={`${compact ? 'mt-3' : 'mt-12'} bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('peerToPeerMarketplace')}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('connectingArizona')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => setShowInsuranceModal(true)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('insuranceRequirements')}</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">✓</span>
                      <span>{t('hostInsuranceRequired')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">✓</span>
                      <span>{t('rentersMustHaveCoverage')}</span>
                    </li>
                  </ul>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 inline-flex items-center">
                    {t('viewRequirements')}
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowCancellationModal(true)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('cancellationRefunds')}</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">•</span>
                      <span>{t('fullRefund72hrs')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">•</span>
                      <span>{t('depositAlwaysReleased')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">•</span>
                      <span>{t('noShowForfeits')}</span>
                    </li>
                  </ul>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 inline-flex items-center">
                    {t('refundPolicy')}
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowTrustSafetyModal(true)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DocumentText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('trustSafety')}</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">✓</span>
                      <span>{t('idVerificationRequired')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 dark:text-gray-500 mr-1">✓</span>
                      <span>{t('vehiclePhotosVerified')}</span>
                    </li>
                  </ul>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 inline-flex items-center">
                    {t('learnAboutSafety')}
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-2">
              {t('footerLegal')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('copyright')}
            </p>
          </div>
        </div>
      </div>

      {/* New RentalAgreementModal with proper props for dashboard context */}
      <RentalAgreementModal
        isOpen={showRentalAgreement}
        onClose={() => setShowRentalAgreement(false)}
        carDetails={{
          id: booking.car.id,
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          carType: booking.car.carType || 'standard',
          seats: booking.car.seats,
          dailyRate: booking.car.dailyRate || 0,
          rating: booking.car.rating,
          totalTrips: booking.car.totalTrips,
          address: booking.onboardingCompletedAt ? booking.pickupLocation : 'Phoenix, AZ',
          host: booking.host ? {
            name: booking.host.name,
            profilePhoto: booking.host.profilePhoto ?? undefined,
            responseTime: booking.host.responseTime
          } : undefined
        }}
        bookingDetails={{
          carId: booking.car.id,
          carClass: booking.car.carType || 'standard',
          startDate: booking.startDate,
          endDate: booking.endDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          deliveryType: booking.deliveryType || 'pickup',
          deliveryAddress: booking.onboardingCompletedAt ? (booking.pickupLocation || 'Phoenix, AZ') : 'Phoenix, AZ',
          insuranceType: booking.insuranceType || 'basic',
          addOns: {
            refuelService: false,
            additionalDriver: false,
            extraMiles: false,
            vipConcierge: false
          },
          pricing: {
            days: booking.numberOfDays || 0,
            dailyRate: booking.car.dailyRate || 0,
            basePrice: booking.subtotal || 0,
            insurancePrice: booking.insuranceFee || 0,
            deliveryFee: booking.deliveryFee,
            serviceFee: booking.serviceFee,
            taxes: booking.taxes,
            total: booking.totalAmount,
            deposit: booking.depositAmount,
            breakdown: {
              refuelService: 0,
              additionalDriver: 0,
              extraMiles: 0,
              vipConcierge: 0
            }
          }
        }}
        guestDetails={{
          name: booking.guestName || '',
          email: booking.guestEmail || '',
          bookingCode: booking.bookingCode,
          verificationStatus: booking.verificationStatus === 'APPROVED' ? 'APPROVED' :
                              booking.verificationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
          approvedAt: booking.reviewedAt ?? undefined,
          approvedBy: booking.reviewedBy ?? undefined
        }}
        context="dashboard"
        agreementTracking={{
          agreedAt: booking.agreementAcceptedAt ?? undefined,
          ipAddress: booking.bookingIpAddress ?? undefined,
          viewedAt: booking.createdAt
        }}
      />
      
      <InsuranceRequirementsModal 
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
      />
      <CancellationPolicyModal 
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
      />
      <TrustSafetyModal 
        isOpen={showTrustSafetyModal}
        onClose={() => setShowTrustSafetyModal(false)}
      />
    </>
  )
}