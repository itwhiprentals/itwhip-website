'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface Booking {
  id: string
  bookingCode: string
  status: string
  verificationStatus: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  totalAmount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  pickupLocation: string
  pickupType: string
  deliveryAddress?: string
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string; caption?: string }>
  }
  host: {
    name: string
    phone?: string
    email: string
  }
  documents?: Array<{
    id: string
    type: string
    url: string
    status: string
    uploadedAt: string
  }>
}

export default function BookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ bookingId: string }> 
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const t = useTranslations('BookingDetails')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [resolvedParams.bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${resolvedParams.bookingId}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      const data = await response.json()
      setBooking(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!confirm(t('confirmCancel'))) return

    try {
      const response = await fetch(`/api/rentals/bookings/${resolvedParams.bookingId}/cancel`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to cancel booking')
      await fetchBooking()
      alert(t('bookingCancelledSuccess'))
    } catch (err) {
      alert(t('failedToCancelBooking'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('bookingNotFound')}</h2>
          <p className="text-gray-600 mb-6">{error || t('bookingNotFoundDescription')}</p>
          <Link href="/rentals/search" className="text-purple-600 hover:underline">
            {t('searchForCars')}
          </Link>
        </div>
      </div>
    )
  }

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800'
  }[booking.status] || 'bg-gray-100 text-gray-800'

  const verificationStatusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NOT_REQUIRED: 'bg-gray-100 text-gray-800'
  }[booking.verificationStatus] || 'bg-gray-100 text-gray-800'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('bookingTitle', { bookingCode: booking.bookingCode })}</h1>
              <p className="text-gray-600 mt-2">{t('bookedBy', { guestName: booking.guestName })}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {t(`status_${booking.status}` as any)}
              </span>
              {booking.verificationStatus !== 'NOT_REQUIRED' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationStatusColor}`}>
                  {t('verificationLabel')}: {t(`verification_${booking.verificationStatus}` as any)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Car Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('vehicleDetails')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {booking.car.photos?.[0] && (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={booking.car.photos[0].url}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {booking.car.year} {booking.car.make} {booking.car.model}
              </h3>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">{t('pickUp')}</span> {new Date(booking.startDate).toLocaleDateString()} at {booking.startTime}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('returnLabel')}</span> {new Date(booking.endDate).toLocaleDateString()} at {booking.endTime}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('location')}</span> {booking.pickupLocation}
                </p>
                {booking.pickupType === 'DELIVERY' && booking.deliveryAddress && (
                  <p className="text-gray-600">
                    <span className="font-medium">{t('deliveryTo')}</span> {booking.deliveryAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Host Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('hostInformation')}</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">{t('nameLabel')}</span> {booking.host.name}
            </p>
            {booking.host.phone && (
              <p className="text-gray-600">
                <span className="font-medium">{t('phoneLabel')}</span> {booking.host.phone}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium">{t('emailLabel')}</span> {booking.host.email}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        {booking.verificationStatus === 'PENDING' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">{t('verificationRequired')}</h2>
            <p className="text-yellow-700 mb-4">
              {t('verificationRequiredDescription')}
            </p>
            <Link
              href={`/rentals/manage/${resolvedParams.bookingId}/verify`}
              className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {t('uploadDocuments')}
            </Link>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('paymentSummary')}</h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('totalAmount')}</span>
              <span className="font-semibold">${booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex gap-4">
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={handleCancelBooking}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('cancelBooking')}
              </button>
            )}
            <Link
              href="/rentals/search"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('browseMoreCars')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}