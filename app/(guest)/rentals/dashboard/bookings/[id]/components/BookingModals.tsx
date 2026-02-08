// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingModals.tsx

import React, { useState } from 'react'
import Link from 'next/link'
import { Booking } from '../types'
import { XCircle, DocumentText, ShieldCheck, Calendar, ArrowForward } from './Icons'
import { calculateRefund, formatCurrency } from '../utils/helpers'

// Import all modal components from the main rentals area
import RentalAgreementModal from '@/app/(guest)/rentals/components/modals/RentalAgreementModal'
import InsuranceRequirementsModal from '@/app/(guest)/rentals/components/modals/InsuranceRequirementsModal'
import CancellationPolicyModal from '@/app/(guest)/rentals/components/modals/CancellationPolicyModal'
import TrustSafetyModal from '@/app/(guest)/rentals/components/modals/TrustSafetyModal'

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
  const [cancellationReason, setCancellationReason] = useState('')
  const refundInfo = calculateRefund(booking)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm sm:max-w-md w-full p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          Cancel Booking?
        </h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">Refund Summary</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Trip Total</span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Refund Amount ({refundInfo.label})</span>
              <span className="font-medium text-green-600">
                {formatCurrency(refundInfo.totalRefund)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Refund will be processed within 3-5 business days. Arizona TPT taxes will be refunded per state regulations.
          </p>
        </div>
        
        <textarea
          placeholder="Reason for cancellation (optional)"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-4"
          rows={3}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
        />
        
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onConfirm(cancellationReason)}
            className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

interface PolicyFooterProps {
  booking: Booking
}

export const PolicyFooter: React.FC<PolicyFooterProps> = ({ booking }) => {
  const [showRentalAgreement, setShowRentalAgreement] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)

  return (
    <>
      <div className="mt-12 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-900">Peer-to-Peer Vehicle Marketplace</span>
            </div>
            <p className="text-xs text-gray-600">
              Connecting Arizona drivers since 2019 • Verified hosts & vehicles • Secure platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Insurance Requirements</h4>
                  <ul className="text-xs text-gray-600 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-1">✓</span>
                      <span>Host insurance verification required</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-1">✓</span>
                      <span>Renters must have valid coverage</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowInsuranceModal(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    View requirements
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Cancellation & Refunds</h4>
                  <ul className="text-xs text-gray-600 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      <span>Full refund 48hrs+ before</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      <span>50% refund 24-48hrs before</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowCancellationModal(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    Refund policy
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DocumentText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Trust & Safety</h4>
                  <ul className="text-xs text-gray-600 space-y-1 mb-3">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-1">✓</span>
                      <span>ID verification required</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-1">✓</span>
                      <span>Vehicle photos verified</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowTrustSafetyModal(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    Learn about safety
                    <ArrowForward className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => setShowRentalAgreement(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <DocumentText className="w-4 h-4 mr-2" />
              View Rental Agreement
            </button>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 max-w-3xl mx-auto mb-2">
              By booking, you agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>, 
              {' '}<Link href="/policies/rental-agreement" className="text-blue-600 hover:underline">Rental Agreement</Link>, 
              and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
              ItWhip facilitates connections between vehicle owners and renters. All insurance coverage is provided through individual policies.
              Rentals subject to Arizona Transaction Privilege Tax where applicable.
            </p>
            <p className="text-xs text-gray-400">
              © 2019-2025 ItWhip Technologies, Inc. • Phoenix, Arizona
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
          address: booking.pickupLocation,
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
          deliveryAddress: booking.pickupLocation,
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