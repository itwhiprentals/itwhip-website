// app/(guest)/rentals/components/booking/BookingConfirmation.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { format } from 'date-fns'
import { 
  IoCheckmarkCircle,
  IoCarOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoCopyOutline,
  IoShareSocialOutline,
  IoDownloadOutline,
  IoNavigateOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface BookingConfirmationProps {
  bookingId: string
  booking?: any // Can be passed directly or fetched
}

export default function BookingConfirmation({ bookingId, booking: initialBooking }: BookingConfirmationProps) {
  const router = useRouter()
  const [booking, setBooking] = useState<any>(initialBooking)
  const [isLoading, setIsLoading] = useState(!initialBooking)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (!initialBooking && bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      const data = await response.json()
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking?.bookingCode || bookingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/rentals/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })
      if (response.ok) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 3000)
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const handleDownloadPDF = () => {
    // In production, this would generate a PDF
    window.print()
  }

  const handleAddToCalendar = () => {
    const event = {
      text: `Car Rental - ${booking?.car?.make} ${booking?.car?.model}`,
      dates: `${format(new Date(booking?.startDate), 'yyyyMMdd')}/${format(new Date(booking?.endDate), 'yyyyMMdd')}`,
      details: `Booking Code: ${booking?.bookingCode}\nPickup: ${booking?.pickupLocation}`,
    }
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}`
    window.open(googleCalendarUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking not found</p>
          <Link href="/rentals" className="text-amber-600 hover:underline">
            Back to Rentals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your car rental has been successfully booked
          </p>
        </div>

        {/* Booking Code */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking Code</p>
              <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                {booking.bookingCode || `RENT-${bookingId.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Copy booking code"
            >
              <IoCopyOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
          )}
        </div>

        {/* Booking Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Car Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {booking.car?.photos?.[0] && (
                  <img 
                    src={booking.car.photos[0].url} 
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {booking.car?.year} {booking.car?.make} {booking.car?.model}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {booking.car?.carType} • {booking.car?.transmission} • {booking.car?.seats} seats
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCarOutline className="w-4 h-4 mr-1" />
                    <span>License: {booking.car?.licensePlate || 'Will be provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup & Return */}
          <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                PICKUP
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoCalendarOutline className="w-5 h-5 mr-2" />
                  <span>{format(new Date(booking.startDate), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoTimeOutline className="w-5 h-5 mr-2" />
                  <span>{booking.startTime || '10:00 AM'}</span>
                </div>
                <div className="flex items-start text-gray-600 dark:text-gray-400">
                  <IoLocationOutline className="w-5 h-5 mr-2 mt-0.5" />
                  <span className="flex-1">{booking.pickupLocation}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                RETURN
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoCalendarOutline className="w-5 h-5 mr-2" />
                  <span>{format(new Date(booking.endDate), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoTimeOutline className="w-5 h-5 mr-2" />
                  <span>{booking.endTime || '10:00 AM'}</span>
                </div>
                <div className="flex items-start text-gray-600 dark:text-gray-400">
                  <IoLocationOutline className="w-5 h-5 mr-2 mt-0.5" />
                  <span className="flex-1">{booking.returnLocation || booking.pickupLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Host Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              HOST INFORMATION
            </h3>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {(booking.host?.partnerLogo || booking.host?.profilePhoto) && (
                  <img
                    src={booking.host.partnerLogo || booking.host.profilePhoto}
                    alt={booking.host.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.host?.name || 'ItWhip Host'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Response time: ~{booking.host?.responseTime || 15} minutes
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                {booking.host?.phone && (
                  <a 
                    href={`tel:${booking.host.phone}`}
                    className="flex items-center text-sm text-amber-600 hover:underline"
                  >
                    <IoCallOutline className="w-4 h-4 mr-1" />
                    {booking.host.phone}
                  </a>
                )}
                {booking.host?.email && (
                  <a 
                    href={`mailto:${booking.host.email}`}
                    className="flex items-center text-sm text-amber-600 hover:underline"
                  >
                    <IoMailOutline className="w-4 h-4 mr-1" />
                    Contact Host
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              PRICE SUMMARY
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>${booking.dailyRate}/day × {booking.numberOfDays} days</span>
                <span>${booking.subtotal}</span>
              </div>
              {booking.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery fee</span>
                  <span>${booking.deliveryFee}</span>
                </div>
              )}
              {booking.insuranceFee > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Insurance</span>
                  <span>${booking.insuranceFee}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Service fee</span>
                <span>${booking.serviceFee}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Taxes</span>
                <span>${booking.taxes}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${booking.totalAmount}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Plus ${booking.depositAmount} refundable deposit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Important Information
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>• Bring your driver's license and credit card for pickup</li>
                <li>• The ${booking.depositAmount} deposit will be held on your card</li>
                <li>• Return the car with the same fuel level to avoid charges</li>
                <li>• Contact the host 30 minutes before pickup</li>
                <li>• Take photos of the car before and after your trip</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleSendEmail}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <IoMailOutline className="w-5 h-5 mr-2" />
            {emailSent ? 'Email Sent!' : 'Send Confirmation Email'}
          </button>

          <button
            onClick={handleAddToCalendar}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <IoCalendarOutline className="w-5 h-5 mr-2" />
            Add to Calendar
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <IoDownloadOutline className="w-5 h-5 mr-2" />
            Download PDF
          </button>

          <Link
            href={`/rentals/manage/${bookingId}`}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
          >
            <IoDocumentTextOutline className="w-5 h-5 mr-2" />
            View Booking Details
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need to book another car?
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/rentals"
              className="text-amber-600 hover:underline font-semibold"
            >
              Browse More Cars
            </Link>
            <Link
              href="/rentals/manage"
              className="text-amber-600 hover:underline font-semibold"
            >
              Manage Bookings
            </Link>
            <Link
              href="/"
              className="text-amber-600 hover:underline font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}