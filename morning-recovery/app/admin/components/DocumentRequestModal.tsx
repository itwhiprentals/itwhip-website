// app/admin/components/DocumentRequestModal.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoSendOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface DocumentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  hostId: string
  hostName: string
  hostEmail: string
  currentDocuments?: {
    governmentId?: string
    driversLicense?: string
    insurance?: string
  }
  onSubmit: (data: DocumentRequestData) => Promise<void>
}

interface DocumentRequestData {
  hostId: string
  documents: string[]
  requestType: 'clarity' | 'reupload' | 'expired' | 'invalid' | 'custom'
  message: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  deadline?: string
}

const DOCUMENT_TYPES = [
  { id: 'governmentId', label: 'Government ID', icon: IoDocumentTextOutline },
  { id: 'driversLicense', label: "Driver's License", icon: IoDocumentTextOutline },
  { id: 'insurance', label: 'Insurance Certificate', icon: IoDocumentTextOutline }
]

const REQUEST_TEMPLATES = [
  {
    type: 'clarity',
    label: 'Image Quality Issue',
    message: 'The uploaded document image is not clear enough for verification. Please upload a higher quality photo or scan where all text is legible and the entire document is visible.',
    priority: 'MEDIUM' as const
  },
  {
    type: 'reupload',
    label: 'Document Not Readable',
    message: 'We were unable to read the information on your document due to blur, glare, or poor lighting. Please take a new photo in good lighting conditions and ensure all text is clearly visible.',
    priority: 'MEDIUM' as const
  },
  {
    type: 'expired',
    label: 'Expired Document',
    message: 'The document you uploaded has expired. Please upload a current, valid document to proceed with verification.',
    priority: 'HIGH' as const
  },
  {
    type: 'invalid',
    label: 'Invalid/Incorrect Document',
    message: 'The document uploaded does not match the required document type. Please ensure you are uploading the correct document as specified.',
    priority: 'HIGH' as const
  },
  {
    type: 'custom',
    label: 'Custom Message',
    message: '',
    priority: 'MEDIUM' as const
  }
]

export default function DocumentRequestModal({
  isOpen,
  onClose,
  hostId,
  hostName,
  hostEmail,
  currentDocuments = {},
  onSubmit
}: DocumentRequestModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [requestType, setRequestType] = useState<'clarity' | 'reupload' | 'expired' | 'invalid' | 'custom'>('clarity')
  const [customMessage, setCustomMessage] = useState('')
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleTemplateSelect = (template: typeof REQUEST_TEMPLATES[0]) => {
    setRequestType(template.type as any)
    setCustomMessage(template.message)
    setPriority(template.priority)
  }

  const getMessage = () => {
    if (requestType === 'custom') {
      return customMessage
    }
    const template = REQUEST_TEMPLATES.find(t => t.type === requestType)
    return template?.message || ''
  }

  const handleSubmit = async () => {
    if (selectedDocuments.length === 0) {
      alert('Please select at least one document')
      return
    }

    if (!getMessage().trim()) {
      alert('Please provide a message')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit({
        hostId,
        documents: selectedDocuments,
        requestType,
        message: getMessage(),
        priority,
        deadline: deadline || undefined
      })

      // Reset form
      setSelectedDocuments([])
      setRequestType('clarity')
      setCustomMessage('')
      setPriority('MEDIUM')
      setDeadline('')
      
      onClose()
    } catch (error) {
      console.error('Failed to submit request:', error)
      alert('Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Request Document Update
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Host: {hostName} ({hostEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Document Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Document(s) to Request
            </label>
            <div className="space-y-2">
              {DOCUMENT_TYPES.map((doc) => {
                const Icon = doc.icon
                const hasDocument = currentDocuments[doc.id as keyof typeof currentDocuments]
                
                return (
                  <label
                    key={doc.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedDocuments.includes(doc.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleDocumentToggle(doc.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Icon className="w-5 h-5 text-gray-400 mx-3" />
                    <span className="flex-1 font-medium text-gray-900 dark:text-white">
                      {doc.label}
                    </span>
                    {hasDocument ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <IoCheckmarkCircleOutline className="w-4 h-4" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <IoWarningOutline className="w-4 h-4" />
                        Not Uploaded
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Request Template */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Issue Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REQUEST_TEMPLATES.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 text-left text-sm font-medium rounded-lg border-2 transition-all ${
                    requestType === template.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Message to Host
            </label>
            <textarea
              value={requestType === 'custom' ? customMessage : getMessage()}
              onChange={(e) => requestType === 'custom' && setCustomMessage(e.target.value)}
              disabled={requestType !== 'custom'}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 resize-none"
              placeholder="Enter your custom message here..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This message will be sent via email and displayed in the host dashboard.
            </p>
          </div>

          {/* Priority and Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Warning for High Priority */}
          {priority === 'HIGH' && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <IoAlertCircleOutline className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  High Priority Request
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  The host will receive an urgent notification and their account may be restricted until this is resolved.
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Email Preview
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-900 dark:text-white">
                <strong>To:</strong> {hostEmail}
              </p>
              <p className="text-gray-900 dark:text-white">
                <strong>Subject:</strong> Action Required - Document Update Needed
              </p>
              <p className="text-gray-900 dark:text-white">
                <strong>Documents:</strong> {selectedDocuments.length > 0 
                  ? selectedDocuments.map(id => DOCUMENT_TYPES.find(d => d.id === id)?.label).join(', ')
                  : 'None selected'}
              </p>
              {deadline && (
                <p className="text-gray-900 dark:text-white">
                  <strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedDocuments.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <IoSendOutline className="w-5 h-5" />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}