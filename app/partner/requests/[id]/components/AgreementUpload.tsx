// app/partner/requests/[id]/components/AgreementUpload.tsx
// Agreement upload component with AI validation feedback

'use client'

import { useState, useRef } from 'react'
import {
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoCreateOutline
} from 'react-icons/io5'
import HostAgreementPreview, { type AgreementSection } from './HostAgreementPreview'

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

interface ValidationResult {
  isValid: boolean
  score: number
  documentType: string
  hasSignatureSection: boolean
  issues: ValidationIssue[]
  suggestions: string[]
  summary: string
}

interface AgreementUploadProps {
  onUploadSuccess: () => void
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
    sections?: AgreementSection[] | null
  }
  hostName?: string
}

export default function AgreementUpload({ onUploadSuccess, existingAgreement, hostName }: AgreementUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [uploadedSections, setUploadedSections] = useState<AgreementSection[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasExisting = !!existingAgreement?.url
  const sections = uploadedSections || (existingAgreement?.sections as AgreementSection[] | null) || null
  const hasSections = sections && sections.length > 0

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset state
    setError(null)
    setValidation(null)

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/partner/onboarding/agreement', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.validation) {
          setValidation(result.validation)
          setShowValidation(true)
        }
        setError(result.error || 'Upload failed')
        return
      }

      // Success
      if (result.validation) {
        setValidation(result.validation)
        setShowValidation(true)
      }

      // Store extracted sections from upload response
      if (result.agreement?.sections) {
        setUploadedSections(result.agreement.sections)
      }

      setEditMode(false)
      onUploadSuccess()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this agreement?')) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/partner/onboarding/agreement', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to delete')
        return
      }

      setValidation(null)
      onUploadSuccess()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <IoAlertCircleOutline className="w-4 h-4 text-red-500" />
      case 'warning':
        return <IoWarningOutline className="w-4 h-4 text-yellow-500" />
      default:
        return <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview/Edit Mode — when agreement exists with sections */}
      {hasExisting && hasSections && !editMode && (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {existingAgreement?.fileName || 'Rental Agreement'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {existingAgreement?.validationScore && (
                    <span className={`text-xs font-medium ${getScoreColor(existingAgreement.validationScore)}`}>
                      {existingAgreement.validationScore}/100
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sections.length} sections
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Replace agreement"
              >
                <IoCreateOutline className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline accordion preview — same pattern as ItWhip's AgreementFullPreview */}
          {showPreview ? (
            <HostAgreementPreview
              sections={sections}
              hostName={hostName}
              onClose={() => setShowPreview(false)}
              inline
            />
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                <IoEyeOutline className="w-4 h-4" />
                Preview Agreement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legacy display — existing agreement without sections */}
      {hasExisting && !hasSections && !editMode && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoDocumentTextOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {existingAgreement?.fileName || 'Rental Agreement'}
                </p>
                {existingAgreement?.validationScore && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${getScoreColor(existingAgreement.validationScore)}`}>
                      Score: {existingAgreement.validationScore}/100
                    </span>
                    {existingAgreement.validationScore >= 80 && (
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                )}
                {existingAgreement?.validationSummary && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {existingAgreement.validationSummary}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {existingAgreement?.url && (
                <a
                  href={existingAgreement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="View PDF"
                >
                  <IoEyeOutline className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setEditMode(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Replace"
              >
                <IoCreateOutline className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload UI — shown when no agreement exists or in edit mode */}
      {(!hasExisting || editMode) && (
        <>
          {editMode && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload a new PDF to replace the current agreement.</p>
              <button
                onClick={() => setEditMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="agreement-upload"
            />
            <label
              htmlFor="agreement-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              {uploading ? (
                <>
                  <IoRefreshOutline className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-gray-500">Uploading & Validating...</span>
                </>
              ) : (
                <>
                  <IoCloudUploadOutline className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {hasExisting ? 'Replace Agreement PDF' : 'Upload Agreement PDF'}
                  </span>
                </>
              )}
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              PDF only, max 10MB. AI will validate and extract sections automatically.
            </p>
          </div>
          {editMode && hasExisting && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
              ) : (
                <IoTrashOutline className="w-4 h-4" />
              )}
              Remove Agreement
            </button>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <IoAlertCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validation && showValidation && (
        <div className={`rounded-lg border overflow-hidden ${
          validation.isValid
            ? 'border-green-200 dark:border-green-800'
            : 'border-red-200 dark:border-red-800'
        }`}>
          {/* Header */}
          <div className={`p-3 flex items-center justify-between ${getScoreBg(validation.score)}`}>
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
              ) : (
                <IoAlertCircleOutline className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                AI Validation {validation.isValid ? 'Passed' : 'Failed'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${getScoreColor(validation.score)}`}>
                {validation.score}/100
              </span>
              <button
                onClick={() => setShowValidation(false)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <IoCloseOutline className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
            {/* Summary */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {validation.summary}
            </p>

            {/* Document Info */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Type: {validation.documentType.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${
                validation.hasSignatureSection
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {validation.hasSignatureSection ? 'Has signature section' : 'No signature section found'}
              </span>
            </div>

            {/* Issues */}
            {validation.issues.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issues</p>
                {validation.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {getSeverityIcon(issue.severity)}
                    <span className={`${
                      issue.severity === 'error' ? 'text-red-600 dark:text-red-400' :
                      issue.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {issue.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Suggestions</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  {validation.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy: Host Agreement Preview Modal (for agreements without inline) */}
    </div>
  )
}
