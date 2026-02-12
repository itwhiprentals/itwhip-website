// app/fleet/business/page.tsx
// Fleet Business Host Approvals — Review and manage business host applications

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoStorefrontOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoSearchOutline,
  IoArrowBackOutline,
  IoCarOutline,
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoEyeOutline,
} from 'react-icons/io5'

interface BusinessHost {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string
  partnerSlug: string | null
  logo: string | null
  taxId: string | null
  taxIdProvided: boolean
  isBusinessHost: boolean
  businessApprovalStatus: string
  businessSubmittedAt: string | null
  businessApprovedAt: string | null
  businessApprovedBy: string | null
  businessRejectedReason: string | null
  emailVerified: boolean
  phoneVerified: boolean
  approvalStatus: string
  enableRideshare: boolean
  enableRentals: boolean
  activeVehicleCount: number
  createdAt: string
}

interface Counts {
  pending: number
  approved: number
  rejected: number
}

export default function FleetBusinessPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [hosts, setHosts] = useState<BusinessHost[]>([])
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ hostId: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchHosts()
  }, [filter])

  const fetchHosts = async () => {
    try {
      const params = new URLSearchParams({ key: apiKey })
      if (filter !== 'all') params.set('status', filter)
      if (searchTerm) params.set('search', searchTerm)

      const res = await fetch(`/api/fleet/business-approvals?${params}`)
      const data = await res.json()
      if (data.success) {
        setHosts(data.hosts || [])
        setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch business hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (hostId: string, action: 'approve' | 'reject' | 'revoke', reason?: string) => {
    setActionLoading(hostId)
    setMessage(null)

    try {
      const res = await fetch(`/api/fleet/business-approvals?key=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, action, reason }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Business host ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revoked'} successfully.` })
        setRejectModal(null)
        setRejectReason('')
        fetchHosts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Action failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchHosts()
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><IoTimeOutline /> Pending</span>
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><IoCheckmarkCircleOutline /> Approved</span>
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><IoCloseCircleOutline /> Rejected</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">None</span>
    }
  }

  const total = counts.pending + counts.approved + counts.rejected

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/fleet?key=${apiKey}`}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <IoArrowBackOutline className="text-lg text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IoStorefrontOutline className="text-violet-600 dark:text-violet-400" />
              Business Approvals
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Review and manage business host landing page applications
            </p>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg border transition-colors text-left ${filter === 'all' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`p-4 rounded-lg border transition-colors text-left ${filter === 'PENDING' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{counts.pending}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</div>
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`p-4 rounded-lg border transition-colors text-left ${filter === 'APPROVED' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.approved}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approved</div>
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`p-4 rounded-lg border transition-colors text-left ${filter === 'REJECTED' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.rejected}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rejected</div>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by company name, email, slug..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          Search
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading business applications...</div>
      ) : hosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <IoStorefrontOutline className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No business applications yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Business host applications will appear here when hosts submit for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {hosts.map((host) => (
            <div key={host.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Logo + Basic Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {host.logo ? (
                      <img src={host.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IoStorefrontOutline className="text-2xl text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {host.companyName}
                      </h3>
                      {statusBadge(host.businessApprovalStatus)}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <IoMailOutline className="text-xs" />
                        {host.email}
                        {host.emailVerified && <IoShieldCheckmarkOutline className="text-green-500 text-xs" title="Email verified" />}
                      </span>
                      {host.phone && (
                        <span className="flex items-center gap-1">
                          <IoCallOutline className="text-xs" />
                          {host.phone}
                          {host.phoneVerified && <IoShieldCheckmarkOutline className="text-green-500 text-xs" title="Phone verified" />}
                        </span>
                      )}
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {host.partnerSlug && (
                        <span className="flex items-center gap-1">
                          <IoGlobeOutline />
                          /rideshare/{host.partnerSlug}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <IoCarOutline />
                        {host.activeVehicleCount} active vehicle{host.activeVehicleCount !== 1 ? 's' : ''}
                      </span>
                      {host.taxIdProvided && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <IoShieldCheckmarkOutline />
                          EIN provided
                        </span>
                      )}
                      {!host.taxIdProvided && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <IoWarningOutline />
                          No EIN
                        </span>
                      )}
                      <span>
                        Services: {[host.enableRideshare && 'Rideshare', host.enableRentals && 'Rentals'].filter(Boolean).join(', ') || 'None'}
                      </span>
                    </div>

                    {/* Submitted date */}
                    {host.businessSubmittedAt && (
                      <div className="mt-1.5 text-xs text-gray-400">
                        Submitted {new Date(host.businessSubmittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}

                    {/* Rejection reason */}
                    {host.businessApprovalStatus === 'REJECTED' && host.businessRejectedReason && (
                      <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-900/20 text-xs text-red-700 dark:text-red-400">
                        <strong>Rejection reason:</strong> {host.businessRejectedReason}
                      </div>
                    )}

                    {/* Approval info */}
                    {host.businessApprovalStatus === 'APPROVED' && host.businessApprovedAt && (
                      <div className="mt-1.5 text-xs text-green-600 dark:text-green-400">
                        Approved {new Date(host.businessApprovedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {host.businessApprovedBy && ` by ${host.businessApprovedBy}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 flex-shrink-0 lg:flex-col lg:items-end">
                  {/* Preview landing page */}
                  {host.partnerSlug && (
                    <a
                      href={`/rideshare/${host.partnerSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <IoEyeOutline />
                      Preview
                    </a>
                  )}

                  {/* Approve */}
                  {host.businessApprovalStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(host.id, 'approve')}
                        disabled={actionLoading === host.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <IoCheckmarkCircleOutline />
                        {actionLoading === host.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejectModal({ hostId: host.id, name: host.companyName })}
                        disabled={actionLoading === host.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <IoCloseCircleOutline />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Revoke for approved hosts */}
                  {host.businessApprovalStatus === 'APPROVED' && (
                    <button
                      onClick={() => {
                        if (confirm(`Revoke business status for ${host.companyName}? Their landing page will be unpublished.`)) {
                          handleAction(host.id, 'revoke')
                        }
                      }}
                      disabled={actionLoading === host.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}

                  {/* Re-review rejected hosts */}
                  {host.businessApprovalStatus === 'REJECTED' && (
                    <button
                      onClick={() => handleAction(host.id, 'approve')}
                      disabled={actionLoading === host.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <IoCheckmarkCircleOutline />
                      {actionLoading === host.id ? 'Processing...' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Reject Business Application
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Rejecting <strong>{rejectModal.name}</strong>. Provide a reason:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Missing business documentation, invalid EIN, insufficient fleet..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModal.hostId, 'reject', rejectReason)}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.hostId}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal.hostId ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
