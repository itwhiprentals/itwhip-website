// app/components/claims/EditDescriptionModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoInformationCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import {
  validateDescription,
  formatCharacterCount,
  DESCRIPTION_TOOLTIP,
  DESCRIPTION_MIN_LENGTH,
} from '@/lib/validation/claimValidation'

interface EditDescriptionModalProps {
  claimId: string
  currentDescription: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditDescriptionModal({
  claimId,
  currentDescription,
  isOpen,
  onClose,
  onSuccess,
}: EditDescriptionModalProps) {
  const [description, setDescription] = useState(currentDescription)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset description when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription(currentDescription)
      setError('')
      setValidationError(null)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentDescription])

  // Validate on change
  useEffect(() => {
    if (description !== currentDescription) {
      setValidationError(validateDescription(description))
    } else {
      setValidationError(null)
    }
  }, [description, currentDescription])

  const handleSave = async () => {
    setError('')
    
    // Final validation
    const validationErr = validateDescription(description)
    if (validationErr) {
      setValidationError(validationErr)
      return
    }

    // Check if changed
    if (description.trim() === currentDescription.trim()) {
      setError('No changes detected. Please modify the description to save.')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/host/claims/${claimId}/edit-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update description')
      }

      // Success!
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating description:', err)
      setError(err.message || 'Failed to update description')
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

  const hasChanges = description.trim() !== currentDescription.trim()
  const isValid = !validationError && hasChanges

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {/* Mobile: Bottom Sheet | Desktop: Centered Modal */}
      <div className={`
        bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:mx-4
        flex flex-col
        sm:rounded-lg
        rounded-t-2xl sm:rounded-b-lg
        shadow-xl
        max-h-[90vh] sm:max-h-[85vh]
        animate-slide-up sm:animate-none
      `}>
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ✏️ Edit Description
          </h3>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Tooltip */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {DESCRIPTION_TOOLTIP}
              </p>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe what happened, when it occurred, and the extent of the damage..."
              disabled={isSaving}
              className={`
                w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${validationError ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              `}
              autoFocus
            />
            
            {/* Character count */}
            <div className="flex justify-between items-center mt-2">
              <div>
                {validationError && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <IoAlertCircleOutline className="w-4 h-4" />
                    {validationError}
                  </p>
                )}
              </div>
              <p className={`text-xs ${
                description.length < DESCRIPTION_MIN_LENGTH
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatCharacterCount(description.length)}
              </p>
            </div>
          </div>

          {/* Warning about visibility */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This edit will be visible to the claims review team. All changes are tracked for audit purposes.
              </p>
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

        {/* Footer - Sticky on mobile */}
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