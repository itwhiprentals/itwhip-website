// app/admin/rentals/verifications/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoExpandOutline,
  IoWarningOutline,
  IoDownloadOutline,
  IoEyeOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  documentsSubmittedAt?: string
  verificationStatus: string
  verificationNotes?: string
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
    host: {
      name: string
      email: string
      phone?: string
    }
  }
  startDate: string
  endDate: string
  totalAmount: number
}

export default function VerificationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/admin/rentals/verifications/${bookingId}/approve`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      
      const data = await response.json()
      setBooking(data)
      setNotes(data.verificationNotes || '')
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!notes.trim() && action === 'reject') {
      setError('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/rentals/verifications/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: notes.trim() || (action === 'approve' ? 'Documents verified successfully' : 'Verification requirements not met')
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        // Navigate back to dashboard, specifically to the verifications tab
        router.push('/admin/dashboard#verifications')
      } else {
        setError(data.error || `Failed to ${action} booking`)
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error)
      setError(`Failed to ${action} booking`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <IoWarningOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/dashboard#verifications" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard#verifications"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to P2P Verifications
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verification Review
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Booking #{booking.bookingCode}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              booking.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
              booking.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.verificationStatus}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documents Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoDocumentTextOutline className="w-6 h-6 mr-2" />
                Verification Documents
              </h2>
              
              {booking.documentsSubmittedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Submitted: {new Date(booking.documentsSubmittedAt).toLocaleString()}
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Driver's License */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Driver's License
                  </h3>
                  {booking.licensePhotoUrl ? (
                    <div>
                      <div className="relative group cursor-pointer"
                        onClick={() => setExpandedImage(booking.licensePhotoUrl!)}>
                        <img
                          src={booking.licensePhotoUrl}
                          alt="Driver's License"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                          <IoExpandOutline className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      {booking.licenseNumber && (
                        <div className="mt-3 space-y-1 text-sm">
                          <p><span className="font-medium">License #:</span> {booking.licenseNumber}</p>
                          <p><span className="font-medium">State:</span> {booking.licenseState}</p>
                          <p><span className="font-medium">Expires:</span> {booking.licenseExpiry ? new Date(booking.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No license uploaded</p>
                    </div>
                  )}
                </div>

                {/* Insurance Proof */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Insurance Proof
                  </h3>
                  {booking.insurancePhotoUrl ? (
                    <div className="relative group cursor-pointer"
                      onClick={() => setExpandedImage(booking.insurancePhotoUrl!)}>
                      <img
                        src={booking.insurancePhotoUrl}
                        alt="Insurance Proof"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <IoExpandOutline className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No insurance uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Actions */}
            {booking.verificationStatus === 'submitted' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Review Decision
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Internal Notes (Optional for approval, required for rejection)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add any notes about your decision..."
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                        Approve Booking
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <IoCloseCircle className="w-5 h-5 mr-2" />
                        Reject Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guest Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoPersonOutline className="w-5 h-5 mr-2" />
                Guest Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {booking.guestName}</p>
                <p><span className="font-medium">Email:</span> {booking.guestEmail}</p>
                <p><span className="font-medium">Phone:</span> {booking.guestPhone}</p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoCarOutline className="w-5 h-5 mr-2" />
                Vehicle Details
              </h3>
              {booking.car.photos?.[0] && (
                <img 
                  src={booking.car.photos[0].url}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="space-y-2 text-sm">
                <p className="font-medium">{booking.car.year} {booking.car.make} {booking.car.model}</p>
                <p><span className="font-medium">Host:</span> {booking.car.host.name}</p>
                <p><span className="font-medium">Pickup:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Return:</span> {new Date(booking.endDate).toLocaleDateString()}</p>
                <p className="text-lg font-bold mt-3">${booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={expandedImage}
              alt="Expanded document"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <IoCloseCircle className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}