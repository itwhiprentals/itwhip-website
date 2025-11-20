// app/components/claims/fnol-edit/EditPoliceReportModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoShieldOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoCalendarOutline,
} from 'react-icons/io5'

interface EditPoliceReportModalProps {
  claimId: string
  currentData: {
    wasPoliceContacted: boolean | null
    policeDepartment: string | null
    officerName: string | null
    officerBadge: string | null
    policeReportNumber: string | null
    policeReportFiled: boolean | null
    policeReportDate: string | null
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditPoliceReportModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditPoliceReportModalProps) {
  // Form state
  const [wasPoliceContacted, setWasPoliceContacted] = useState(currentData.wasPoliceContacted ?? false)
  const [policeDepartment, setPoliceDepartment] = useState(currentData.policeDepartment || '')
  const [officerName, setOfficerName] = useState(currentData.officerName || '')
  const [officerBadge, setOfficerBadge] = useState(currentData.officerBadge || '')
  const [policeReportNumber, setPoliceReportNumber] = useState(currentData.policeReportNumber || '')
  const [policeReportFiled, setPoliceReportFiled] = useState(currentData.policeReportFiled ?? false)
  const [policeReportDate, setPoliceReportDate] = useState(
    currentData.policeReportDate ? new Date(currentData.policeReportDate).toISOString().split('T')[0] : ''
  )

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWasPoliceContacted(currentData.wasPoliceContacted ?? false)
      setPoliceDepartment(currentData.policeDepartment || '')
      setOfficerName(currentData.officerName || '')
      setOfficerBadge(currentData.officerBadge || '')
      setPoliceReportNumber(currentData.policeReportNumber || '')
      setPoliceReportFiled(currentData.policeReportFiled ?? false)
      setPoliceReportDate(
        currentData.policeReportDate ? new Date(currentData.policeReportDate).toISOString().split('T')[0] : ''
      )
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

    if (wasPoliceContacted) {
      if (!policeDepartment.trim()) {
        errors.policeDepartment = 'Police department is required when police were contacted'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    return (
      wasPoliceContacted !== (currentData.wasPoliceContacted ?? false) ||
      policeDepartment !== (currentData.policeDepartment || '') ||
      officerName !== (currentData.officerName || '') ||
      officerBadge !== (currentData.officerBadge || '') ||
      policeReportNumber !== (currentData.policeReportNumber || '') ||
      policeReportFiled !== (currentData.policeReportFiled ?? false) ||
      policeReportDate !== (currentData.policeReportDate ? new Date(currentData.policeReportDate).toISOString().split('T')[0] : '')
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
          section: 'police-report',
          data: {
            wasPoliceContacted,
            policeDepartment: wasPoliceContacted ? policeDepartment.trim() || null : null,
            officerName: wasPoliceContacted ? officerName.trim() || null : null,
            officerBadge: wasPoliceContacted ? officerBadge.trim() || null : null,
            policeReportNumber: wasPoliceContacted ? policeReportNumber.trim() || null : null,
            policeReportFiled: wasPoliceContacted ? policeReportFiled : null,
            policeReportDate: wasPoliceContacted && policeReportDate ? new Date(policeReportDate).toISOString() : null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update police report')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating police report:', err)
      setError(err.message || 'Failed to update police report')
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
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <IoShieldOutline className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Police Report
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Police Contact Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Were the police contacted?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWasPoliceContacted(true)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    wasPoliceContacted
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCheckmarkOutline
                    className={`w-6 h-6 ${wasPoliceContacted ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      wasPoliceContacted ? 'text-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Yes, Contacted
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWasPoliceContacted(false)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    !wasPoliceContacted
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCloseCircleOutline
                    className={`w-6 h-6 ${!wasPoliceContacted ? 'text-gray-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      !wasPoliceContacted ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    No Contact
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Police Details (only if contacted) */}
          {wasPoliceContacted && (
            <>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Police Department Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Police Department *
                    </label>
                    <input
                      type="text"
                      value={policeDepartment}
                      onChange={(e) => setPoliceDepartment(e.target.value)}
                      placeholder="e.g., Phoenix Police Department"
                      disabled={isSaving}
                      className={`
                        w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${fieldErrors.policeDepartment ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                      `}
                    />
                    {fieldErrors.policeDepartment && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <IoAlertCircleOutline className="w-4 h-4" />
                        {fieldErrors.policeDepartment}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Officer Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        placeholder="e.g., Officer Smith"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={officerBadge}
                        onChange={(e) => setOfficerBadge(e.target.value)}
                        placeholder="e.g., 12345"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Police Report Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Police Report Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={policeReportNumber}
                      onChange={(e) => setPoliceReportNumber(e.target.value)}
                      placeholder="e.g., 2024-123456"
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Was a police report filed?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPoliceReportFiled(true)}
                        disabled={isSaving}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            policeReportFiled
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <IoCheckmarkOutline
                            className={`w-5 h-5 ${policeReportFiled ? 'text-green-600' : 'text-gray-400'}`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              policeReportFiled ? 'text-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            Yes, Filed
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPoliceReportFiled(false)}
                        disabled={isSaving}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            !policeReportFiled
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <IoAlertCircleOutline
                            className={`w-5 h-5 ${!policeReportFiled ? 'text-yellow-600' : 'text-gray-400'}`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              !policeReportFiled ? 'text-yellow-900 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            Pending
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {policeReportFiled && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <IoCalendarOutline className="w-4 h-4" />
                        Report Filing Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={policeReportDate}
                        onChange={(e) => setPoliceReportDate(e.target.value)}
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>
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