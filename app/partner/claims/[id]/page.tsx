// app/partner/claims/[id]/page.tsx
// Partner Claim Detail Page

'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoReceiptOutline,
  IoChatbubbleOutline
} from 'react-icons/io5'

interface ClaimDetail {
  id: string
  type: string
  status: string
  description: string
  incidentDate: string
  createdAt: string
  updatedAt: string
  estimatedCost: number | null
  approvedAmount: number | null
  paidAmount: number | null
  photos: Array<{
    id: string
    url: string
    order: number
    uploadedBy: string
    createdAt: string
  }>
  messages: Array<{
    id: string
    senderType: string
    senderName: string | null
    message: string
    isRead: boolean
    createdAt: string
  }>
}

interface Booking {
  id: string
  bookingCode: string | null
  startDate: string
  endDate: string
  status: string
  totalAmount: number
}

interface Vehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  licensePlate: string | null
  vin: string | null
  photo: string | null
}

interface Renter {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  photo: string | null
}

const CLAIM_TYPE_LABELS: Record<string, string> = {
  ACCIDENT: 'Accident',
  THEFT: 'Theft',
  VANDALISM: 'Vandalism',
  CLEANING: 'Cleaning',
  MECHANICAL: 'Mechanical',
  WEATHER: 'Weather Damage',
  OTHER: 'Other'
}

const CLAIM_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    icon: <IoTimeOutline className="w-4 h-4" />
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: <IoTimeOutline className="w-4 h-4" />
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: <IoCheckmarkCircleOutline className="w-4 h-4" />
  },
  DENIED: {
    label: 'Denied',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    icon: <IoCloseCircleOutline className="w-4 h-4" />
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: <IoCheckmarkCircleOutline className="w-4 h-4" />
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    icon: <IoWarningOutline className="w-4 h-4" />
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    icon: <IoCheckmarkCircleOutline className="w-4 h-4" />
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    icon: <IoCloseCircleOutline className="w-4 h-4" />
  }
}

export default function ClaimDetailPage() {
  const router = useRouter()
  const params = useParams()
  const claimId = params?.id as string

  const locale = useLocale()


  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [renter, setRenter] = useState<Renter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (claimId) {
      fetchClaimDetail()
    }
  }, [claimId])

  const fetchClaimDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partner/claims/${claimId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch claim details')
      }

      const data = await response.json()
      setClaim(data.claim)
      setBooking(data.booking)
      setVehicle(data.vehicle)
      setRenter(data.renter)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error || 'Claim not found'}</p>
        </div>
      </div>
    )
  }

  const statusConfig = CLAIM_STATUS_CONFIG[claim.status] || CLAIM_STATUS_CONFIG.PENDING

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          <span>Back to Claims</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {CLAIM_TYPE_LABELS[claim.type] || claim.type} Claim
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Filed on {formatDate(claim.createdAt)}
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="text-sm font-medium">{statusConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Claim Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="mt-1 text-gray-900 dark:text-white">{claim.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Incident Date</label>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDate(claim.incidentDate)}</p>
              </div>

              {claim.estimatedCost && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Cost</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{formatCurrency(claim.estimatedCost)}</p>
                </div>
              )}

              {claim.approvedAmount && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Amount</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{formatCurrency(claim.approvedAmount)}</p>
                </div>
              )}

              {claim.paidAmount && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Amount</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{formatCurrency(claim.paidAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {claim.photos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoImageOutline className="w-5 h-5" />
                Damage Photos ({claim.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {claim.photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo.url)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt="Damage photo"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {claim.messages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoChatbubbleOutline className="w-5 h-5" />
                Messages ({claim.messages.length})
              </h2>
              <div className="space-y-4">
                {claim.messages.map((message) => (
                  <div key={message.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.senderName || message.senderType}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Info */}
          {vehicle && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoCarOutline className="w-5 h-5" />
                Vehicle
              </h2>
              {vehicle.photo && (
                <img
                  src={vehicle.photo}
                  alt={vehicle.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{vehicle.name}</p>
                {vehicle.licensePlate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    License: {vehicle.licensePlate}
                  </p>
                )}
                {vehicle.vin && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    VIN: {vehicle.vin}
                  </p>
                )}
                <Link
                  href={`/partner/fleet/${vehicle.id}`}
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  View Vehicle Details →
                </Link>
              </div>
            </div>
          )}

          {/* Renter Info */}
          {renter && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoPersonOutline className="w-5 h-5" />
                Renter
              </h2>
              <div className="space-y-2">
                {renter.photo && (
                  <img
                    src={renter.photo}
                    alt={renter.name || 'Renter'}
                    className="w-12 h-12 rounded-full mb-2"
                  />
                )}
                <p className="font-medium text-gray-900 dark:text-white">{renter.name || 'Unknown'}</p>
                {renter.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{renter.email}</p>
                )}
                {renter.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{renter.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Booking Info */}
          {booking && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoReceiptOutline className="w-5 h-5" />
                Booking
              </h2>
              <div className="space-y-2">
                {booking.bookingCode && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code: {booking.bookingCode}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {formatCurrency(booking.totalAmount)}
                </p>
                <Link
                  href={`/partner/bookings/${booking.id}`}
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  View Booking Details →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={selectedPhoto}
              alt="Full size"
              className="max-w-full max-h-screen object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <IoArrowBackOutline className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
