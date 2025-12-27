// app/fleet/partners/[id]/documents/page.tsx
// Fleet Partner Documents Management Page

'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface Document {
  id: string
  type: string
  status: string
  url: string
  uploadedAt: string
  expiresAt?: string
  isExpired: boolean
  reviewedAt?: string
  reviewedBy?: string
  rejectNote?: string
}

interface Partner {
  id: string
  partnerCompanyName: string
  name: string
}

const DOCUMENT_TYPES = [
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificate' },
  { value: 'COMMERCIAL_AUTO_POLICY', label: 'Commercial Auto Policy' },
  { value: 'BACKGROUND_CHECK', label: 'Background Check' },
  { value: 'W9_FORM', label: 'W-9 Form' },
  { value: 'ARTICLES_OF_INCORPORATION', label: 'Articles of Incorporation' },
  { value: 'OTHER', label: 'Other Document' }
]

export default function PartnerDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [partner, setPartner] = useState<Partner | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPartnerDocuments()
  }, [resolvedParams.id])

  const fetchPartnerDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/partners/${resolvedParams.id}?key=${apiKey}`)
      const data = await response.json()

      if (data.success && data.partner) {
        setPartner({
          id: data.partner.id,
          partnerCompanyName: data.partner.partnerCompanyName,
          name: data.partner.name
        })
        setDocuments(data.partner.partnerDocuments || [])
      }
    } catch (error) {
      console.error('Failed to fetch partner documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (approved: boolean) => {
    if (!selectedDoc) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${resolvedParams.id}/documents/${selectedDoc.id}/verify?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'VERIFIED' : 'REJECTED',
          notes: verifyNotes,
          verifiedBy: 'Fleet Admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowVerifyModal(false)
        setSelectedDoc(null)
        setVerifyNotes('')
        fetchPartnerDocuments()
      } else {
        alert(data.error || 'Failed to update document status')
      }
    } catch (error) {
      console.error('Failed to verify document:', error)
      alert('Failed to update document status')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    }
    switch (status) {
      case 'VERIFIED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'REJECTED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'PENDING':
      default:
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    }
  }

  const getStatusIcon = (status: string, isExpired: boolean) => {
    if (isExpired) return <IoWarningOutline className="w-4 h-4" />
    switch (status) {
      case 'VERIFIED':
        return <IoCheckmarkCircleOutline className="w-4 h-4" />
      case 'REJECTED':
        return <IoCloseCircleOutline className="w-4 h-4" />
      default:
        return <IoTimeOutline className="w-4 h-4" />
    }
  }

  const getDocumentTypeName = (type: string) => {
    const found = DOCUMENT_TYPES.find(t => t.value === type)
    return found?.label || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading documents...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Partner Documents
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {partner?.partnerCompanyName || partner?.name || 'Partner'}
              </p>
            </div>
            <button
              onClick={fetchPartnerDocuments}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoRefreshOutline className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {documents.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'VERIFIED' && !d.isExpired).length}
            </div>
            <div className="text-xs text-gray-500">Verified</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Documents Uploaded
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This partner hasn't uploaded any documents yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Document Icon & Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getDocumentTypeName(doc.type)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Uploaded {formatDate(doc.uploadedAt)}
                      </div>
                      {doc.expiresAt && (
                        <div className={`text-sm ${doc.isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                          {doc.isExpired ? 'Expired: ' : 'Expires: '}{formatDate(doc.expiresAt)}
                        </div>
                      )}
                      {doc.reviewedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Reviewed {formatDate(doc.reviewedAt)} by {doc.reviewedBy}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.status, doc.isExpired)}`}>
                      {getStatusIcon(doc.status, doc.isExpired)}
                      {doc.isExpired ? 'EXPIRED' : doc.status}
                    </span>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <IoEyeOutline className="w-4 h-4" />
                    </a>

                    {doc.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedDoc(doc)
                          setShowVerifyModal(true)
                        }}
                        className="px-3 py-2 min-h-[44px] sm:min-h-0 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>

                {doc.rejectNote && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Rejection Note:</span> {doc.rejectNote}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Review Document
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getDocumentTypeName(selectedDoc.type)}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <a
                  href={selectedDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <IoEyeOutline className="w-5 h-5" />
                  View Document
                </a>
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Notes (optional)
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Add any notes about this document..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false)
                  setSelectedDoc(null)
                  setVerifyNotes('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-3 sm:py-2 min-h-[44px] sm:min-h-0 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 sm:py-2 min-h-[44px] sm:min-h-0 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={processing}
                className="flex-1 px-4 py-3 sm:py-2 min-h-[44px] sm:min-h-0 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
