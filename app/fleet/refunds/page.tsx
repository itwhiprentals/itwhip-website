'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface RefundRequest {
  id: string
  amount: number
  reason: string
  status: string
  requestedBy: string
  requestedByType: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  processedAt: string | null
  stripeRefundId: string | null
  notes: string | null
  createdAt: string
  booking: {
    id: string
    bookingCode: string
    guestName: string
    guestEmail: string
    totalAmount: number
    tripDates: { start: string; end: string }
    status: string
    hasPaymentIntent: boolean
    host: {
      id: string
      name: string
      email: string
      type: string
    }
    vehicle: {
      id: string
      display: string
      licensePlate: string
    } | null
  }
}

interface Summary {
  total: { count: number; amount: number }
  pending: { count: number; amount: number }
  approved: { count: number; amount: number }
  rejected: { count: number; amount: number }
  processed: { count: number; amount: number }
}

export default function FleetRefundsPage() {
  const searchParams = useSearchParams()
  const key = searchParams.get('key') || ''

  const [requests, setRequests] = useState<RefundRequest[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal state
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [key, filterStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const statusParam = filterStatus ? `&status=${filterStatus}` : ''
      const response = await fetch(`/api/fleet/refund-requests?key=${key}${statusParam}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch refund requests')
      }

      setRequests(data.data || [])
      setSummary(data.summary || null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest) return

    setActionLoading(selectedRequest.id)
    setError(null)
    setSuccessMessage(null)

    try {
      if (actionType === 'process') {
        // Process approved refund
        const response = await fetch(`/api/fleet/refund-requests/${selectedRequest.id}?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processedBy: 'FLEET_ADMIN'
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        setSuccessMessage(`Refund of $${selectedRequest.amount.toFixed(2)} processed successfully`)
      } else {
        // Approve or reject
        const response = await fetch(`/api/fleet/refund-requests/${selectedRequest.id}?key=${key}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: actionType,
            reviewNotes
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        setSuccessMessage(`Refund request ${actionType === 'approve' ? 'approved' : 'rejected'}`)
      }

      setShowActionModal(false)
      setSelectedRequest(null)
      setReviewNotes('')
      fetchRequests()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const openActionModal = (request: RefundRequest, action: 'approve' | 'reject' | 'process') => {
    setSelectedRequest(request)
    setActionType(action)
    setReviewNotes('')
    setShowActionModal(true)
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      PROCESSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Refund Requests
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review and process partner refund requests
              </p>
            </div>
            <Link
              href={`/fleet?key=${key}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Back to Fleet
            </Link>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total.count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(summary.total.amount)}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 shadow">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{summary.pending.count}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">{formatCurrency(summary.pending.amount)}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 shadow">
              <p className="text-sm text-blue-700 dark:text-blue-400">Approved</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{summary.approved.count}</p>
              <p className="text-sm text-blue-600 dark:text-blue-500">{formatCurrency(summary.approved.amount)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow">
              <p className="text-sm text-green-700 dark:text-green-400">Processed</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{summary.processed.count}</p>
              <p className="text-sm text-green-600 dark:text-green-500">{formatCurrency(summary.processed.amount)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 shadow">
              <p className="text-sm text-red-700 dark:text-red-400">Rejected</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{summary.rejected.count}</p>
              <p className="text-sm text-red-600 dark:text-red-500">{formatCurrency(summary.rejected.amount)}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PROCESSED">Processed</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No refund requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{request.booking.bookingCode}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{request.booking.vehicle?.display || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{request.booking.guestName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{request.booking.guestEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{request.booking.host?.name || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(request.amount)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">of {formatCurrency(request.booking.totalAmount)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openActionModal(request, 'approve')}
                                disabled={actionLoading === request.id}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal(request, 'reject')}
                                disabled={actionLoading === request.id}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'APPROVED' && (
                            <button
                              onClick={() => openActionModal(request, 'process')}
                              disabled={actionLoading === request.id || !request.booking.hasPaymentIntent}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              title={!request.booking.hasPaymentIntent ? 'No payment intent found' : 'Process refund via Stripe'}
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Process'}
                            </button>
                          )}
                          {(request.status === 'PROCESSED' || request.status === 'REJECTED') && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {request.status === 'PROCESSED' && request.stripeRefundId ? `Refund: ${request.stripeRefundId.slice(0, 12)}...` : 'Complete'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {actionType === 'approve' && 'Approve Refund Request'}
                {actionType === 'reject' && 'Reject Refund Request'}
                {actionType === 'process' && 'Process Refund'}
              </h3>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Booking</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.booking.bookingCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Guest</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Refund Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Original Payment</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRequest.booking.totalAmount)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Reason</p>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.reason}</p>
                </div>
              </div>

              {actionType !== 'process' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Review Notes {actionType === 'reject' && '(recommended)'}
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder={actionType === 'reject' ? 'Explain why this refund is being rejected...' : 'Optional notes...'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {actionType === 'process' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    This will process the refund of {formatCurrency(selectedRequest.amount)} via Stripe.
                    The transfer to the partner will also be reversed.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={!!actionLoading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                    actionType === 'approve' ? 'bg-blue-600 hover:bg-blue-700' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {actionLoading ? 'Processing...' : (
                    actionType === 'approve' ? 'Approve' :
                    actionType === 'reject' ? 'Reject' :
                    'Process Refund'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
