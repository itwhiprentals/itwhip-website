// app/partner/settings/components/AgreementTab.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoDocumentOutline,
  IoEyeOutline,
} from 'react-icons/io5'

type AgreementType = 'ITWHIP' | 'OWN' | 'BOTH'

interface AgreementSection {
  id: string
  title: string
  content: string
  icon: string
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

interface AgreementData {
  url: string | null
  fileName: string | null
  validationScore: number | null
  validationSummary: string | null
  sections: AgreementSection[] | null
}

export function AgreementTab() {
  const t = useTranslations('PartnerSettings')

  const [preference, setPreference] = useState<AgreementType | null>(null)
  const [agreement, setAgreement] = useState<AgreementData>({
    url: null,
    fileName: null,
    validationScore: null,
    validationSummary: null,
    sections: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [uploadValidation, setUploadValidation] = useState<{
    score: number
    isValid: boolean
    issues?: ValidationIssue[]
    suggestions?: string[]
    summary?: string
  } | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAgreement()
  }, [])

  const fetchAgreement = async () => {
    try {
      const res = await fetch('/api/partner/settings/agreement')
      const data = await res.json()
      if (data.success) {
        setPreference(data.preference || null)
        setAgreement(data.agreement)
      }
    } catch (error) {
      console.error('Failed to fetch agreement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreference = async () => {
    if (!preference) return
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/partner/settings/agreement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference })
      })
      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: t('agreementSaved') })
        setHasChanges(false)
      } else {
        setMessage({ type: 'error', text: data.error || t('agreementSaveFailed') })
      }
    } catch {
      setMessage({ type: 'error', text: t('agreementSaveFailed') })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: t('agreementPdfOnly') })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('agreementTooLarge') })
      return
    }

    setIsUploading(true)
    setMessage(null)
    setUploadValidation(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/partner/settings/agreement', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        setAgreement({
          url: data.agreement.url,
          fileName: data.agreement.fileName,
          validationScore: data.agreement.validationScore,
          validationSummary: data.agreement.validationSummary,
          sections: data.agreement.sections || null
        })
        setUploadValidation(data.validation || null)
        setMessage({ type: 'success', text: data.message || t('agreementUploaded') })
      } else {
        setUploadValidation(data.validation || null)
        setMessage({ type: 'error', text: data.error || t('agreementUploadFailed') })
      }
    } catch {
      setMessage({ type: 'error', text: t('agreementUploadFailed') })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/partner/settings/agreement', {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        setAgreement({ url: null, fileName: null, validationScore: null, validationSummary: null, sections: null })
        setUploadValidation(null)
        setMessage({ type: 'success', text: t('agreementRemoved') })
      } else {
        setMessage({ type: 'error', text: data.error || t('agreementDeleteFailed') })
      }
    } catch {
      setMessage({ type: 'error', text: t('agreementDeleteFailed') })
    } finally {
      setIsDeleting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectPreference = (pref: AgreementType) => {
    setPreference(pref)
    setHasChanges(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    )
  }

  const agreementOptions: Array<{
    value: AgreementType
    icon: typeof IoShieldCheckmarkOutline
    title: string
    description: string
    tag?: string
    tagColor?: string
  }> = [
    {
      value: 'ITWHIP',
      icon: IoShieldCheckmarkOutline,
      title: t('agreementOptItwhip'),
      description: t('agreementOptItwhipDesc'),
      tag: t('agreementOptRecommended'),
      tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      value: 'OWN',
      icon: IoDocumentTextOutline,
      title: t('agreementOptOwn'),
      description: t('agreementOptOwnDesc'),
    },
    {
      value: 'BOTH',
      icon: IoLayersOutline,
      title: t('agreementOptBoth'),
      description: t('agreementOptBothDesc'),
      tag: t('agreementOptMostProtection'),
      tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ]

  const showUpload = preference === 'OWN' || preference === 'BOTH'
  const showItwhipPreview = preference === 'ITWHIP' || preference === 'BOTH'

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('agreementTabTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('agreementTabDescription')}</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Preference Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('agreementPreferenceLabel')}
        </label>
        {agreementOptions.map((option) => {
          const Icon = option.icon
          const isSelected = preference === option.value

          return (
            <button
              key={option.value}
              onClick={() => selectPreference(option.value)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'border-orange-500 dark:border-orange-400' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{option.title}</span>
                    {option.tag && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${option.tagColor}`}>
                        {option.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Save Preference Button */}
      {hasChanges && (
        <button
          onClick={handleSavePreference}
          disabled={isSaving || !preference}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isSaving ? t('saving') : t('savePreference')}
        </button>
      )}

      {/* ItWhip Agreement Preview */}
      {showItwhipPreview && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900 dark:text-white">{t('itwhipAgreementActive')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('itwhipAgreementActiveDesc')}</p>
            </div>
            <a
              href="/agreement/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              <IoEyeOutline className="w-4 h-4" />
              {t('previewAgreement')}
            </a>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {showUpload && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('yourAgreement')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('yourAgreementDesc')}</p>
          </div>

          {/* Current Agreement */}
          {agreement.url ? (
            <div className="space-y-3">
              {/* File info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 min-w-0">
                  <IoDocumentOutline className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {agreement.fileName || 'agreement.pdf'}
                    </p>
                    {agreement.validationScore !== null && (
                      <p className={`text-xs font-medium ${getScoreColor(agreement.validationScore)}`}>
                        {t('validationScoreLabel')}: {agreement.validationScore}/100
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={agreement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    {t('viewPdf')}
                  </a>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Validation Score Card */}
              {agreement.validationScore !== null && (
                <div className={`p-3 rounded-lg border ${getScoreBg(agreement.validationScore)}`}>
                  <div className="flex items-start gap-2">
                    {agreement.validationScore >= 60 ? (
                      <IoCheckmarkCircleOutline className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getScoreColor(agreement.validationScore)}`} />
                    ) : (
                      <IoWarningOutline className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getScoreColor(agreement.validationScore)}`} />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${getScoreColor(agreement.validationScore)}`}>
                        {agreement.validationScore >= 80 ? t('validationGood') :
                         agreement.validationScore >= 60 ? t('validationAcceptable') :
                         t('validationNeedsWork')}
                      </p>
                      {agreement.validationSummary && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {agreement.validationSummary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload validation issues from last upload */}
              {uploadValidation?.issues && uploadValidation.issues.length > 0 && (
                <div className="space-y-1">
                  {uploadValidation.issues.map((issue, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded ${
                      issue.severity === 'error'
                        ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                        : issue.severity === 'warning'
                        ? 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                        : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                    }`}>
                      <IoAlertCircleOutline className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Section Preview Accordion */}
              {agreement.sections && agreement.sections.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    {t('agreementSections')}
                  </p>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {agreement.sections.map((section) => (
                      <div key={section.id}>
                        <button
                          onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{section.title}</span>
                          {expandedSection === section.id
                            ? <IoChevronUpOutline className="w-4 h-4 text-gray-400" />
                            : <IoChevronDownOutline className="w-4 h-4 text-gray-400" />
                          }
                        </button>
                        {expandedSection === section.id && (
                          <div className="px-3 pb-3 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                            {section.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replace button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                {t('replaceAgreement')}
              </button>
            </div>
          ) : (
            /* Drop Zone */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isUploading
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/5'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('uploadingAndValidating')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <IoCloudUploadOutline className="w-10 h-10 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dropPdfHere')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('pdfMaxSize')}</p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
