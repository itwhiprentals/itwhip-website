// app/fleet/bookings/components/BookingDetailDrawer.tsx
'use client'

import Link from 'next/link'
import {
  IoCloseOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCardOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoOpenOutline
} from 'react-icons/io5'
import { FleetBooking, formatCurrency, formatDate, formatDateTime, getStatusColor, getVerificationColor, getTripStatusLabel, getReviewStatusColor, getReviewStatusLabel } from '../types'
import { BookingQuickActions } from './BookingQuickActions'

interface BookingDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  booking: FleetBooking | null
  onAction: (action: string) => void
  actionLoading: boolean
}

export function BookingDetailDrawer({
  isOpen,
  onClose,
  booking,
  onAction,
  actionLoading
}: BookingDetailDrawerProps) {
  if (!isOpen || !booking) return null

  const isHighRisk = (booking.riskScore || 0) >= 60

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {booking.bookingCode}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getVerificationColor(booking.verificationStatus)}`}>
                {booking.verificationStatus}
              </span>
              {booking.fleetStatus && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  booking.fleetStatus === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  booking.fleetStatus === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  Fleet: {booking.fleetStatus}
                </span>
              )}
              {booking.hostStatus && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  booking.hostStatus === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  booking.hostStatus === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>
                  Host: {booking.hostStatus}
                </span>
              )}
              {booking.hostFinalReviewStatus && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getReviewStatusColor(booking.hostFinalReviewStatus)}`}>
                  {getReviewStatusLabel(booking.hostFinalReviewStatus)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/rentals/bookings/${booking.id}`}
              target="_blank"
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Open in Admin"
            >
              <IoOpenOutline className="w-5 h-5" />
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Risk Alert */}
        {(isHighRisk || booking.flaggedForReview) && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <IoWarningOutline className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {isHighRisk ? `High Risk Score: ${booking.riskScore}/100` : 'Flagged for Review'}
              </span>
            </div>
            {booking.riskFlags && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-7">
                {booking.riskFlags}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
            <BookingQuickActions
              booking={booking}
              onAction={onAction}
              loading={actionLoading}
            />
          </div>

          {/* Guest Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4" />
              Guest Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestName}</span>
                  {booking.guestStripeVerified && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-medium">
                      <IoShieldCheckmarkOutline className="w-3 h-3" />
                      Stripe Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestEmail}</span>
              </div>
              {booking.guestPhone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestPhone}</span>
                </div>
              )}
              {booking.guestId && (
                <Link
                  href={`/fleet/guests/${booking.guestId}`}
                  className="text-xs text-purple-600 hover:underline block text-right"
                >
                  View Guest Profile →
                </Link>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoCarOutline className="w-4 h-4" />
              Vehicle
            </h3>
            <div className="flex gap-3">
              {booking.car.photoUrl && (
                <img
                  src={booking.car.photoUrl}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  className="w-20 h-14 object-cover rounded"
                />
              )}
              <div className="flex-1 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.car.year} {booking.car.make} {booking.car.model}
                </p>
                {booking.car.licensePlate && (
                  <p className="text-xs text-gray-500">{booking.car.licensePlate}</p>
                )}
                <p className="text-xs text-gray-500">Host: {booking.host.name}</p>
                <Link
                  href={`/fleet/hosts/${booking.host.id}`}
                  className="text-xs text-purple-600 hover:underline"
                >
                  View Host →
                </Link>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoCalendarOutline className="w-4 h-4" />
              Trip Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Start</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(booking.startDate)} at {booking.startTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">End</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(booking.endDate)} at {booking.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.numberOfDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Trip Status</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getTripStatusLabel(booking.tripStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoLocationOutline className="w-4 h-4" />
              Location
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pickup Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{booking.pickupType}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Pickup Location</span>
                <span className="text-sm text-gray-900 dark:text-white">{booking.pickupLocation}</span>
              </div>
              {booking.deliveryAddress && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Delivery Address</span>
                  <span className="text-sm text-gray-900 dark:text-white">{booking.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoCardOutline className="w-4 h-4" />
              Payment
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Daily Rate</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.dailyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Delivery Fee</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                </div>
              )}
              {booking.insuranceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Insurance</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.insuranceFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Service Fee</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxes</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.taxes)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deposit</span>
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(booking.depositAmount)}</span>
              </div>
              {booking.hostFinalReviewStatus && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Deposit Review</span>
                  <span className={`text-sm font-medium ${
                    booking.hostFinalReviewStatus === 'APPROVED' || booking.hostFinalReviewStatus === 'AUTO_APPROVED'
                      ? 'text-green-600' : booking.hostFinalReviewStatus === 'CLAIM_FILED'
                      ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {getReviewStatusLabel(booking.hostFinalReviewStatus)}
                  </span>
                </div>
              )}
              {booking.depositRefunded && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Deposit Released</span>
                  <span className="text-sm text-green-600 font-medium">Yes</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Status</span>
                <span className={`text-sm font-medium ${
                  booking.paymentStatus === 'PAID' ? 'text-green-600' :
                  booking.paymentStatus === 'AUTHORIZED' ? 'text-blue-600' :
                  booking.paymentStatus === 'CANCELLED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {booking.paymentStatus === 'AUTHORIZED' ? 'AUTHORIZED (Hold)' : booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoDocumentTextOutline className="w-4 h-4" />
              Verification
            </h3>
            <div className="space-y-3">
              {/* License */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {booking.licensePhotoUrl ? (
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  ) : (
                    <IoWarningOutline className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Driver's License</span>
                </div>
                {booking.licensePhotoUrl && (
                  <a href={booking.licensePhotoUrl} target="_blank" className="text-xs text-purple-600 hover:underline">
                    View
                  </a>
                )}
              </div>

              {/* Insurance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {booking.insurancePhotoUrl ? (
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  ) : (
                    <IoWarningOutline className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Insurance Proof</span>
                </div>
                {booking.insurancePhotoUrl && (
                  <a href={booking.insurancePhotoUrl} target="_blank" className="text-xs text-purple-600 hover:underline">
                    View
                  </a>
                )}
              </div>

              {/* Selfie */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {booking.selfiePhotoUrl ? (
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  ) : (
                    <IoWarningOutline className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Selfie Verification</span>
                </div>
                {booking.selfiePhotoUrl && (
                  <a href={booking.selfiePhotoUrl} target="_blank" className="text-xs text-purple-600 hover:underline">
                    View
                  </a>
                )}
              </div>

              {booking.verificationNotes && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Notes: {booking.verificationNotes}</p>
                </div>
              )}

              {booking.reviewedAt && (
                <div className="text-xs text-gray-500">
                  Reviewed by {booking.reviewedBy} on {formatDateTime(booking.reviewedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Disputes/Claims */}
          {(booking.hasDispute || (booking as any).hasClaim) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Issues</h3>
              {booking.disputes?.map((dispute: any) => (
                <div key={dispute.id} className="text-sm text-red-600 dark:text-red-400">
                  Dispute: {dispute.type} - {dispute.status}
                </div>
              ))}
              {(booking as any).claims?.map((claim: any) => (
                <div key={claim.id} className="text-sm text-red-600 dark:text-red-400">
                  Claim: {claim.type} - {claim.status} ({formatCurrency(Number(claim.estimatedCost) || 0)})
                </div>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {formatDateTime(booking.createdAt)}</p>
            <p>Updated: {formatDateTime(booking.updatedAt)}</p>
            {booking.cancelledAt && (
              <p className="text-red-500">
                Cancelled: {formatDateTime(booking.cancelledAt)} by {booking.cancelledBy}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
