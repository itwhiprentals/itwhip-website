// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingSidebar.tsx

import React, { useRef } from 'react'
import { Booking } from '../types'
import { 
  ShieldCheck, CheckCircle, Key, User, Phone, Calendar,
  AlertCircle
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
        
        {/* Documents Under Review */}
        {(booking.verificationStatus === 'pending' || booking.verificationStatus === 'submitted') && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <HourglassOutline className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-yellow-800">
                <p className="font-medium mb-1">Documents Under Review</p>
                <p className="text-xs">
                  We're verifying your driver's license and insurance. This typically takes 1-2 hours during business hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Verified, Processing Payment */}
        {booking.verificationStatus === 'approved' && (booking.paymentStatus === 'pending' || booking.paymentStatus === 'PENDING') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <HourglassOutline className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">Processing Payment</p>
                <p className="text-xs">
                  Documents approved! Processing your payment of {formatCurrency(booking.totalAmount)}. 
                  This may take a few moments.
                </p>
              </div>
            </div>
          </div>
        )}

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
                    Refundable hold • Released 2-7 days after trip • Covers damages up to $3,000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          {/* Actions for Documents Pending */}
          {(booking.verificationStatus === 'pending' || booking.verificationStatus === 'submitted') && (
            <>
              <button
                onClick={onUploadClick}
                disabled={uploadingFile}
                className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 font-medium text-xs sm:text-sm"
              >
                {uploadingFile ? 'Uploading...' : 'Upload Docs'}
              </button>
              <button
                onClick={onCancelClick}
                className="px-3 sm:px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-xs sm:text-sm"
              >
                Cancel Free
              </button>
            </>
          )}
          
          {/* Actions for Payment Failed */}
          {(booking.paymentStatus === 'failed' || booking.paymentStatus === 'FAILED') && (
            <>
              <button
                onClick={handleUpdatePayment}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm"
              >
                Update Payment
              </button>
              <button
                onClick={onCancelClick}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
              >
                Cancel Booking
              </button>
            </>
          )}
          
          {/* Actions for Confirmed - FIXED payment status check */}
          {booking.status === 'CONFIRMED' && (booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID') && (
            <>
              <button 
                onClick={handleModifyDates}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm"
              >
                Modify Dates
              </button>
              <button
                onClick={onCancelClick}
                className="px-3 sm:px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-xs sm:text-sm"
              >
                Cancel
              </button>
            </>
          )}
          
          {/* Actions for Active Trip */}
          {booking.status === 'ACTIVE' && (
            <>
              <button 
                onClick={handleReportIssue}
                className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-xs sm:text-sm"
              >
                Report Issue
              </button>
              <button 
                onClick={handleEmergency}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency</span>
              </button>
            </>
          )}
          
          {/* Actions for Completed - REMOVED REVIEW BUTTON */}
          {booking.status === 'COMPLETED' && (
            <button
              onClick={handlePrintInvoice}
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
            >
              View Trip Summary
            </button>
          )}
          
          {/* Always Available Actions */}
          {booking.status !== 'COMPLETED' && (
            <button
              onClick={handlePrintInvoice}
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
            >
              Download Invoice
            </button>
          )}
          
          {booking.status === 'CONFIRMED' && (
            <button
              onClick={onAddToCalendar}
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* Host Info */}
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
      </div>
    </div>
  )
}