// app/fleet/insurance/providers/[id]/components/FnolActivityTab.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoSendOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoCloudUploadOutline,
  IoCloudDoneOutline,
  IoWarningOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface FnolSubmission {
  id: string
  claimId: string
  claimReference: string
  bookingCode: string
  submittedAt: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRY'
  responseCode: number | null
  responseMessage: string | null
  insurerClaimId: string | null
  retryCount: number
  submittedBy: string | null
  requestPayload: any
  responsePayload: any
  errorDetails: string | null
}

interface FnolActivityTabProps {
  providerId: string
}

export default function FnolActivityTab({ providerId }: FnolActivityTabProps) {
  const [submissions, setSubmissions] = useState<FnolSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<FnolSubmission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [providerId])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      // TODO: Create API endpoint to fetch FNOL submissions by provider
      // For now, we'll show empty state with mock data structure
      const response = await fetch(`/api/fleet/insurance/providers/${providerId}/fnol-activity?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else {
        setSubmissions([])
      }
    } catch (error) {
      console.error('Failed to fetch FNOL submissions:', error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
      case 'FAILED':
        return <IoCloseCircleOutline className="w-5 h-5 text-red-600" />
      case 'PENDING':
        return <IoTimeOutline className="w-5 h-5 text-yellow-600" />
      case 'RETRY':
        return <IoRefreshOutline className="w-5 h-5 text-blue-600" />
      default:
        return <IoAlertCircleOutline className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
            Success
          </span>
        )
      case 'FAILED':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full">
            Failed
          </span>
        )
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded-full">
            Pending
          </span>
        )
      case 'RETRY':
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
            Retry
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
            Unknown
          </span>
        )
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true
    return sub.status.toLowerCase() === filter
  })

  const stats = {
    total: submissions.length,
    success: submissions.filter(s => s.status === 'SUCCESS').length,
    failed: submissions.filter(s => s.status === 'FAILED').length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    successRate: submissions.length > 0 
      ? Math.round((submissions.filter(s => s.status === 'SUCCESS').length / submissions.length) * 100)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading FNOL activity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Success</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.success}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.successRate}%</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              First Notice of Loss (FNOL) Activity
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This timeline shows all automatic claim submissions to this insurance provider via API. 
              Each entry includes request/response data and submission status.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
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
            onClick={() => setFilter('success')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Success ({stats.success})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Failed ({stats.failed})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>
      </div>

      {/* FNOL Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <IoCloudUploadOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {submissions.length === 0 ? 'No FNOL Submissions Yet' : 'No Submissions Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {submissions.length === 0 
                ? 'Automatic FNOL submissions will appear here once claims are approved and sent to this provider.'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(submission.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          FNOL Submission
                        </h3>
                        {getStatusBadge(submission.status)}
                        {submission.retryCount > 0 && (
                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs rounded">
                            Retry #{submission.retryCount}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <span className="font-medium">Claim:</span>{' '}
                          <Link 
                            href={`/fleet/claims/${submission.claimId}?key=phoenix-fleet-2847`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {submission.claimReference}
                          </Link>
                        </p>
                        <p>
                          <span className="font-medium">Booking:</span> {submission.bookingCode}
                        </p>
                        {submission.insurerClaimId && (
                          <p>
                            <span className="font-medium">Insurer Claim ID:</span> {submission.insurerClaimId}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Submitted:</span>{' '}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        {submission.submittedBy && (
                          <p>
                            <span className="font-medium">By:</span> {submission.submittedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Details */}
                {submission.responseMessage && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    submission.status === 'SUCCESS'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : submission.status === 'FAILED'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    <p className="font-medium mb-1">
                      Response {submission.responseCode ? `(${submission.responseCode})` : ''}:
                    </p>
                    <p>{submission.responseMessage}</p>
                  </div>
                )}

                {/* Error Details */}
                {submission.errorDetails && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                          Error Details:
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                          {submission.errorDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <IoDocumentTextOutline className="w-4 h-4" />
                    <span>View Request/Response Data</span>
                  </button>
                  <Link
                    href={`/fleet/claims/${submission.claimId}?key=phoenix-fleet-2847`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center space-x-1"
                  >
                    <span>View Full Claim →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSubmission && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                FNOL Submission Details
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <IoCloseCircleOutline className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request Payload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Request Payload
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-900 dark:text-gray-100">
                  {JSON.stringify(selectedSubmission.requestPayload, null, 2)}
                </pre>
              </div>

              {/* Response Payload */}
              {selectedSubmission.responsePayload && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Response Payload
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-900 dark:text-gray-100">
                    {JSON.stringify(selectedSubmission.responsePayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}