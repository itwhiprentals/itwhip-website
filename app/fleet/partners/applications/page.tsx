// app/fleet/partners/applications/page.tsx
// Fleet Partner Applications Queue - Review pending partner applications

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoBusinessOutline,
  IoTimeOutline,
  IoCarOutline,
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoChevronDownOutline,
  IoRefreshOutline,
  IoEyeOutline
} from 'react-icons/io5'

interface Application {
  id: string
  hostId: string
  companyName: string
  businessType: string
  yearsInBusiness: number
  contactName: string
  contactEmail: string
  contactPhone: string
  fleetSize: number
  vehicleTypes: string[]
  operatingCities: string[]
  status: string
  currentStep: number
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  createdAt: string
  host?: {
    id: string
    partnerSlug?: string
    partnerDocuments: {
      id: string
      type: string
      status: string
      url: string
    }[]
  }
}

export default function ApplicationsQueuePage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('SUBMITTED')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState({
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('status', filter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/fleet/partners/applications?${params}&key=${apiKey}`)
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!selectedApp) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/applications/${selectedApp.id}/${action}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: reviewNotes,
          reviewedBy: 'Fleet Admin' // TODO: Use actual admin ID
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowReviewModal(false)
        setSelectedApp(null)
        setReviewNotes('')
        fetchApplications()
      } else {
        alert(data.error || `Failed to ${action} application`)
      }
    } catch (error) {
      console.error(`Failed to ${action} application:`, error)
      alert(`Failed to ${action} application`)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'UNDER_REVIEW':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'APPROVED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'REJECTED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        app.companyName.toLowerCase().includes(search) ||
        app.contactEmail.toLowerCase().includes(search) ||
        app.contactName.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/fleet/partners?key=${apiKey}`}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Partner Applications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review and process fleet partner applications
              </p>
            </div>
            <button
              onClick={() => fetchApplications()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoRefreshOutline className="w-5 h-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setFilter('SUBMITTED')}
              className={`rounded-lg p-4 border transition-colors text-left ${
                filter === 'SUBMITTED'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-300'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.submitted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
            </button>
            <button
              onClick={() => setFilter('UNDER_REVIEW')}
              className={`rounded-lg p-4 border transition-colors text-left ${
                filter === 'UNDER_REVIEW'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.underReview}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">In Review</div>
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`rounded-lg p-4 border transition-colors text-left ${
                filter === 'APPROVED'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Approved</div>
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`rounded-lg p-4 border transition-colors text-left ${
                filter === 'REJECTED'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'
              }`}
            >
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rejected</div>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, contact name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading applications...</div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : `No ${filter.toLowerCase().replace('_', ' ')} applications`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Company Initial */}
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {app.companyName.charAt(0)}
                      </span>
                    </div>

                    {/* Application Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Company Name */}
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {app.companyName}
                      </h3>

                      {/* Status Badges - Own Row */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {app.businessType}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <IoMailOutline className="w-4 h-4" />
                          {app.contactEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoCallOutline className="w-4 h-4" />
                          {app.contactPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="w-4 h-4" />
                          {formatDate(app.submittedAt)}
                        </span>
                      </div>

                      {/* Business Details */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoCarOutline className="w-4 h-4" />
                          <span>{app.fleetSize} vehicles</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoLocationOutline className="w-4 h-4" />
                          <span>{app.operatingCities.slice(0, 2).join(', ')}{app.operatingCities.length > 2 ? ` +${app.operatingCities.length - 2}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoBusinessOutline className="w-4 h-4" />
                          <span>{app.yearsInBusiness} years in business</span>
                        </div>
                      </div>

                      {/* Vehicle Types */}
                      {app.vehicleTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.vehicleTypes.map((type, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Documents Status */}
                      {app.host?.partnerDocuments && app.host.partnerDocuments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <IoDocumentTextOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {app.host.partnerDocuments.length} documents uploaded
                          </span>
                          {app.host.partnerDocuments.some(d => d.status === 'PENDING') && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              ({app.host.partnerDocuments.filter(d => d.status === 'PENDING').length} pending review)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions - Stacked Vertically on Right */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      {app.status === 'SUBMITTED' && (
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setShowReviewModal(true)
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <IoCheckmarkCircleOutline className="w-4 h-4" />
                          Review
                        </button>
                      )}
                      <Link
                        href={`/fleet/partners/applications/${app.id}?key=${apiKey}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Review Notes (if any) */}
                {app.reviewNotes && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Review Notes:</span> {app.reviewNotes}
                    </p>
                    {app.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed {formatDate(app.reviewedAt)} {app.reviewedBy && `by ${app.reviewedBy}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Review Application
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedApp.companyName}
              </p>
            </div>

            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fleet Size</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApp.fleetSize} vehicles</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Years in Business</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApp.yearsInBusiness} years</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{selectedApp.contactName}</p>
                  <p>{selectedApp.contactEmail}</p>
                  <p>{selectedApp.contactPhone}</p>
                </div>
              </div>

              {/* Review Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes (optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Approving</strong> will activate this partner account and send them login credentials.
                  <strong> Rejecting</strong> will notify them of the decision with your notes.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedApp(null)
                  setReviewNotes('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview('reject')}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IoCloseCircleOutline className="w-5 h-5" />
                {processing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleReview('approve')}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
