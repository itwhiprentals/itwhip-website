// app/host/components/DocumentUploadSection.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import {
  IoCloudUploadOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoImageOutline,
  IoIdCardOutline,
  IoCarOutline,
  IoEarthOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'
import Image from 'next/image'

// Photo ID type definitions
const PHOTO_ID_TYPES = {
  GOVERNMENT_ID: {
    label: 'Government ID',
    description: 'State ID or other government-issued photo ID',
    icon: IoIdCardOutline,
    pages: [
      { id: 'front', label: 'Front Side', description: 'Photo and personal info visible' },
      { id: 'back', label: 'Back Side', description: 'Barcode and additional info' }
    ]
  },
  DRIVERS_LICENSE: {
    label: "Driver's License",
    description: 'Valid driver\'s license from any state',
    icon: IoCarOutline,
    pages: [
      { id: 'front', label: 'Front Side', description: 'Photo, name, and license number' },
      { id: 'back', label: 'Back Side', description: 'Barcode and endorsements' }
    ]
  },
  PASSPORT: {
    label: 'Passport',
    description: 'Valid passport (US or International)',
    icon: IoEarthOutline,
    pages: [
      { id: 'photo', label: 'Photo Page', description: 'Your photo and personal details' },
      { id: 'info', label: 'Information Page', description: 'Additional passport info' },
      { id: 'lastPage', label: 'Last Page', description: 'Signature or stamps page' }
    ]
  }
} as const

type PhotoIdType = keyof typeof PHOTO_ID_TYPES

interface DocumentUploadSectionProps {
  hostId: string
  documentStatuses?: any
  onDocumentUpdate?: () => void
}

interface UploadedPage {
  pageId: string
  url: string
  uploadedAt: string
}

