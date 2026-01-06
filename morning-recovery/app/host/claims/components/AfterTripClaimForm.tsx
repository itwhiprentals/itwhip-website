// app/host/claims/components/AfterTripClaimForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ChargeBreakdown from './ChargeBreakdown'
import {
  IoCarOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAddOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  tripEndedAt: string | null
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
  }
  guest: {
    name: string
  } | null
  guestName: string | null
  tripCharges?: {
    id: string
    mileageCharge: number
    fuelCharge: number
    lateCharge: number
    damageCharge: number
    cleaningCharge: number
    otherCharges: number
    totalCharges: number
    chargeStatus: string
    disputes: string | null
  }
}

interface AfterTripClaimFormProps {
  hostId: string
  onSuccess?: (chargeId: string) => void
  onCancel?: () => void
}

interface AdditionalCharge {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning' | 'other'
  amount: number
  description: string
}

export default function AfterTripClaimForm({ hostId, onSuccess, onCancel }: AfterTripClaimFormProps) {
  const router = useRouter()

  // Form state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([])
  const [notes, setNotes] = useState('')
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string>('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Charge type options
  const chargeTypes = [
    { value: 'mileage', label: 'Excess Mileage', icon: '🚗' },
    { value: 'fuel', label: 'Fuel Charges', icon: '⛽' },
    { value: 'late', label: 'Late Return', icon: '⏰' },
    { value: 'damage', label: 'Damage', icon: '🔧' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'other', label: 'Other', icon: '📋' }
  ]

  // Fetch eligible bookings on mount
  useEffect(() => {
    fetchEligibleBookings()
  }, [])

  const fetchEligibleBookings = async () => {
    try {
      setLoadingBookings(true)
      const response = await fetch(`/api/host/bookings?status=COMPLETED&hasEnded=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load eligible bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  // Get selected booking details
  const selectedBooking = bookings.find(b => b.id === selectedBookingId)

  // Add new charge row
  const handleAddCharge = () => {
    setAdditionalCharges([
      ...additionalCharges,
      { type: 'damage', amount: 0, description: '' }
    ])
  }

  // Update charge
  const handleUpdateCharge = (index: number, field: keyof AdditionalCharge, value: any) => {
    const updated = [...additionalCharges]
    updated[index] = { ...updated[index], [field]: value }
    setAdditionalCharges(updated)
  }

  // Remove charge
  const handleRemoveCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index))
  }

  // Calculate total additional charges
  const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0)

  // Handle photo URL input
  const handleAddPhoto = () => {
    if (photoPreview.trim()) {
      setEvidencePhotos([...evidencePhotos, photoPreview.trim()])
      setPhotoPreview('')
    }
  }

  const handleRemovePhoto = (index: number) => {
    setEvidencePhotos(evidencePhotos.filter((_, i) => i !== index))
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!selectedBookingId) {
      errors.booking = 'Please select a booking'
    }

    if (additionalCharges.length === 0) {
      errors.charges = 'Please add at least one additional charge'
    }

    // Validate each charge
    additionalCharges.forEach((charge, index) => {
      if (!charge.amount || charge.amount <= 0) {
        errors[`charge_${index}_amount`] = 'Amount must be greater than $0'
      }
      if (charge.amount > 10000) {
        errors[`charge_${index}_amount`] = 'Amount cannot exceed $10,000'
      }
      if (!charge.description.trim()) {
        errors[`charge_${index}_description`] = 'Description is required'
      }
    })

    if (!notes.trim()) {
      errors.notes = 'Please provide notes explaining these charges'
    } else if (notes.trim().length < 20) {
      errors.notes = 'Notes must be at least 20 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/host/claims/trip-charges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          additionalCharges: additionalCharges.map(charge => ({
            type: charge.type,
            amount: parseFloat(charge.amount.toString()),
            description: charge.description.trim()
          })),
          notes: notes.trim(),
          evidencePhotos: evidencePhotos.filter(url => url.trim())
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit charges')
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.chargeId)
      } else {
        router.push(`/host/claims?tripChargeCreated=true`)
      }
    } catch (err: any) {
      console.error('Error submitting charges:', err)
      setError(err.message || 'Failed to submit charges. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                Submission Error
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Select Booking */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoCarOutline className="w-4 h-4" />
          Select Completed Trip
        </label>
        
        {loadingBookings ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              No completed trips found. Charges can only be filed for trips that have ended.
            </p>
          </div>
        ) : (
          <>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className={`
                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                ${fieldErrors.booking ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              `}
            >
              <option value="">Select a completed trip...</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingCode} - {booking.car.year} {booking.car.make} {booking.car.model} 
                  {booking.guest?.name || booking.guestName ? ` (${booking.guest?.name || booking.guestName})` : ''}
                </option>
              ))}
            </select>
            {fieldErrors.booking && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.booking}</p>
            )}
          </>
        )}

        {/* Selected booking details with existing charges */}
        {selectedBooking && (
          <div className="mt-3">
            <ChargeBreakdown
              booking={selectedBooking}
              existingCharges={selectedBooking.tripCharges}
            />
          </div>
        )}
      </div>

      {/* Additional Charges Section */}
      {selectedBooking && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <IoCashOutline className="w-4 h-4" />
              Additional Charges
            </label>
            <button
              type="button"
              onClick={handleAddCharge}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
              Add Charge
            </button>
          </div>

          {fieldErrors.charges && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">{fieldErrors.charges}</p>
          )}

          {additionalCharges.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No additional charges added yet. Click "Add Charge" to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {additionalCharges.map((charge, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Charge #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCharge(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <IoCloseOutline className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Charge Type */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Charge Type
                      </label>
                      <select
                        value={charge.type}
                        onChange={(e) => handleUpdateCharge(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      >
                        {chargeTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={charge.amount || ''}
                          onChange={(e) => handleUpdateCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          max="10000"
                          step="0.01"
                          className={`
                            w-full pl-7 pr-3 py-2 bg-white dark:bg-gray-900 border rounded-lg text-sm
                            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                            ${fieldErrors[`charge_${index}_amount`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                          `}
                        />
                      </div>
                      {fieldErrors[`charge_${index}_amount`] && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors[`charge_${index}_amount`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={charge.description}
                      onChange={(e) => handleUpdateCharge(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Explain this charge..."
                      className={`
                        w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg text-sm
                        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                        ${fieldErrors[`charge_${index}_description`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                      `}
                    />
                    {fieldErrors[`charge_${index}_description`] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors[`charge_${index}_description`]}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Total Additional Charges */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                    Total Additional Charges
                  </span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    ${totalAdditionalCharges.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {selectedBooking && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IoDocumentTextOutline className="w-4 h-4" />
            Notes & Explanation
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Explain why these additional charges are necessary and when the issues were discovered..."
            className={`
              w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${fieldErrors.notes ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          <div className="flex justify-between mt-1">
            {fieldErrors.notes && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.notes}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {notes.length} characters (min 20)
            </p>
          </div>
        </div>
      )}

      {/* Evidence Photos */}
      {selectedBooking && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IoCloudUploadOutline className="w-4 h-4" />
            Evidence Photos (Optional)
          </label>
          
          {/* Add photo URL */}
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={photoPreview}
              onChange={(e) => setPhotoPreview(e.target.value)}
              placeholder="Paste image URL"
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!photoPreview.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>

          {/* Photo list */}
          {evidencePhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {evidencePhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || bookings.length === 0}
          className="flex-1 sm:flex-none px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <IoCheckmarkCircleOutline className="w-5 h-5" />
              <span>Submit Charges</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}