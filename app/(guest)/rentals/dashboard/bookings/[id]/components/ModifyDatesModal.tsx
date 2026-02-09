// app/(guest)/rentals/dashboard/bookings/[id]/components/ModifyDatesModal.tsx

import React, { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Booking } from '../types'
import { formatCurrency } from '../utils/helpers'

interface ModifyDatesModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ModifyDatesModal: React.FC<ModifyDatesModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newStartDate, setNewStartDate] = useState<Date | null>(new Date(booking.startDate))
  const [newEndDate, setNewEndDate] = useState<Date | null>(new Date(booking.endDate))
  const [preview, setPreview] = useState<{
    available: boolean
    newPricing: { days: number; total: number; subtotal: number; serviceFee: number; taxes: number }
    priceDifference: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  // Check if dates actually changed
  const datesChanged = newStartDate && newEndDate &&
    (formatDate(newStartDate) !== formatDate(new Date(booking.startDate)) ||
     formatDate(newEndDate) !== formatDate(new Date(booking.endDate)))

  // Fetch price preview when dates change
  const fetchPreview = useCallback(async () => {
    if (!newStartDate || !newEndDate || !datesChanged) {
      setPreview(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        startDate: formatDate(newStartDate),
        endDate: formatDate(newEndDate)
      })
      const res = await fetch(`/api/rentals/bookings/${booking.id}/modify?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to check availability')
        setPreview(null)
        return
      }

      setPreview(data)
      if (!data.available) {
        setError('These dates are not available for this vehicle')
      }
    } catch {
      setError('Failed to check availability')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }, [newStartDate, newEndDate, datesChanged, booking.id])

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(fetchPreview, 500) // debounce
    return () => clearTimeout(timer)
  }, [fetchPreview, isOpen])

  const handleSubmit = async () => {
    if (!newStartDate || !newEndDate || !preview?.available) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formatDate(newStartDate),
          endDate: formatDate(newEndDate)
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to modify booking')
        return
      }

      onSuccess()
    } catch {
      setError('Failed to modify booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm sm:max-w-md w-full p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
          Modify Rental Dates
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Change your pickup and return dates. Price will be recalculated.
        </p>

        {/* Current dates */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Current Dates</p>
          <p className="text-sm text-gray-900">
            {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' → '}
            {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {booking.numberOfDays || Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days • {formatCurrency(booking.totalAmount)}
          </p>
        </div>

        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Pickup</label>
            <DatePicker
              selected={newStartDate}
              onChange={(date: Date | null) => {
                setNewStartDate(date)
                if (date && newEndDate && date >= newEndDate) {
                  const nextDay = new Date(date)
                  nextDay.setDate(nextDay.getDate() + 1)
                  setNewEndDate(nextDay)
                }
              }}
              minDate={today}
              dateFormat="MMM d, yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Return</label>
            <DatePicker
              selected={newEndDate}
              onChange={(date: Date | null) => setNewEndDate(date)}
              minDate={newStartDate ? new Date(newStartDate.getTime() + 86400000) : today}
              dateFormat="MMM d, yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Price preview */}
        {loading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-blue-600">Checking availability...</p>
          </div>
        )}

        {preview && !loading && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">New Pricing</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{preview.newPricing.days} days × {formatCurrency(booking.dailyRate)}/day</span>
                <span>{formatCurrency(preview.newPricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee + taxes</span>
                <span>{formatCurrency(preview.newPricing.serviceFee + preview.newPricing.taxes)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="font-medium text-gray-900">New Total</span>
                <span className="font-medium">{formatCurrency(preview.newPricing.total)}</span>
              </div>
            </div>
            {preview.priceDifference !== 0 && (
              <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${
                preview.priceDifference > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {preview.priceDifference > 0
                  ? `+${formatCurrency(preview.priceDifference)} more`
                  : `${formatCurrency(Math.abs(preview.priceDifference))} less`}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Keep Current
          </button>
          <button
            onClick={handleSubmit}
            disabled={!datesChanged || !preview?.available || submitting || loading}
            className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Confirm Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
