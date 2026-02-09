// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingSidebar.tsx

import React, { useRef } from 'react'
import { Booking } from '../types'
import {
  ShieldCheck, CheckCircle, Key, User, Phone, Calendar,
  AlertCircle, MessageSquare
} from './Icons'
import { IoHourglassOutline as HourglassOutline } from 'react-icons/io5'
import {
  calculateTripDays, formatCurrency, getHoursUntilPickup
} from '../utils/helpers'
import { TIME_THRESHOLDS } from '../constants'

interface BookingSidebarProps {
  booking: Booking
  onCancelClick: () => void
  onUploadClick: () => void
  onAddToCalendar: () => void
  uploadingFile: boolean
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  booking,
  onCancelClick,
  onUploadClick,
  onAddToCalendar,
  uploadingFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tripDays = calculateTripDays(booking.startDate, booking.endDate)
  const hoursUntilPickup = getHoursUntilPickup(booking.startDate)

  const handlePrintInvoice = () => {
    window.print() // In production, implement proper invoice generation
  }

  const handleReportIssue = () => {
    // Navigate to issue reporting or open support chat
    window.location.href = `/support?booking=${booking.bookingCode}`
  }

  const handleEmergency = () => {
    if (confirm('Call ItWhip Support? For life-threatening emergencies, please call 911.')) {
      window.location.href = 'tel:+16025551234'
    }
  }

  const handleModifyDates = () => {
    window.location.href = `/support?booking=${booking.bookingCode}&action=modify-dates`
  }

  const handleUpdatePayment = () => {
    window.location.href = `/support?booking=${booking.bookingCode}&action=update-payment`
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Summary</h2>
        
        {/* Payment Failed */}
        {booking.verificationStatus === 'approved' && (booking.paymentStatus === 'failed' || booking.paymentStatus === 'FAILED') && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-red-800">
                <p className="font-medium mb-1">Payment Failed - Action Required</p>
                <p className="text-xs mb-2">
                  Your documents are approved but payment couldn't be processed. 
                  Please update your payment method within 24 hours to secure your booking.
                </p>
                <button
                  onClick={handleUpdatePayment}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                >
                  Update Payment Method →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Successful - FIXED to check both cases */}
        {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID' || booking.paymentStatus === 'captured' || booking.paymentStatus === 'CAPTURED') && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-green-800">
                <p className="font-medium mb-1">Payment Confirmed</p>
                <p className="text-xs">
                  Your payment of {formatCurrency(booking.totalAmount)} has been processed successfully. 
                  Receipt sent to {booking.guestEmail}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">
              {formatCurrency(booking.dailyRate)}/day × {tripDays} days
            </span>
            <span className="font-medium">
              {formatCurrency(booking.dailyRate * tripDays)}
            </span>
          </div>
          
          {booking.deliveryFee > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Delivery fee</span>
              <span>{formatCurrency(booking.deliveryFee)}</span>
            </div>
          )}
          
          {booking.insuranceFee > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Insurance protection</span>
              <span>{formatCurrency(booking.insuranceFee)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">ItWhip service fee</span>
            <span>{formatCurrency(booking.serviceFee)}</span>
          </div>
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">AZ taxes & fees</span>
            <span>{formatCurrency(booking.taxes)}</span>
          </div>
          
          <div className="border-t pt-2.5 sm:pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-semibold">Trip Total</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-semibold">
                  {formatCurrency(booking.totalAmount)}
                </span>
                {booking.status === 'PENDING' && !(booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID') && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {booking.verificationStatus === 'approved' ? 'Processing now' : 'Due at confirmation'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {booking.depositAmount > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg mt-3">
              <div className="flex items-start">
                <Key className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-900">
                    Security Deposit: {formatCurrency(booking.depositAmount)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Refundable hold • Released 2-7 days after trip • Covers damages up to {formatCurrency(booking.depositAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Host & Messages */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Host</h2>

        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{booking.host.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
              <div className="flex items-center">
                <span className="text-yellow-500 text-xs sm:text-sm">★</span>
                <span className="text-xs sm:text-sm text-gray-600 ml-0.5">{booking.host.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs sm:text-sm text-gray-600">~{booking.host.responseTime}min</span>
            </div>
          </div>
        </div>

        {(booking.status === 'ACTIVE' || (booking.status === 'CONFIRMED' && hoursUntilPickup <= TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS)) && (
          <button className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Contact Host: {booking.host.phone}
          </button>
        )}

        {/* Messages */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {booking.status === 'PENDING' ? (
            <div className="w-full flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Message Host</span>
              <span className="text-[10px]">Available after confirmation</span>
            </div>
          ) : (
            <a
              href="/messages"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message Host
            </a>
          )}
        </div>
      </div>
    </div>
  )
}