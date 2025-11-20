// app/components/claims/fnol-edit/EditVehicleConditionModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCarOutline,
  IoSpeedometerOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoLocationOutline,
} from 'react-icons/io5'

interface EditVehicleConditionModalProps {
  claimId: string
  currentData: {
    odometerAtIncident: number | null
    vehicleDrivable: boolean | null
    vehicleLocation: string | null
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditVehicleConditionModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditVehicleConditionModalProps) {
  // Form state
  const [odometerAtIncident, setOdometerAtIncident] = useState(
    currentData.odometerAtIncident?.toString() || ''
  )
  const [vehicleDrivable, setVehicleDrivable] = useState(
    currentData.vehicleDrivable ?? true
  )
  const [vehicleLocation, setVehicleLocation] = useState(
    currentData.vehicleLocation || ''
  )

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setOdometerAtIncident(currentData.odometerAtIncident?.toString() || '')
      setVehicleDrivable(currentData.vehicleDrivable ?? true)
      setVehicleLocation(currentData.vehicleLocation || '')
      setError('')
      setFieldErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentData])

  // Validation
  const validate = () => {
    const errors: Record<string, string> = {}

    if (!odometerAtIncident.trim()) {
      errors.odometerAtIncident = 'Odometer reading is required'
    } else if (parseInt(odometerAtIncident) < 0) {
      errors.odometerAtIncident = 'Odometer reading must be positive'
    } else if (parseInt(odometerAtIncident) > 999999) {
      errors.odometerAtIncident = 'Invalid odometer reading'
    }

    if (!vehicleDrivable && !vehicleLocation.trim()) {
      errors.vehicleLocation = 'Current location is required if vehicle is not drivable'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    return (
      odometerAtIncident !== (currentData.odometerAtIncident?.toString() || '') ||
      vehicleDrivable !== (currentData.vehicleDrivable ?? true) ||
      vehicleLocation !== (currentData.vehicleLocation || '')
    )
  }

  const handleSave = async () => {
    setError('')

    if (!validate()) {
      return
    }

    if (!hasChanges()) {
      setError('No changes detected')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/host/claims/${claimId}/edit-fnol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'vehicle-condition',
          data: {
            odometerAtIncident: parseInt(odometerAtIncident),
            vehicleDrivable,
            vehicleLocation: vehicleDrivable ? null : vehicleLocation.trim(),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update vehicle condition')
      }

      // Success!
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating vehicle condition:', err)
      setError(err.message || 'Failed to update vehicle condition')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isSaving) return
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose()
    }
  }

  const isValid = !Object.keys(fieldErrors).length && hasChanges()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]"
      onClick={handleBackdropClick}
    >
      {/* Nested Modal - Higher z-index than parent */}
      <div
        className={`
        bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:mx-4
        flex flex-col
        sm:rounded-lg
        rounded-t-2xl sm:rounded-b-lg
        shadow-xl
        max-h-[85vh] sm:max-h-[75vh]
        animate-slide-up sm:animate-none
      `}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Back"
          >
            <IoArrowBackOutline className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IoCarOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicle Condition
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Odometer Reading */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IoSpeedometerOutline className="w-4 h-4" />
              Odometer Reading *
            </label>
            <div className="relative">
              <input
                type="number"
                value={odometerAtIncident}
                onChange={(e) => setOdometerAtIncident(e.target.value)}
                placeholder="e.g., 39618"
                disabled={isSaving}
                className={`
                  w-full px-4 py-3 pr-16 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${fieldErrors.odometerAtIncident ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                `}
              />
              <span className="absolute right-4 top-3.5 text-sm text-gray-500 dark:text-gray-400">
                miles
              </span>
            </div>
            {fieldErrors.odometerAtIncident && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <IoAlertCircleOutline className="w-4 h-4" />
                {fieldErrors.odometerAtIncident}
              </p>
            )}
          </div>

          {/* Vehicle Drivable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Was the vehicle drivable after the incident? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVehicleDrivable(true)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    vehicleDrivable
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCheckmarkOutline
                    className={`w-6 h-6 ${vehicleDrivable ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      vehicleDrivable ? 'text-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Yes, Drivable
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVehicleDrivable(false)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    !vehicleDrivable
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCloseCircleOutline
                    className={`w-6 h-6 ${!vehicleDrivable ? 'text-red-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      !vehicleDrivable ? 'text-red-900 dark:text-red-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    No, Not Drivable
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Vehicle Location (only if not drivable) */}
          {!vehicleDrivable && (
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <IoLocationOutline className="w-4 h-4" />
                Current Vehicle Location *
              </label>
              <input
                type="text"
                value={vehicleLocation}
                onChange={(e) => setVehicleLocation(e.target.value)}
                placeholder="e.g., Joe's Tow Yard, 123 Main St, Phoenix, AZ"
                disabled={isSaving}
                className={`
                  w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${fieldErrors.vehicleLocation ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                `}
              />
              {fieldErrors.vehicleLocation && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <IoAlertCircleOutline className="w-4 h-4" />
                  {fieldErrors.vehicleLocation}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Where is the vehicle currently located? (Tow yard, repair shop, etc.)
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}