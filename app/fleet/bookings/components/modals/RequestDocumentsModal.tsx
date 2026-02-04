// app/fleet/bookings/components/modals/RequestDocumentsModal.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'
import { FleetBooking } from '../../types'

interface RequestDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: FleetBooking | null
  onSubmit: (bookingId: string, data: { documentTypes: string[]; deadline: string; message: string }) => Promise<void>
  loading: boolean
}

const DOCUMENT_TYPES = [
  { id: 'license', label: "Driver's License", description: 'Valid government-issued driver\'s license' },
  { id: 'insurance', label: 'Insurance Proof', description: 'Current auto insurance documentation' },
  { id: 'selfie', label: 'Selfie Verification', description: 'Photo of guest holding their ID' },
  { id: 'secondary_id', label: 'Secondary ID', description: 'Additional form of identification' },
  { id: 'credit_card', label: 'Credit Card Photo', description: 'Photo of payment card (last 4 digits visible)' }
]

const MESSAGE_TEMPLATES = [
  {
    id: 'clarity',
    label: 'Image Quality Issue',
    message: 'The uploaded document(s) are not clear enough for verification. Please upload higher quality photos where all text is legible.'
  },
  {
    id: 'expired',
    label: 'Expired Document',
    message: 'Your uploaded document has expired. Please provide a current, valid document to proceed.'
  },
  {
    id: 'incomplete',
    label: 'Missing Information',
    message: 'We need additional documentation to complete your verification. Please upload the requested documents.'
  },
  {
    id: 'mismatch',
    label: 'Information Mismatch',
    message: 'The information on your documents doesn\'t match your booking details. Please verify and resubmit.'
  },
  {
    id: 'custom',
    label: 'Custom Message',
    message: ''
  }
]

export function RequestDocumentsModal({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading
}: RequestDocumentsModalProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('incomplete')
  const [customMessage, setCustomMessage] = useState('')

  if (!isOpen || !booking) return null

  const handleDocToggle = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const getMessage = () => {
    if (messageTemplate === 'custom') return customMessage
    return MESSAGE_TEMPLATES.find(t => t.id === messageTemplate)?.message || ''
  }

  const handleSubmit = async () => {
    if (selectedDocs.length === 0 || !deadline) return
    await onSubmit(booking.id, {
      documentTypes: selectedDocs,
      deadline,
      message: getMessage()
    })
    setSelectedDocs([])
    setDeadline('')
    setMessageTemplate('incomplete')
    setCustomMessage('')
    onClose()
  }

  // Get default deadline (48 hours from now)
  const getDefaultDeadline = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoDocumentTextOutline className="w-6 h-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Request Documents
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Booking: {booking.bookingCode}
            </p>
            <p className="text-sm text-gray-500">
              {booking.guestName} ({booking.guestEmail})
            </p>
          </div>

          {/* Current Document Status */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Status</p>
            <div className="flex flex-wrap gap-2">
              <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                booking.licensePhotoUrl
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {booking.licensePhotoUrl ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
                License
              </span>
              <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                booking.insurancePhotoUrl
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {booking.insurancePhotoUrl ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
                Insurance
              </span>
              <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                booking.selfiePhotoUrl
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {booking.selfiePhotoUrl ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
                Selfie
              </span>
            </div>
          </div>

          {/* Document Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Documents <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {DOCUMENT_TYPES.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDocs.includes(doc.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => handleDocToggle(doc.id)}
                    className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.label}</p>
                    <p className="text-xs text-gray-500">{doc.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline || getDefaultDeadline()}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message to Guest
            </label>
            <select
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 mb-2"
            >
              {MESSAGE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            <textarea
              value={messageTemplate === 'custom' ? customMessage : getMessage()}
              onChange={(e) => messageTemplate === 'custom' && setCustomMessage(e.target.value)}
              disabled={messageTemplate !== 'custom'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
              placeholder="Enter custom message..."
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The guest will receive an email notification with the document request. Their booking will remain on hold until documents are submitted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedDocs.length === 0 || !deadline}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
