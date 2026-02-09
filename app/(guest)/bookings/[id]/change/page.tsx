// app/(guest)/bookings/[id]/change/page.tsx
// Guest vehicle change page — reached via email link with token

'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSwapHorizontalOutline,
  IoTimeOutline,
  IoCarOutline
} from 'react-icons/io5'

interface VehicleChangeData {
  booking: {
    id: string
    bookingCode: string
    guestName: string
    startDate: string
    endDate: string
    numberOfDays: number
    originalTotal: number
    reason: string
    expiresAt: string
  }
  originalCar: {
    name: string
    dailyRate: number
    image: string | null
  } | null
  newCar: {
    name: string
    dailyRate: number
    image: string | null
  }
}

export default function VehicleChangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<VehicleChangeData | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'accept' | 'decline'; message: string } | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid link — no token provided')
      setLoading(false)
      return
    }

    fetch(`/api/bookings/${bookingId}/vehicle-change?token=${token}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          setError(json.error)
        } else {
          setData(json)
        }
      })
      .catch(() => setError('Failed to load vehicle change details'))
      .finally(() => setLoading(false))
  }, [bookingId, token])

  const handleAction = async (action: 'accept' | 'decline') => {
    if (!token) return

    if (action === 'decline' && !confirm('Are you sure? Your payment hold will be released and the booking will be cancelled.')) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/vehicle-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, token })
      })
      const json = await res.json()

      if (json.success) {
        setResult({ type: action, message: json.message })
      } else {
        setError(json.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to process your choice')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <IoCloseCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to ItWhip Homepage
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {result.type === 'accept' ? (
            <IoCheckmarkCircleOutline className="w-12 h-12 text-green-500 mx-auto mb-4" />
          ) : (
            <IoCloseCircleOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {result.type === 'accept' ? 'Vehicle Change Accepted' : 'Booking Cancelled'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{result.message}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to ItWhip Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { booking, originalCar, newCar } = data
  const expiresAt = new Date(booking.expiresAt)
  const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <IoSwapHorizontalOutline className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Change</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Booking #{booking.bookingCode}</p>
        </div>

        {/* Expiry notice */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3 mb-6">
          <IoTimeOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            This offer expires in <strong>{hoursLeft} hours</strong>
          </span>
        </div>

        {/* Reason */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Hi {booking.guestName.split(' ')[0]}, {booking.reason}
          </p>
        </div>

        {/* Vehicle comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
          {/* Original vehicle */}
          {originalCar && (
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 opacity-60">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Original Vehicle</p>
              <div className="flex items-center gap-4">
                {originalCar.image ? (
                  <img src={originalCar.image} alt={originalCar.name} className="w-24 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <IoCarOutline className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white line-through">{originalCar.name}</p>
                  <p className="text-sm text-gray-500">${originalCar.dailyRate}/day</p>
                </div>
              </div>
            </div>
          )}

          {/* New vehicle */}
          <div className="p-5">
            <p className="text-xs font-semibold text-green-600 uppercase mb-3">New Vehicle</p>
            <div className="flex items-center gap-4">
              {newCar.image ? (
                <img src={newCar.image} alt={newCar.name} className="w-24 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <IoCarOutline className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{newCar.name}</p>
                <p className="text-sm text-green-600 font-medium">${newCar.dailyRate}/day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Dates</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500 dark:text-gray-400">Duration</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {booking.numberOfDays} day{booking.numberOfDays > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleAction('accept')}
            disabled={submitting}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <IoCheckmarkCircleOutline className="w-5 h-5" />
            )}
            Accept New Vehicle
          </button>

          <button
            onClick={() => handleAction('decline')}
            disabled={submitting}
            className="w-full py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
          >
            <IoCloseCircleOutline className="w-5 h-5" />
            Decline &amp; Get Refund
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          If you decline, your payment hold will be released and no charges will be made.
        </p>
      </div>
    </div>
  )
}
