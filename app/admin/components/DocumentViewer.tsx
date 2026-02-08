// app/admin/components/DocumentViewer.tsx
'use client'

import React, { useState } from 'react'
import {
  IoCloseOutline,
  IoExpandOutline,
  IoContractOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarningOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoSwapHorizontalOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoShieldOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Document {
  type: 'license' | 'insurance' | 'selfie'
  url: string
  uploadedAt?: string
  verified?: boolean
  notes?: string
}

interface LicenseData {
  number?: string
  state?: string
  expiry?: string
  dateOfBirth?: string
}

interface DocumentViewerProps {
  documents: Document[]
  licenseData?: LicenseData
  guestName?: string
  onApprove?: (type: string, notes?: string) => void
  onReject?: (type: string, reason: string) => void
  readOnly?: boolean
}

export default function DocumentViewer({
  documents,
  licenseData,
  guestName,
  onApprove,
  onReject,
  readOnly = false
}: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <IoDocumentTextOutline className="w-5 h-5" />
      case 'insurance':
        return <IoShieldOutline className="w-5 h-5" />
      case 'selfie':
        return <IoPersonOutline className="w-5 h-5" />
      default:
        return <IoDocumentTextOutline className="w-5 h-5" />
    }
  }

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'license':
        return "Driver's License"
      case 'insurance':
        return 'Insurance Document'
      case 'selfie':
        return 'Identity Verification Selfie'
      default:
        return 'Document'
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  const handleApprove = (doc: Document) => {
    if (onApprove) {
      onApprove(doc.type, 'Document verified and approved')
    }
  }

  const handleReject = (type: string) => {
    if (onReject && rejectReason) {
      onReject(type, rejectReason)
      setShowRejectModal(null)
      setRejectReason('')
    }
  }

  const licenseDoc = documents.find(d => d.type === 'license')
  const insuranceDoc = documents.find(d => d.type === 'insurance')
  const selfieDoc = documents.find(d => d.type === 'selfie')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verification Documents
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review submitted documents for {guestName || 'Guest'}
        </p>
      </div>

      {/* License Information Card */}
      {licenseData && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <IoInformationCircleOutline className="w-4 h-4 mr-2" />
            License Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">License Number</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {licenseData.number || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {licenseData.state || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {licenseData.expiry ? new Date(licenseData.expiry).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {licenseData.dateOfBirth ? new Date(licenseData.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* License Document */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                {getDocumentIcon('license')}
                <span className="ml-2">Driver's License</span>
              </h3>
              {licenseDoc?.verified && (
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {licenseDoc ? (
              <div className="relative group">
                <img
                  src={licenseDoc.url}
                  alt="Driver's License"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedDoc(licenseDoc)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedDoc(licenseDoc)}
                    className="px-3 py-1 bg-white text-gray-900 rounded-lg text-sm font-medium"
                  >
                    View Full Size
                  </button>
                </div>
                
                {!readOnly && !licenseDoc.verified && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleApprove(licenseDoc)}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal('license')}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <IoWarningOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Not uploaded</p>
                </div>
              </div>
            )}
          </div>

          {/* Insurance Document */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                {getDocumentIcon('insurance')}
                <span className="ml-2">Insurance</span>
              </h3>
              {insuranceDoc?.verified && (
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {insuranceDoc ? (
              <div className="relative group">
                <img
                  src={insuranceDoc.url}
                  alt="Insurance Document"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedDoc(insuranceDoc)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedDoc(insuranceDoc)}
                    className="px-3 py-1 bg-white text-gray-900 rounded-lg text-sm font-medium"
                  >
                    View Full Size
                  </button>
                </div>
                
                {!readOnly && !insuranceDoc.verified && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleApprove(insuranceDoc)}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal('insurance')}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <IoWarningOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Not uploaded</p>
                </div>
              </div>
            )}
          </div>

          {/* Selfie */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                {getDocumentIcon('selfie')}
                <span className="ml-2">Identity Selfie</span>
              </h3>
              {selfieDoc?.verified && (
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {selfieDoc ? (
              <div className="relative group">
                <img
                  src={selfieDoc.url}
                  alt="Identity Selfie"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedDoc(selfieDoc)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedDoc(selfieDoc)}
                    className="px-3 py-1 bg-white text-gray-900 rounded-lg text-sm font-medium"
                  >
                    View Full Size
                  </button>
                </div>
                
                {!readOnly && !selfieDoc.verified && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleApprove(selfieDoc)}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal('selfie')}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <IoWarningOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Not uploaded</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compare Mode Button */}
        {licenseDoc && selfieDoc && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <IoSwapHorizontalOutline className="w-5 h-5 mr-2" />
              {compareMode ? 'Exit Compare Mode' : 'Compare License & Selfie'}
            </button>
          </div>
        )}

        {/* Compare Mode View */}
        {compareMode && licenseDoc && selfieDoc && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Identity Comparison
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">License Photo</p>
                <img
                  src={licenseDoc.url}
                  alt="License"
                  className="w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Selfie</p>
                <img
                  src={selfieDoc.url}
                  alt="Selfie"
                  className="w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Verify that the person in both photos appears to be the same individual
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Viewer Modal */}
      {selectedDoc && (
        <div className={`fixed inset-0 z-50 bg-black ${fullscreen ? '' : 'bg-opacity-90'}`}>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Zoom In"
                >
                  <IoAddOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Zoom Out"
                >
                  <IoRemoveOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Rotate"
                >
                  <IoRefreshOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Reset"
                >
                  Reset
                </button>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {fullscreen ? <IoContractOutline className="w-5 h-5" /> : <IoExpandOutline className="w-5 h-5" />}
                </button>
                <a
                  href={selectedDoc.url}
                  download
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Download"
                >
                  <IoDownloadOutline className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Close"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="overflow-auto max-w-full max-h-full">
              <img
                src={selectedDoc.url}
                alt={getDocumentTitle(selectedDoc.type)}
                className="max-w-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>

            {/* Document Info */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                <p className="text-sm font-medium">{getDocumentTitle(selectedDoc.type)}</p>
                {selectedDoc.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(selectedDoc.uploadedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject {getDocumentTitle(showRejectModal)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Rejection
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Document unclear or blurry">Document unclear or blurry</option>
                  <option value="Document expired">Document expired</option>
                  <option value="Name mismatch">Name mismatch</option>
                  <option value="Document appears altered">Document appears altered</option>
                  <option value="Wrong document type">Wrong document type</option>
                  <option value="Face not matching">Face not matching</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {rejectReason === 'Other' && (
                <textarea
                  placeholder="Please specify..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}