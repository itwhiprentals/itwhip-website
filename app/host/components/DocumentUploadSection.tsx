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
  IoImageOutline
} from 'react-icons/io5'
import Image from 'next/image'

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  acceptedFormats: string[]
  maxSize: number
  uploadedAt?: string
  url?: string
  rejectionReason?: string
}

interface DocumentUploadSectionProps {
  hostId: string
  documentStatuses?: any
  onDocumentUpdate?: () => void
}

export default function DocumentUploadSection({
  hostId,
  documentStatuses = {},
  onDocumentUpdate
}: DocumentUploadSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'government_id',
      name: 'Government ID',
      description: 'Passport, National ID, or State ID',
      required: true,
      status: 'NOT_UPLOADED',
      acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      maxSize: 10,
      uploadedAt: undefined,
      url: undefined,
      rejectionReason: undefined
    },
    {
      id: 'drivers_license',
      name: "Driver's License",
      description: 'Valid driver\'s license (front and back)',
      required: true,
      status: 'NOT_UPLOADED',
      acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      maxSize: 10,
      uploadedAt: undefined,
      url: undefined,
      rejectionReason: undefined
    },
    {
      id: 'insurance',
      name: 'Insurance Certificate',
      description: 'Proof of vehicle insurance coverage',
      required: true,
      status: 'NOT_UPLOADED',
      acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      maxSize: 10,
      uploadedAt: undefined,
      url: undefined,
      rejectionReason: undefined
    }
  ])
  const [uploading, setUploading] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (documentStatuses && Object.keys(documentStatuses).length > 0) {
      initializeDocuments()
    }
  }, [documentStatuses])

  const initializeDocuments = () => {
    setDocuments(prev => prev.map(doc => {
      const status = documentStatuses[doc.id]
      if (status) {
        return {
          ...doc,
          status: status.status || doc.status,
          url: status.url || doc.url,
          uploadedAt: status.uploadedAt || doc.uploadedAt,
          rejectionReason: status.rejectionReason || doc.rejectionReason
        }
      }
      return doc
    }))
  }

  const handleFileSelect = async (documentId: string, file: File) => {
    const document = documents.find(d => d.id === documentId)
    if (!document) return

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > document.maxSize) {
      alert(`File size exceeds ${document.maxSize}MB limit`)
      return
    }

    // Validate file type
    if (!document.acceptedFormats.includes(file.type)) {
      alert(`Invalid file format. Accepted formats: ${document.acceptedFormats.join(', ')}`)
      return
    }

    setUploading(documentId)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentId)
      formData.append('hostId', hostId)

      const response = await fetch('/api/host/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'PENDING',
              uploadedAt: new Date().toISOString(),
              url: data.url
            }
          : doc
      ))

      alert('Document uploaded successfully! Our team will review it shortly.')
      
      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? You will need to upload it again.')) {
      return
    }

    try {
      const response = await fetch(`/api/host/documents/upload?documentId=${documentId}&hostId=${hostId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'NOT_UPLOADED',
              url: undefined,
              uploadedAt: undefined,
              rejectionReason: undefined
            }
          : doc
      ))

      alert('Document deleted successfully.')
      
      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const handlePreview = (document: Document) => {
    if (!document.url) return
    setPreviewDocument(document)
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'APPROVED':
        return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <IoCloseCircleOutline className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <IoWarningOutline className="w-5 h-5 text-yellow-500" />
      case 'UPLOADED':
        return <IoDocumentTextOutline className="w-5 h-5 text-blue-500" />
      default:
        return <IoCloudUploadOutline className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: Document['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected - Reupload Required'
      case 'PENDING':
        return 'Under Review'
      case 'UPLOADED':
        return 'Uploaded'
      default:
        return 'Not Uploaded'
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 dark:text-green-400'
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400'
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'UPLOADED':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Required Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload clear, readable copies of your documents. All documents must be valid and not expired.
        </p>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className={`bg-white dark:bg-gray-900 rounded-lg border-2 transition-all ${
              document.status === 'REJECTED'
                ? 'border-red-300 dark:border-red-800'
                : document.status === 'APPROVED'
                ? 'border-green-300 dark:border-green-800'
                : 'border-gray-200 dark:border-gray-800'
            } p-5`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(document.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {document.name}
                      {document.required && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {document.description}
                    </p>
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${getStatusColor(document.status)}`}>
                    {getStatusLabel(document.status)}
                  </span>
                </div>

                {/* File Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Accepted formats: JPG, PNG, PDF • Max size: {document.maxSize}MB
                </div>

                {/* Feedback for Rejected Documents */}
                {document.status === 'REJECTED' && document.rejectionReason && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Issue:</strong> {document.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Upload Section */}
                {(document.status === 'NOT_UPLOADED' || document.status === 'REJECTED') && (
                  <div>
                    <input
                      ref={el => fileInputRefs.current[document.id] = el}
                      type="file"
                      accept={document.acceptedFormats.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(document.id, file)
                      }}
                      className="hidden"
                      disabled={uploading === document.id}
                    />
                    <button
                      onClick={() => fileInputRefs.current[document.id]?.click()}
                      disabled={uploading === document.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {uploading === document.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <IoCloudUploadOutline className="w-5 h-5" />
                          {document.status === 'REJECTED' ? 'Upload New File' : 'Upload Document'}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Uploaded File Actions */}
                {(document.status === 'UPLOADED' || document.status === 'PENDING' || document.status === 'APPROVED') && document.url && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePreview(document)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      <IoEyeOutline className="w-4 h-4" />
                      Preview
                    </button>

                    {document.status !== 'APPROVED' && (
                      <>
                        <button
                          onClick={() => fileInputRefs.current[document.id]?.click()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          <IoRefreshOutline className="w-4 h-4" />
                          Replace
                        </button>

                        <button
                          onClick={() => handleDelete(document.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}

                    {/* Hidden input for replace */}
                    <input
                      ref={el => fileInputRefs.current[document.id] = el}
                      type="file"
                      accept={document.acceptedFormats.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(document.id, file)
                      }}
                      className="hidden"
                      disabled={uploading === document.id}
                    />
                  </div>
                )}

                {/* Upload Date */}
                {document.uploadedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDocument && previewDocument.url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewDocument(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewDocument(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-lg transition-colors"
            >
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>

            {/* Preview Content */}
            <div className="p-6">
              {previewDocument.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="relative w-full h-[70vh]">
                  <Image
                    src={previewDocument.url}
                    alt="Document preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : previewDocument.url.match(/\.pdf$/i) ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-[70vh] border-0"
                  title="PDF preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 dark:text-gray-400">
                  <IoDocumentTextOutline className="w-16 h-16 mb-4" />
                  <p>Preview not available for this file type</p>
                  <a
                    href={previewDocument.url}
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
      )}

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
          <li>• Use high-quality scans or photos (minimum 300 DPI recommended)</li>
        </ul>
      </div>
    </div>
  )
}