'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoSwapHorizontalOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface AvailableRequest {
  id: string
  requestCode: string
  guestName: string
  vehicleType?: string
  vehicleMake?: string
  startDate?: string
  endDate?: string
  durationDays?: number
  offeredRate?: number
  pickupCity?: string
  pickupState?: string
}

interface NewRequestModalProps {
  prospectId: string
  currentRequestId?: string
  apiKey: string
  onClose: () => void
  onSuccess: () => void
}

export default function NewRequestModal({
  prospectId,
  currentRequestId,
  apiKey,
  onClose,
  onSuccess
}: NewRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availableRequests, setAvailableRequests] = useState<AvailableRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<AvailableRequest | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchAvailableRequests()
  }, [])

  useEffect(() => {
    if (selectedRequestId) {
      const found = availableRequests.find(r => r.id === selectedRequestId)
      setSelectedRequest(found || null)
    } else {
      setSelectedRequest(null)
    }
  }, [selectedRequestId, availableRequests])

  const fetchAvailableRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fleet/requests?status=OPEN&key=${apiKey}`)
      const data = await response.json()
      if (data.success && data.requests) {
        setAvailableRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleSubmit = async () => {
    if (!selectedRequestId) return

    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch(`/api/fleet/prospects/${prospectId}/new-request?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selectedRequestId })
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: 'New request assigned and invite email sent!' })
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        setResult({ success: false, message: data.error || 'Failed to assign new request' })
      }
    } catch (error) {
      console.error('Failed to assign new request:', error)
      setResult({ success: false, message: 'Network error - please try again' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-lg rounded-t-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-xl">
          {/* Drag handle for mobile */}
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3" />

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
            <div className="flex items-center gap-2">
              <IoSwapHorizontalOutline className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign New Request
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
              This replaces the current request, sends a new 3-day invite link, and withdraws any old claims.
            </div>

            {/* Request Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select New Request *
              </label>
              {loading ? (
                <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              ) : availableRequests.length === 0 ? (
                <p className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  No other open requests available.
                </p>
              ) : (
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a request --</option>
                  {availableRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.requestCode} - {req.guestName} ({req.vehicleMake || req.vehicleType || 'Any'})
                      {req.offeredRate ? ` - $${req.offeredRate}/day` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Request Details */}
            {selectedRequest && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IoDocumentTextOutline className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
                    Request Details
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Guest/Client:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Vehicle Needed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.vehicleMake || selectedRequest.vehicleType || 'Any'}
                    </span>
                  </div>
                  {selectedRequest.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dates:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.durationDays ? `${selectedRequest.durationDays} days` : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Daily Rate:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {selectedRequest.offeredRate ? `$${selectedRequest.offeredRate}/day` : 'Negotiable'}
                    </span>
                  </div>
                  {selectedRequest.offeredRate && selectedRequest.durationDays && (
                    <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Potential Earnings:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-base">
                        ${(selectedRequest.offeredRate * selectedRequest.durationDays).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.pickupCity || 'Phoenix'}, {selectedRequest.pickupState || 'AZ'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Result Message */}
            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {result.success ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
                )}
                {result.message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-none sm:rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedRequestId || submitting || result?.success === true}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {submitting ? (
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
              ) : (
                <IoSwapHorizontalOutline className="w-4 h-4" />
              )}
              {submitting ? 'Assigning...' : 'Assign & Send Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
