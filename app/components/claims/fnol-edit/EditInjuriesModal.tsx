// app/components/claims/fnol-edit/EditInjuriesModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoMedicalOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPersonOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoBusinessOutline,
} from 'react-icons/io5'

interface Injury {
  person: string
  description: string
  severity: string
  medicalAttention: boolean
  hospital: string | null
}

interface EditInjuriesModalProps {
  claimId: string
  currentData: {
    wereInjuries: boolean | null
    injuries: Injury[]
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditInjuriesModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditInjuriesModalProps) {
  // Form state
  const [wereInjuries, setWereInjuries] = useState(currentData.wereInjuries ?? false)
  const [injuries, setInjuries] = useState<Injury[]>(currentData.injuries || [])

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWereInjuries(currentData.wereInjuries ?? false)
      setInjuries(currentData.injuries || [])
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

    if (wereInjuries) {
      injuries.forEach((injury, index) => {
        if (!injury.person.trim()) {
          errors[`injury-${index}-person`] = 'Person name is required'
        }
        if (!injury.description.trim()) {
          errors[`injury-${index}-description`] = 'Injury description is required'
        }
        if (!injury.severity) {
          errors[`injury-${index}-severity`] = 'Severity is required'
        }
        if (injury.medicalAttention && !injury.hospital?.trim()) {
          errors[`injury-${index}-hospital`] = 'Hospital name is required when medical attention was received'
        }
      })

      if (injuries.length === 0) {
        errors.general = 'At least one injury must be reported if injuries occurred'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    if (wereInjuries !== (currentData.wereInjuries ?? false)) return true
    
    const original = JSON.stringify(currentData.injuries || [])
    const current = JSON.stringify(injuries)
    return original !== current
  }

  const handleAddInjury = () => {
    setInjuries([
      ...injuries,
      {
        person: '',
        description: '',
        severity: 'MINOR',
        medicalAttention: false,
        hospital: null,
      },
    ])
  }

  const handleRemoveInjury = (index: number) => {
    setInjuries(injuries.filter((_, i) => i !== index))
    // Clear errors for this injury
    const newErrors = { ...fieldErrors }
    delete newErrors[`injury-${index}-person`]
    delete newErrors[`injury-${index}-description`]
    delete newErrors[`injury-${index}-severity`]
    delete newErrors[`injury-${index}-hospital`]
    setFieldErrors(newErrors)
  }

  const handleUpdateInjury = (index: number, field: keyof Injury, value: any) => {
    const updated = [...injuries]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    
    // Clear hospital if medical attention is set to false
    if (field === 'medicalAttention' && !value) {
      updated[index].hospital = null
    }
    
    setInjuries(updated)
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
          section: 'injuries',
          data: {
            wereInjuries,
            injuries: wereInjuries ? injuries.map(injury => ({
              person: injury.person.trim(),
              description: injury.description.trim(),
              severity: injury.severity,
              medicalAttention: injury.medicalAttention,
              hospital: injury.medicalAttention ? injury.hospital?.trim() || null : null,
            })) : [],
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update injuries')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating injuries:', err)
      setError(err.message || 'Failed to update injuries')
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'MINOR':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
      case 'SEVERE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
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
        bg-white dark:bg-gray-800 w-full sm:max-w-3xl sm:mx-4
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
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <IoMedicalOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Injuries Reported
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Were Injuries Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Were there any injuries as a result of this incident?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWereInjuries(true)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    wereInjuries
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCheckmarkOutline
                    className={`w-6 h-6 ${wereInjuries ? 'text-red-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      wereInjuries ? 'text-red-900 dark:text-red-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Yes, Injuries
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWereInjuries(false)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    !wereInjuries
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCloseCircleOutline
                    className={`w-6 h-6 ${!wereInjuries ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      !wereInjuries ? 'text-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    No Injuries
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Injury List (only if injuries occurred) */}
          {wereInjuries && (
            <>
              {fieldErrors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-300">{fieldErrors.general}</p>
                  </div>
                </div>
              )}

              {injuries.length === 0 ? (
                <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoMedicalOutline className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No injuries recorded yet
                  </p>
                  <button
                    onClick={handleAddInjury}
                    disabled={isSaving}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <IoAddOutline className="w-4 h-4" />
                    Report First Injury
                  </button>
                </div>
              ) : (
                <>
                  {injuries.map((injury, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <IoMedicalOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Injury {index + 1}
                          </span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(injury.severity)}`}>
                            {injury.severity}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveInjury(index)}
                          disabled={isSaving}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove injury"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Person & Severity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IoPersonOutline className="w-4 h-4" />
                              Injured Person *
                            </label>
                            <input
                              type="text"
                              value={injury.person}
                              onChange={(e) => handleUpdateInjury(index, 'person', e.target.value)}
                              placeholder="e.g., Driver, Passenger, Pedestrian"
                              disabled={isSaving}
                              className={`
                                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${fieldErrors[`injury-${index}-person`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                              `}
                            />
                            {fieldErrors[`injury-${index}-person`] && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <IoAlertCircleOutline className="w-4 h-4" />
                                {fieldErrors[`injury-${index}-person`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Severity *
                            </label>
                            <select
                              value={injury.severity}
                              onChange={(e) => handleUpdateInjury(index, 'severity', e.target.value)}
                              disabled={isSaving}
                              className={`
                                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                                text-gray-900 dark:text-white
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${fieldErrors[`injury-${index}-severity`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                              `}
                            >
                              <option value="MINOR">Minor</option>
                              <option value="MODERATE">Moderate</option>
                              <option value="SEVERE">Severe</option>
                            </select>
                            {fieldErrors[`injury-${index}-severity`] && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <IoAlertCircleOutline className="w-4 h-4" />
                                {fieldErrors[`injury-${index}-severity`]}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <IoDocumentTextOutline className="w-4 h-4" />
                            Injury Description *
                          </label>
                          <textarea
                            value={injury.description}
                            onChange={(e) => handleUpdateInjury(index, 'description', e.target.value)}
                            placeholder="Describe the injury..."
                            disabled={isSaving}
                            rows={3}
                            className={`
                              w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                              focus:ring-2 focus:ring-purple-500 focus:border-transparent
                              disabled:opacity-50 disabled:cursor-not-allowed resize-none
                              ${fieldErrors[`injury-${index}-description`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                            `}
                          />
                          {fieldErrors[`injury-${index}-description`] && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <IoAlertCircleOutline className="w-4 h-4" />
                              {fieldErrors[`injury-${index}-description`]}
                            </p>
                          )}
                        </div>

                        {/* Medical Attention */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Did this person receive medical attention?
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateInjury(index, 'medicalAttention', true)}
                              disabled={isSaving}
                              className={`
                                p-3 rounded-lg border-2 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  injury.medicalAttention
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }
                              `}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <IoCheckmarkOutline
                                  className={`w-5 h-5 ${injury.medicalAttention ? 'text-red-600' : 'text-gray-400'}`}
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    injury.medicalAttention ? 'text-red-900 dark:text-red-200' : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  Yes
                                </span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateInjury(index, 'medicalAttention', false)}
                              disabled={isSaving}
                              className={`
                                p-3 rounded-lg border-2 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  !injury.medicalAttention
                                    ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }
                              `}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <IoCloseCircleOutline
                                  className={`w-5 h-5 ${!injury.medicalAttention ? 'text-gray-600' : 'text-gray-400'}`}
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    !injury.medicalAttention ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  No
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Hospital (only if medical attention) */}
                        {injury.medicalAttention && (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IoBusinessOutline className="w-4 h-4" />
                              Hospital / Medical Facility *
                            </label>
                            <input
                              type="text"
                              value={injury.hospital || ''}
                              onChange={(e) => handleUpdateInjury(index, 'hospital', e.target.value)}
                              placeholder="e.g., Phoenix General Hospital"
                              disabled={isSaving}
                              className={`
                                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${fieldErrors[`injury-${index}-hospital`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                              `}
                            />
                            {fieldErrors[`injury-${index}-hospital`] && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <IoAlertCircleOutline className="w-4 h-4" />
                                {fieldErrors[`injury-${index}-hospital`]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Another Injury Button */}
                  <button
                    onClick={handleAddInjury}
                    disabled={isSaving}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <IoAddOutline className="w-5 h-5" />
                    Report Another Injury
                  </button>
                </>
              )}
            </>
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