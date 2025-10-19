// app/fleet/components/DocumentRequestModal.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface DocumentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  hostId: string
  hostName: string
  onSubmit: (documents: string[], message: string) => Promise<void>
}

const DOCUMENT_TYPES = [
  { id: 'governmentId', label: 'Government ID', icon: IoDocumentTextOutline },
  { id: 'driversLicense', label: "Driver's License", icon: IoDocumentTextOutline },
  { id: 'insurance', label: 'Insurance Card', icon: IoDocumentTextOutline },
  { id: 'bankAccount', label: 'Bank Account Info', icon: IoDocumentTextOutline }
]

const TEMPLATE_MESSAGES = {
  blurry: 'The photo you uploaded is too blurry. Please upload a clearer photo where all text is readable.',
  expired: 'The document you uploaded has expired. Please upload a current, valid document.',
  incomplete: 'The document appears to be cut off or incomplete. Please upload the full document.',
  unreadable: 'We cannot read the information on this document. Please ensure all text is clearly visible and in focus.',
  wrong: 'The document type uploaded does not match what we requested. Please upload the correct document.',
  missing: 'We have not received this document yet. Please upload it to continue your application.',
  custom: ''
}

export default function DocumentRequestModal({
  isOpen,
  onClose,
  hostId,
  hostName,
  onSubmit
}: DocumentRequestModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blurry')
  const [customMessage, setCustomMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleSubmit = async () => {
    if (selectedDocuments.length === 0) {
      setError('Please select at least one document')
      return
    }

    const message = selectedTemplate === 'custom' 
      ? customMessage 
      : TEMPLATE_MESSAGES[selectedTemplate as keyof typeof TEMPLATE_MESSAGES]

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await onSubmit(selectedDocuments, message)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset state
        setSelectedDocuments([])
        setSelectedTemplate('blurry')
        setCustomMessage('')
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError('Failed to send document request. Please try again.')
      setSubmitting(false)
    }
  }

  const getMessage = () => {
    if (selectedTemplate === 'custom') return customMessage
    return TEMPLATE_MESSAGES[selectedTemplate as keyof typeof TEMPLATE_MESSAGES]
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Request Documents from {hostName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Document request sent successfully!
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
                <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Document Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Documents to Request
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DOCUMENT_TYPES.map(doc => {
                  const Icon = doc.icon
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleDocumentToggle(doc.id)}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                        selectedDocuments.includes(doc.id)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${
                        selectedDocuments.includes(doc.id)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedDocuments.includes(doc.id)
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {doc.label}
                      </span>
                      {selectedDocuments.includes(doc.id) && (
                        <IoCheckmarkCircle className="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Message Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="blurry">Photo Too Blurry</option>
                <option value="expired">Document Expired</option>
                <option value="incomplete">Incomplete Document</option>
                <option value="unreadable">Unreadable</option>
                <option value="wrong">Wrong Document Type</option>
                <option value="missing">Document Missing</option>
                <option value="custom">Custom Message</option>
              </select>
            </div>

            {/* Message Preview/Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {selectedTemplate === 'custom' ? 'Custom Message' : 'Message Preview'}
              </label>
              {selectedTemplate === 'custom' ? (
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Enter your custom message..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getMessage()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedDocuments.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}