export default function DocumentUploadSection({
  hostId,
  documentStatuses = {},
  onDocumentUpdate
}: DocumentUploadSectionProps) {
  // Multi-step state
  const [step, setStep] = useState<'select' | 'upload' | 'review'>('select')
  const [selectedIdType, setSelectedIdType] = useState<PhotoIdType | null>(null)
  const [uploadedPages, setUploadedPages] = useState<Record<string, UploadedPage>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Insurance state (separate flow)
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null)
  const [insuranceStatus, setInsuranceStatus] = useState<'NOT_UPLOADED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_UPLOADED')
  const [uploadingInsurance, setUploadingInsurance] = useState(false)

  // Status from API
  const [photoIdVerified, setPhotoIdVerified] = useState(false)
  const [photoIdSubmitted, setPhotoIdSubmitted] = useState(false) // Track if user has clicked Submit
  const [submitting, setSubmitting] = useState(false)
  const [existingPhotoIdType, setExistingPhotoIdType] = useState<PhotoIdType | null>(null)
  const [existingPhotoIdUrls, setExistingPhotoIdUrls] = useState<Record<string, string>>({})

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const insuranceInputRef = useRef<HTMLInputElement | null>(null)

  // Fetch existing document status on mount
  useEffect(() => {
    fetchDocumentStatus()
  }, [])

  const fetchDocumentStatus = async () => {
    try {
      const response = await fetch('/api/host/documents/upload', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Set photo ID status
          if (data.data.photoId) {
            const { type, urls, verified, status, submitted } = data.data.photoId
            if (type) {
              setExistingPhotoIdType(type as PhotoIdType)
              setSelectedIdType(type as PhotoIdType)
              setExistingPhotoIdUrls(urls || {})
              setPhotoIdVerified(verified)
              setPhotoIdSubmitted(submitted || false)

              // Convert to uploadedPages format
              const pages: Record<string, UploadedPage> = {}
              Object.entries(urls || {}).forEach(([pageId, url]) => {
                if (url) {
                  pages[pageId] = {
                    pageId,
                    url: url as string,
                    uploadedAt: new Date().toISOString()
                  }
                }
              })
              setUploadedPages(pages)

              // Set step based on status
              if (status === 'VERIFIED' || status === 'UNDER_REVIEW' || status === 'PENDING_SUBMISSION') {
                setStep('review')
              } else if (Object.keys(urls || {}).length > 0) {
                setStep('upload')
              }
            }
          }

          // Set insurance status
          if (data.data.documents?.insurance) {
            const ins = data.data.documents.insurance
            setInsuranceUrl(ins.url || null)
            setInsuranceStatus(ins.status === 'UNDER_REVIEW' ? 'PENDING' : ins.status || 'NOT_UPLOADED')
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch document status:', error)
    }
  }

  const handleSelectIdType = (type: PhotoIdType) => {
    // If switching types, clear uploaded pages
    if (selectedIdType !== type) {
      setUploadedPages({})
    }
    setSelectedIdType(type)
    setStep('upload')
  }

  const handlePageUpload = async (pageId: string, file: File) => {
    if (!selectedIdType) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF.')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setUploading(pageId)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'photo_id')
      formData.append('photoIdType', selectedIdType)
      formData.append('documentSide', pageId)

      const response = await fetch('/api/host/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      // Update local state
      setUploadedPages(prev => ({
        ...prev,
        [pageId]: {
          pageId,
          url: data.url,
          uploadedAt: new Date().toISOString()
        }
      }))

      // Check if all pages are uploaded
      const requiredPages = PHOTO_ID_TYPES[selectedIdType].pages.map(p => p.id)
      const newUploadedPages = { ...uploadedPages, [pageId]: { pageId, url: data.url, uploadedAt: new Date().toISOString() } }
      const allUploaded = requiredPages.every(p => newUploadedPages[p])

      if (allUploaded) {
        // Auto-advance to review step
        setStep('review')
      }

      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const handleInsuranceUpload = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setUploadingInsurance(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'insurance')

      const response = await fetch('/api/host/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setInsuranceUrl(data.url)
      setInsuranceStatus('PENDING')

      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload insurance. Please try again.')
    } finally {
      setUploadingInsurance(false)
    }
  }

  const handleRemovePage = (pageId: string) => {
    setUploadedPages(prev => {
      const updated = { ...prev }
      delete updated[pageId]
      return updated
    })
  }

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? All uploaded pages will be removed.')) {
      setUploadedPages({})
      setSelectedIdType(null)
      setStep('select')
    }
  }

  const handleSubmitDocuments = async () => {
    if (submitting) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/host/documents/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'submit_photo_id' }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit documents')
      }

      // Update local state
      setPhotoIdSubmitted(true)

      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit documents. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSubmission = async (clearPhotos: boolean = false) => {
    const confirmMessage = clearPhotos
      ? 'Are you sure you want to cancel and start over? All uploaded photos will be removed.'
      : 'Are you sure you want to cancel your submission? You can then edit your photos before resubmitting.'

    if (!confirm(confirmMessage)) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/host/documents/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'cancel_photo_id_submission',
          clearPhotos
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel submission')
      }

      // Update local state
      setPhotoIdSubmitted(false)

      if (clearPhotos) {
        setUploadedPages({})
        setSelectedIdType(null)
        setStep('select')
      } else {
        // Stay on review but allow editing
        setStep('upload')
      }

      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert(error instanceof Error ? error.message : 'Failed to cancel submission. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getRequiredPages = () => {
    if (!selectedIdType) return []
    return PHOTO_ID_TYPES[selectedIdType].pages
  }

  const getUploadProgress = () => {
    const required = getRequiredPages()
    const uploaded = Object.keys(uploadedPages).length
    return { uploaded, total: required.length }
  }

  // ========================================
  // RENDER: Step 1 - Select ID Type
  // ========================================
  const renderSelectStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Your Photo ID Type
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose one type of government-issued photo ID to verify your identity.
        </p>
      </div>

      <div className="grid gap-4">
        {(Object.entries(PHOTO_ID_TYPES) as [PhotoIdType, typeof PHOTO_ID_TYPES[PhotoIdType]][]).map(([type, config]) => {
          const Icon = config.icon
          const isSelected = selectedIdType === type

          return (
            <button
              key={type}
              onClick={() => handleSelectIdType(type)}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{config.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {config.pages.length} page{config.pages.length > 1 ? 's' : ''} required: {config.pages.map(p => p.label).join(', ')}
                </p>
              </div>
              {isSelected && (
                <IoCheckmarkCircleOutline className="w-6 h-6 text-blue-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  // ========================================
  // RENDER: Step 2 - Upload Pages
  // ========================================
  const renderUploadStep = () => {
    if (!selectedIdType) return null
    const config = PHOTO_ID_TYPES[selectedIdType]
    const progress = getUploadProgress()

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setStep('select')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              Change ID Type
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload Your {config.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.uploaded} of {progress.total} pages uploaded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(progress.uploaded / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Upload Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {config.pages.map((page) => {
            const uploaded = uploadedPages[page.id]
            const isUploading = uploading === page.id

            return (
              <div
                key={page.id}
                className={`relative rounded-lg border-2 overflow-hidden ${
                  uploaded
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-dashed border-gray-300 dark:border-gray-600'
                }`}
              >
                {uploaded ? (
                  // Uploaded state - show preview
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                    {uploaded.url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                      <Image
                        src={uploaded.url}
                        alt={page.label}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <IoDocumentTextOutline className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewUrl(uploaded.url)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                      >
                        <IoEyeOutline className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleRemovePage(page.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                      >
                        <IoTrashOutline className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Success badge */}
                    <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  // Upload state
                  <div className="aspect-[4/3] flex flex-col items-center justify-center p-4 text-center">
                    <input
                      ref={el => fileInputRefs.current[page.id] = el}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePageUpload(page.id, file)
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />

                    {isUploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mb-2" />
                        <button
                          onClick={() => fileInputRefs.current[page.id]?.click()}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Upload {page.label}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {page.description}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Label */}
                <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{page.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Continue Button */}
        {progress.uploaded === progress.total && (
          <button
            onClick={() => setStep('review')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            Review & Submit
            <IoArrowForwardOutline className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }

  // ========================================
  // RENDER: Step 3 - Review
  // ========================================
  const renderReviewStep = () => {
    if (!selectedIdType) return null
    const config = PHOTO_ID_TYPES[selectedIdType]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {photoIdSubmitted || photoIdVerified ? 'Your ' : 'Review Your '}{config.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {photoIdVerified ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  Verified
                </span>
              ) : photoIdSubmitted ? (
                <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <IoWarningOutline className="w-4 h-4" />
                  Under Review
                </span>
              ) : (
                'Review your documents before submitting'
              )}
            </p>
          </div>
          {/* Only show Start Over button if not submitted and not verified */}
          {!photoIdVerified && !photoIdSubmitted && (
            <button
              onClick={handleStartOver}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
            >
              <IoRefreshOutline className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>

        {/* Document Preview Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.pages.map((page) => {
            const uploaded = uploadedPages[page.id]

            return (
              <div
                key={page.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                  {uploaded?.url ? (
                    <>
                      {uploaded.url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                        <Image
                          src={uploaded.url}
                          alt={page.label}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => setPreviewUrl(uploaded.url)}
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center h-full cursor-pointer"
                          onClick={() => setPreviewUrl(uploaded.url)}
                        >
                          <IoDocumentTextOutline className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {/* Show change button overlay only if not submitted */}
                      {!photoIdSubmitted && !photoIdVerified && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewUrl(uploaded.url)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <IoEyeOutline className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={() => {
                              handleRemovePage(page.id)
                              setStep('upload')
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <IoRefreshOutline className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IoWarningOutline className="w-12 h-12 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white dark:bg-gray-900">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{page.label}</p>
                  {uploaded && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Uploaded {new Date(uploaded.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status Card - Different based on state */}
        {photoIdVerified ? (
          // Verified state
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Identity Verified
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your identity has been verified. Thank you!
                </p>
              </div>
            </div>
          </div>
        ) : photoIdSubmitted ? (
          // Submitted - Under Review state
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Under Review
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Our team will review your documents within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel/Resubmit Options */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Need to make changes? You can cancel your submission and update your photos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelSubmission(false)}
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Edit Photos'}
                </button>
                <button
                  onClick={() => handleCancelSubmission(true)}
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Start Over'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Not submitted - Show submit button
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <IoDocumentTextOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Ready to Submit
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Review your documents above. Once submitted, you won't be able to make changes until review is complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('upload')}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <IoArrowBackOutline className="w-5 h-5" />
                Change Photos
              </button>
              <button
                onClick={handleSubmitDocuments}
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="w-5 h-5" />
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ========================================
  // RENDER: Insurance Section (Always visible)
  // ========================================
  const renderInsuranceSection = () => (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insurance Certificate
            <span className="ml-2 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Required for 90% earnings tier. Optional for standard hosts.
          </p>
        </div>
        {insuranceStatus === 'APPROVED' && (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            Verified
          </span>
        )}
      </div>

      {insuranceUrl ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IoDocumentTextOutline className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Insurance Document</p>
            <p className={`text-sm ${
              insuranceStatus === 'APPROVED'
                ? 'text-green-600 dark:text-green-400'
                : insuranceStatus === 'REJECTED'
                ? 'text-red-600 dark:text-red-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {insuranceStatus === 'APPROVED' ? 'Verified' : insuranceStatus === 'REJECTED' ? 'Rejected' : 'Under Review'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewUrl(insuranceUrl)}
              className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
            >
              <IoEyeOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {insuranceStatus !== 'APPROVED' && (
              <button
                onClick={() => insuranceInputRef.current?.click()}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg"
              >
                <IoRefreshOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => insuranceInputRef.current?.click()}
          disabled={uploadingInsurance}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            {uploadingInsurance ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <IoCloudUploadOutline className="w-8 h-8" />
            )}
            <span className="text-sm font-medium">
              {uploadingInsurance ? 'Uploading...' : 'Upload Insurance Certificate'}
            </span>
          </div>
        </button>
      )}

      <input
        ref={insuranceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleInsuranceUpload(file)
        }}
        className="hidden"
      />
    </div>
  )

  // ========================================
  // RENDER: Preview Modal
  // ========================================
  const renderPreviewModal = () => {
    if (!previewUrl) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={() => setPreviewUrl(null)}
      >
        <div
          className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-lg transition-colors"
          >
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>

          <div className="p-6">
            {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
              <div className="relative w-full h-[70vh]">
                <Image
                  src={previewUrl}
                  alt="Document preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : previewUrl.match(/\.pdf$/i) ? (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border-0"
                title="PDF preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 dark:text-gray-400">
                <IoDocumentTextOutline className="w-16 h-16 mb-4" />
                <p>Preview not available</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Photo ID Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        {step === 'select' && renderSelectStep()}
        {step === 'upload' && renderUploadStep()}
        {step === 'review' && renderReviewStep()}
      </div>

      {/* Insurance Section */}
      {renderInsuranceSection()}

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <IoImageOutline className="w-5 h-5" />
          Document Upload Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Ensure all text is clearly visible and not blurred</li>
          <li>• Take photos in good lighting conditions</li>
          <li>• Capture the entire document without cutting off edges</li>
          <li>• Documents must be current and not expired</li>
          <li>• For passports, include the photo page, info page, and last page</li>
        </ul>
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  )
}
