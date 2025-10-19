// app/host/claims/components/ClaimForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IoCarOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  car: {
    make: string
    model: string
    year: number
    heroPhoto: string | null
  }
  guest: {
    name: string
  }
  insurancePolicy: {
    tier: string
    deductible: number
  } | null
}

interface ClaimFormProps {
  hostId: string
  onSuccess?: (claimId: string) => void
  onCancel?: () => void
}

export default function ClaimForm({ hostId, onSuccess, onCancel }: ClaimFormProps) {
  const router = useRouter()

  // Form state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [claimType, setClaimType] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string>('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Claim types
  const claimTypes = [
    { value: 'ACCIDENT', label: 'Accident', description: 'Vehicle collision or crash' },
    { value: 'THEFT', label: 'Theft', description: 'Vehicle or items stolen' },
    { value: 'VANDALISM', label: 'Vandalism', description: 'Intentional damage to vehicle' },
    { value: 'CLEANING', label: 'Cleaning', description: 'Excessive cleaning required' },
    { value: 'MECHANICAL', label: 'Mechanical', description: 'Mechanical damage or failure' },
    { value: 'WEATHER', label: 'Weather Damage', description: 'Damage from weather events' },
    { value: 'OTHER', label: 'Other', description: 'Other types of damage' }
  ]

  // Fetch eligible bookings on mount
  useEffect(() => {
    fetchEligibleBookings()
  }, [])

  const fetchEligibleBookings = async () => {
    try {
      setLoadingBookings(true)
      const response = await fetch(`/api/host/bookings?status=COMPLETED,ACTIVE&hasInsurance=true`)
      
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

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!selectedBookingId) {
      errors.booking = 'Please select a booking'
    }

    if (!claimType) {
      errors.type = 'Please select a claim type'
    }

    if (!description.trim()) {
      errors.description = 'Please provide a description'
    } else if (description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters'
    }

    if (!incidentDate) {
      errors.incidentDate = 'Please select an incident date'
    } else if (selectedBooking) {
      const incident = new Date(incidentDate)
      const start = new Date(selectedBooking.startDate)
      const end = new Date(selectedBooking.endDate)
      const maxDate = new Date(end)
      maxDate.setDate(maxDate.getDate() + 30)

      if (incident < start || incident > maxDate) {
        errors.incidentDate = 'Incident date must be within trip dates or up to 30 days after'
      }
    }

    if (estimatedCost) {
      const cost = parseFloat(estimatedCost)
      if (isNaN(cost) || cost < 0) {
        errors.estimatedCost = 'Please enter a valid amount'
      } else if (cost > 100000) {
        errors.estimatedCost = 'Amount cannot exceed $100,000'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle photo URL input
  const handleAddPhoto = () => {
    if (photoPreview.trim()) {
      setDamagePhotos([...damagePhotos, photoPreview.trim()])
      setPhotoPreview('')
    }
  }

  const handleRemovePhoto = (index: number) => {
    setDamagePhotos(damagePhotos.filter((_, i) => i !== index))
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
      const response = await fetch('/api/host/claims/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          type: claimType,
          description: description.trim(),
          incidentDate,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
          damagePhotos: damagePhotos.filter(url => url.trim())
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim')
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.claim.id)
      } else {
        router.push(`/host/claims/${data.claim.id}`)
      }
    } catch (err: any) {
      console.error('Error submitting claim:', err)
      setError(err.message || 'Failed to submit claim. Please try again.')
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
          Select Booking
        </label>
        
        {loadingBookings ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              No eligible bookings found. Claims can only be filed for completed or active trips with insurance coverage.
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
              <option value="">Select a booking...</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingCode} - {booking.car.year} {booking.car.make} {booking.car.model} (Guest: {booking.guest.name})
                </option>
              ))}
            </select>
            {fieldErrors.booking && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.booking}</p>
            )}
          </>
        )}

        {/* Selected booking details */}
        {selectedBooking && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              {selectedBooking.car.heroPhoto && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <Image
                    src={selectedBooking.car.heroPhoto}
                    alt="Car"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {selectedBooking.car.year} {selectedBooking.car.make} {selectedBooking.car.model}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                </p>
                {selectedBooking.insurancePolicy && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Insurance: {selectedBooking.insurancePolicy.tier} (${selectedBooking.insurancePolicy.deductible} deductible)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Claim Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoAlertCircleOutline className="w-4 h-4" />
          Claim Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {claimTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setClaimType(type.value)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${claimType === type.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {type.label}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {type.description}
              </p>
            </button>
          ))}
        </div>
        {fieldErrors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.type}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoDocumentTextOutline className="w-4 h-4" />
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe what happened, when it occurred, and the extent of the damage..."
          className={`
            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${fieldErrors.description ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {fieldErrors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.description}</p>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description.length} characters (min 20)
          </p>
        </div>
      </div>

      {/* Incident Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoCalendarOutline className="w-4 h-4" />
          Incident Date
        </label>
        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`
            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg
            text-gray-900 dark:text-white
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${fieldErrors.incidentDate ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
          `}
        />
        {fieldErrors.incidentDate && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentDate}</p>
        )}
      </div>

      {/* Estimated Cost */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoCashOutline className="w-4 h-4" />
          Estimated Repair Cost (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400">$</span>
          <input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="0.00"
            min="0"
            max="100000"
            step="0.01"
            className={`
              w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-lg
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${fieldErrors.estimatedCost ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
        </div>
        {fieldErrors.estimatedCost && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.estimatedCost}</p>
        )}
      </div>

      {/* Damage Photos */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IoCloudUploadOutline className="w-4 h-4" />
          Damage Photos (Optional)
        </label>
        
        {/* Add photo URL */}
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={photoPreview}
            onChange={(e) => setPhotoPreview(e.target.value)}
            placeholder="Paste image URL (e.g., from Cloudinary)"
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
        {damagePhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {damagePhotos.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={url}
                    alt={`Damage ${index + 1}`}
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
              <span>Submit Claim</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}