// app/(guest)/rentals/verify/[token]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DocumentUpload from '@/app/[locale]/(guest)/rentals/components/verification/DocumentUpload'
import VerificationStatus from '@/app/[locale]/(guest)/rentals/components/verification/VerificationStatus'
import GuestPrompt from '@/app/[locale]/(guest)/rentals/components/verification/GuestPrompt'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoWarningOutline,
  IoCheckmarkCircle  // Added missing import
} from 'react-icons/io5'

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false)

  useEffect(() => {
    validateTokenAndFetchBooking()
  }, [token])

  const validateTokenAndFetchBooking = async () => {
    try {
      const response = await fetch(`/api/rentals/guest/${token}`)
      const data = await response.json()
      
      if (!data.success) {
        setError(data.error || 'Invalid token')
        return
      }
      
      setBooking(data.booking)
      setDocumentsSubmitted(!!data.booking.documentsSubmittedAt)
    } catch (err) {
      console.error('Token validation error:', err)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = () => {
    setDocumentsSubmitted(true)
    validateTokenAndFetchBooking() // Refresh booking data
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading verification...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <IoWarningOutline className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/rentals')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Go to Rentals
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/rentals/dashboard/guest/${token}`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verification Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Booking #{booking.bookingCode}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Car Info & Status */}
          <div className="lg:col-span-1">
            {/* Car Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <IoCarOutline className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Rental
                </h3>
              </div>
              
              {booking.car.photos?.[0] && (
                <img 
                  src={booking.car.photos[0].url}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {booking.car.year} {booking.car.make} {booking.car.model}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pickup</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Return</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ${booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <VerificationStatus 
              bookingId={booking.id} 
              token={token}
            />
          </div>

          {/* Right Column - Upload or Conversion */}
          <div className="lg:col-span-2">
            {!documentsSubmitted ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <DocumentUpload
                  bookingId={booking.id}
                  token={token}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <IoCheckmarkCircle className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Documents Submitted Successfully
                      </h3>
                      <p className="text-green-700 dark:text-green-300 mt-1">
                        We'll review your documents and notify you within 2 hours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guest Prompt */}
                {booking.guestEmail && !booking.renterId && (
                  <GuestPrompt
                    email={booking.guestEmail}
                    token={token}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}