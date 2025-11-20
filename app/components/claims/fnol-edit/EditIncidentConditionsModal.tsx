// app/components/claims/fnol-edit/EditIncidentConditionsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoCloudOutline,
  IoSpeedometerOutline,
  IoCarOutline,
} from 'react-icons/io5'

interface EditIncidentConditionsModalProps {
  claimId: string
  currentData: {
    weatherConditions: string | null
    weatherDescription: string | null
    roadConditions: string | null
    roadDescription: string | null
    estimatedSpeed: number | null
    trafficConditions: string | null
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditIncidentConditionsModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditIncidentConditionsModalProps) {
  // Form state
  const [weatherConditions, setWeatherConditions] = useState(currentData.weatherConditions || '')
  const [weatherDescription, setWeatherDescription] = useState(currentData.weatherDescription || '')
  const [roadConditions, setRoadConditions] = useState(currentData.roadConditions || '')
  const [roadDescription, setRoadDescription] = useState(currentData.roadDescription || '')
  const [estimatedSpeed, setEstimatedSpeed] = useState(currentData.estimatedSpeed?.toString() || '')
  const [trafficConditions, setTrafficConditions] = useState(currentData.trafficConditions || '')

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWeatherConditions(currentData.weatherConditions || '')
      setWeatherDescription(currentData.weatherDescription || '')
      setRoadConditions(currentData.roadConditions || '')
      setRoadDescription(currentData.roadDescription || '')
      setEstimatedSpeed(currentData.estimatedSpeed?.toString() || '')
      setTrafficConditions(currentData.trafficConditions || '')
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

    if (estimatedSpeed && parseInt(estimatedSpeed) < 0) {
      errors.estimatedSpeed = 'Speed cannot be negative'
    } else if (estimatedSpeed && parseInt(estimatedSpeed) > 200) {
      errors.estimatedSpeed = 'Speed seems unrealistic'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    return (
      weatherConditions !== (currentData.weatherConditions || '') ||
      weatherDescription !== (currentData.weatherDescription || '') ||
      roadConditions !== (currentData.roadConditions || '') ||
      roadDescription !== (currentData.roadDescription || '') ||
      estimatedSpeed !== (currentData.estimatedSpeed?.toString() || '') ||
      trafficConditions !== (currentData.trafficConditions || '')
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
          section: 'incident-conditions',
          data: {
            weatherConditions: weatherConditions.trim() || null,
            weatherDescription: weatherDescription.trim() || null,
            roadConditions: roadConditions.trim() || null,
            roadDescription: roadDescription.trim() || null,
            estimatedSpeed: estimatedSpeed ? parseInt(estimatedSpeed) : null,
            trafficConditions: trafficConditions.trim() || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update incident conditions')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating incident conditions:', err)
      setError(err.message || 'Failed to update incident conditions')
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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]"
      onClick={handleBackdropClick}
    >
      <div
        className={`
        bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:mx-4
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
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <IoCloudOutline className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Incident Conditions
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Weather Conditions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Weather Conditions
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  General Conditions
                </label>
                <select
                  value={weatherConditions}
                  onChange={(e) => setWeatherConditions(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select weather conditions</option>
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rain">Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Snow">Snow</option>
                  <option value="Heavy Snow">Heavy Snow</option>
                  <option value="Fog">Fog</option>
                  <option value="Sleet">Sleet</option>
                  <option value="Hail">Hail</option>
                  <option value="Windy">Windy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Weather Details (Optional)
                </label>
                <textarea
                  value={weatherDescription}
                  onChange={(e) => setWeatherDescription(e.target.value)}
                  placeholder="e.g., Heavy rain with reduced visibility"
                  disabled={isSaving}
                  rows={2}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Road Conditions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Road Conditions
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  General Conditions
                </label>
                <select
                  value={roadConditions}
                  onChange={(e) => setRoadConditions(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select road conditions</option>
                  <option value="Dry">Dry</option>
                  <option value="Wet">Wet</option>
                  <option value="Icy">Icy</option>
                  <option value="Snow-Covered">Snow-Covered</option>
                  <option value="Muddy">Muddy</option>
                  <option value="Gravel">Gravel</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Road Details (Optional)
                </label>
                <textarea
                  value={roadDescription}
                  onChange={(e) => setRoadDescription(e.target.value)}
                  placeholder="e.g., Road had potholes, poorly lit area"
                  disabled={isSaving}
                  rows={2}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Traffic & Speed */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Traffic & Speed
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoSpeedometerOutline className="w-4 h-4" />
                  Estimated Speed
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={estimatedSpeed}
                    onChange={(e) => setEstimatedSpeed(e.target.value)}
                    placeholder="e.g., 45"
                    disabled={isSaving}
                    className={`
                      w-full px-4 py-3 pr-16 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${fieldErrors.estimatedSpeed ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                    `}
                  />
                  <span className="absolute right-4 top-3.5 text-sm text-gray-500 dark:text-gray-400">
                    mph
                  </span>
                </div>
                {fieldErrors.estimatedSpeed && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <IoAlertCircleOutline className="w-4 h-4" />
                    {fieldErrors.estimatedSpeed}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoCarOutline className="w-4 h-4" />
                  Traffic Conditions
                </label>
                <select
                  value={trafficConditions}
                  onChange={(e) => setTrafficConditions(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select traffic</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Stop-and-Go">Stop-and-Go</option>
                  <option value="No Traffic">No Traffic</option>
                </select>
              </div>
            </div>
          </div>

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
            disabled={!hasChanges() || isSaving}
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