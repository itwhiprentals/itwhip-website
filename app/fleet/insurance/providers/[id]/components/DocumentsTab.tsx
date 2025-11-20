// app/fleet/insurance/providers/[id]/components/DocumentsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoFolderOpenOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoAddCircleOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface Document {
  id: string
  name: string
  type: 'CONTRACT' | 'POLICY' | 'CERTIFICATE' | 'AMENDMENT' | 'OTHER'
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
  expiresAt: string | null
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'ARCHIVED'
  notes: string | null
}

interface DocumentsTabProps {
  providerId: string
  provider: {
    id: string
    name: string
    contractStart: string | null
    contractEnd: string | null
    contractTerms: string | null
  }
}

export default function DocumentsTab({ providerId, provider }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    type: 'CONTRACT' as Document['type'],
    file: null as File | null,
    expiresAt: '',
    notes: ''
  })

  useEffect(() => {
    fetchDocuments()
  }, [providerId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/fleet/insurance/providers/${providerId}/documents?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load documents')
        setDocuments([])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      setError('Network error while loading documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.file) {
      alert('Please select a file')
      return
    }

    try {
      setUploading(true)
      setError(null)
      
      // TODO: Implement file upload to Cloudinary
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('type', uploadForm.type)
      if (uploadForm.expiresAt) formData.append('expiresAt', uploadForm.expiresAt)
      if (uploadForm.notes) formData.append('notes', uploadForm.notes)
      
      const response = await fetch(
        `/api/fleet/insurance/providers/${providerId}/documents?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      if (response.ok) {
        setShowUploadModal(false)
        setUploadForm({
          type: 'CONTRACT',
          file: null,
          expiresAt: '',
          notes: ''
        })
        await fetchDocuments()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
      setError('Network error while uploading document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return

    try {
      const response = await fetch(
        `/api/fleet/insurance/providers/${providerId}/documents/${documentId}?key=phoenix-fleet-2847`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await fetchDocuments()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Network error while deleting document')
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'CONTRACT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      case 'POLICY':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
      case 'CERTIFICATE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case 'AMENDMENT':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusBadge = (status: string, expiresAt: string | null) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full flex items-center space-x-1">
          <IoAlertCircleOutline className="w-3 h-3" />
          <span>Expired</span>
        </span>
      )
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full flex items-center space-x-1">
            <IoCheckmarkCircleOutline className="w-3 h-3" />
            <span>Active</span>
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full">
            Expired
          </span>
        )
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded-full">
            Pending
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
            Archived
          </span>
        )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'active') return doc.status === 'ACTIVE'
    if (filter === 'expired') return doc.status === 'EXPIRED' || (doc.expiresAt && new Date(doc.expiresAt) < new Date())
    return true
  })

  const stats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'ACTIVE').length,
    expired: documents.filter(d => d.status === 'EXPIRED' || (d.expiresAt && new Date(d.expiresAt) < new Date())).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                Error
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Contract Summary */}
      {(provider.contractStart || provider.contractEnd || provider.contractTerms) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
            <IoDocumentTextOutline className="w-5 h-5 mr-2" />
            Master Contract
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {provider.contractStart && (
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">Start Date</p>
                <p className="text-base font-medium text-blue-900 dark:text-blue-200">
                  {new Date(provider.contractStart).toLocaleDateString()}
                </p>
              </div>
            )}
            {provider.contractEnd && (
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">End Date</p>
                <p className="text-base font-medium text-blue-900 dark:text-blue-200">
                  {new Date(provider.contractEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          {provider.contractTerms && (
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">Terms</p>
              <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
                {provider.contractTerms}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <IoCloudUploadOutline className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Expired ({stats.expired})
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <IoFolderOpenOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {documents.length === 0 ? 'No Documents Yet' : 'No Documents Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {documents.length === 0 
                ? 'Upload contracts, policies, and other documents related to this provider.'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
            {documents.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                <span>Upload First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoDocumentTextOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDocumentTypeColor(doc.type)}`}>
                          {doc.type}
                        </span>
                        {getStatusBadge(doc.status, doc.expiresAt)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <IoPersonOutline className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{doc.uploadedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IoCalendarOutline className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </div>
                      {doc.expiresAt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Expires: {new Date(doc.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      {doc.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center flex-wrap gap-3">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <IoEyeOutline className="w-4 h-4" />
                    <span>View</span>
                  </a>
                  <a
                    href={doc.fileUrl}
                    download
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Document
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select 
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CONTRACT">Contract</option>
                  <option value="POLICY">Policy</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="AMENDMENT">Amendment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={uploadForm.expiresAt}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any notes about this document..."
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="w-5 h-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}