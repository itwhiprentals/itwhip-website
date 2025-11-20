// app/components/claims/EditLocationModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoLocationOutline,
  IoSaveOutline,
  IoWarningOutline,
} from 'react-icons/io5'

interface EditLocationModalProps {
  claimId: string
  currentLocation: {
    address: string
    city: string
    state: string
    zipCode: string
    description: string | null
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditLocationModal({
  claimId,
  currentLocation,
  isOpen,
  onClose,
  onSuccess,
}: EditLocationModalProps) {
  const [address, setAddress] = useState(currentLocation.address)
  const [city, setCity] = useState(currentLocation.city)
  const [state, setState] = useState(currentLocation.state)
  const [zipCode, setZipCode] = useState(currentLocation.zipCode)
  const [description, setDescription] = useState(currentLocation.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // US States
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddress(currentLocation.address)
      setCity(currentLocation.city)
      setState(currentLocation.state)
      setZipCode(currentLocation.zipCode)
      setDescription(currentLocation.description || '')
      setError('')
      setFieldErrors({})
    }
  }, [isOpen, currentLocation])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!address.trim()) {
      errors.address = 'Address is required'
    }

    if (!city.trim()) {
      errors.city = 'City is required'
    }

    if (!state) {
      errors.state = 'State is required'
    }

    if (!zipCode.trim()) {
      errors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      errors.zipCode = 'Invalid ZIP code format'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/host/claims/${claimId}/update-location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentAddress: address.trim(),
          incidentCity: city.trim(),
          incidentState: state,
          incidentZip: zipCode.trim(),
          incidentDescription: description.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update location')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating location:', err)
      setError(err.message || 'Failed to update location')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IoLocationOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Incident Location
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 1234 E Main St"
                disabled={isSubmitting}
                className={`
                  w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${fieldErrors.address ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                `}
              />
              {fieldErrors.address && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.address}</p>
              )}
            </div>

            {/* City, State, ZIP Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Phoenix"
                  disabled={isSubmitting}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.city ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {fieldErrors.city && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isSubmitting}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.state ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                >
                  {usStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.state}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="85001"
                  maxLength={10}
                  disabled={isSubmitting}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.zipCode ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {fieldErrors.zipCode && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.zipCode}</p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Location Details <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g., Intersection of Main St and 1st Ave, parking lot near entrance..."
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save Location
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}