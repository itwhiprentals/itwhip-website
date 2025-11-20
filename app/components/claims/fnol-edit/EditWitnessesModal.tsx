// app/components/claims/fnol-edit/EditWitnessesModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5'

interface Witness {
  name: string
  phone: string
  email: string | null
  statement: string | null
}

interface EditWitnessesModalProps {
  claimId: string
  currentData: {
    witnesses: Witness[]
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditWitnessesModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditWitnessesModalProps) {
  // Form state
  const [witnesses, setWitnesses] = useState<Witness[]>(currentData.witnesses || [])

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWitnesses(currentData.witnesses || [])
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

    witnesses.forEach((witness, index) => {
      if (!witness.name.trim()) {
        errors[`witness-${index}-name`] = 'Witness name is required'
      }
      if (!witness.phone.trim()) {
        errors[`witness-${index}-phone`] = 'Phone number is required'
      } else if (!/^\+?[\d\s\-\(\)]+$/.test(witness.phone)) {
        errors[`witness-${index}-phone`] = 'Invalid phone number format'
      }
      if (witness.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(witness.email)) {
        errors[`witness-${index}-email`] = 'Invalid email format'
      }
    })

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    const original = JSON.stringify(currentData.witnesses || [])
    const current = JSON.stringify(witnesses)
    return original !== current
  }

  const handleAddWitness = () => {
    setWitnesses([
      ...witnesses,
      {
        name: '',
        phone: '',
        email: null,
        statement: null,
      },
    ])
  }

  const handleRemoveWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index))
    // Clear errors for this witness
    const newErrors = { ...fieldErrors }
    delete newErrors[`witness-${index}-name`]
    delete newErrors[`witness-${index}-phone`]
    delete newErrors[`witness-${index}-email`]
    setFieldErrors(newErrors)
  }

  const handleUpdateWitness = (index: number, field: keyof Witness, value: string) => {
    const updated = [...witnesses]
    updated[index] = {
      ...updated[index],
      [field]: value || null,
    }
    setWitnesses(updated)
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
          section: 'witnesses',
          data: {
            witnesses: witnesses.map(w => ({
              name: w.name.trim(),
              phone: w.phone.trim(),
              email: w.email?.trim() || null,
              statement: w.statement?.trim() || null,
            })),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update witnesses')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating witnesses:', err)
      setError(err.message || 'Failed to update witnesses')
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
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <IoPeopleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Witnesses
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {witnesses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoPeopleOutline className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No witnesses recorded yet
              </p>
              <button
                onClick={handleAddWitness}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <IoAddOutline className="w-4 h-4" />
                Add First Witness
              </button>
            </div>
          ) : (
            <>
              {witnesses.map((witness, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <IoPersonOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Witness {index + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveWitness(index)}
                      disabled={isSaving}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove witness"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <IoPersonOutline className="w-4 h-4" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={witness.name}
                        onChange={(e) => handleUpdateWitness(index, 'name', e.target.value)}
                        placeholder="e.g., John Doe"
                        disabled={isSaving}
                        className={`
                          w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                          text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                          focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${fieldErrors[`witness-${index}-name`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                        `}
                      />
                      {fieldErrors[`witness-${index}-name`] && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <IoAlertCircleOutline className="w-4 h-4" />
                          {fieldErrors[`witness-${index}-name`]}
                        </p>
                      )}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <IoCallOutline className="w-4 h-4" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={witness.phone}
                          onChange={(e) => handleUpdateWitness(index, 'phone', e.target.value)}
                          placeholder="e.g., (555) 123-4567"
                          disabled={isSaving}
                          className={`
                            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${fieldErrors[`witness-${index}-phone`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                          `}
                        />
                        {fieldErrors[`witness-${index}-phone`] && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <IoAlertCircleOutline className="w-4 h-4" />
                            {fieldErrors[`witness-${index}-phone`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <IoMailOutline className="w-4 h-4" />
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={witness.email || ''}
                          onChange={(e) => handleUpdateWitness(index, 'email', e.target.value)}
                          placeholder="e.g., witness@example.com"
                          disabled={isSaving}
                          className={`
                            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${fieldErrors[`witness-${index}-email`] ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                          `}
                        />
                        {fieldErrors[`witness-${index}-email`] && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <IoAlertCircleOutline className="w-4 h-4" />
                            {fieldErrors[`witness-${index}-email`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Statement */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <IoDocumentTextOutline className="w-4 h-4" />
                        Witness Statement (Optional)
                      </label>
                      <textarea
                        value={witness.statement || ''}
                        onChange={(e) => handleUpdateWitness(index, 'statement', e.target.value)}
                        placeholder="What did this witness observe?"
                        disabled={isSaving}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Another Witness Button */}
              <button
                onClick={handleAddWitness}
                disabled={isSaving}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <IoAddOutline className="w-5 h-5" />
                Add Another Witness
              </button>
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