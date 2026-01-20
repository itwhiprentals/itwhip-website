// app/fleet/prospects/page.tsx
// Fleet Admin - Host Recruitment Pipeline (Prospects)

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoSearchOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSendOutline,
  IoLinkOutline,
  IoEyeOutline,
  IoRefreshOutline,
  IoFunnelOutline,
  IoCopyOutline,
  IoLogoFacebook,
  IoGlobeOutline,
  IoDocumentTextOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoPencilOutline,
  IoTrashOutline
} from 'react-icons/io5'

interface HostProspect {
  id: string
  name: string
  email: string
  phone?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  source: string
  sourceUrl?: string
  conversationNotes?: string
  inviteToken?: string
  inviteTokenExp?: string
  inviteSentAt?: string
  status: string
  emailOpenedAt?: string
  linkClickedAt?: string
  convertedAt?: string
  inviteResendCount: number
  lastResendAt?: string
  request?: {
    id: string
    requestCode: string
    vehicleMake?: string
    vehicleType?: string
    guestName: string
  }
  convertedHost?: {
    id: string
    name: string
  }
  createdAt: string
}

interface FunnelStats {
  total: number
  draft: number
  emailSent: number
  emailOpened: number
  linkClicked: number
  converted: number
  expired: number
  last7DaysConverted: number
  conversionRate: number
}

export default function FleetProspectsPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'
  const requestIdFilter = searchParams.get('requestId')

  const [prospects, setProspects] = useState<HostProspect[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<FunnelStats>({
    total: 0,
    draft: 0,
    emailSent: 0,
    emailOpened: 0,
    linkClicked: 0,
    converted: 0,
    expired: 0,
    last7DaysConverted: 0,
    conversionRate: 0
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProspect, setEditingProspect] = useState<HostProspect | null>(null)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter.toUpperCase().replace(' ', '_'))
      if (searchTerm) params.append('search', searchTerm)
      if (requestIdFilter) params.append('requestId', requestIdFilter)

      const response = await fetch(`/api/fleet/prospects?${params}&key=${apiKey}`)
      const data = await response.json()

      if (data.success) {
        setProspects(data.prospects || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch prospects:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, searchTerm, requestIdFilter, apiKey])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  const sendInvite = async (prospectId: string) => {
    setSendingInvite(prospectId)
    try {
      const response = await fetch(`/api/fleet/prospects/${prospectId}/invite?key=${apiKey}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // Copy invite link to clipboard
        await navigator.clipboard.writeText(data.inviteLink)
        setCopiedLink(prospectId)
        setTimeout(() => setCopiedLink(null), 3000)

        // Refresh the list
        fetchProspects()
      } else {
        alert(data.error || 'Failed to send invite')
      }
    } catch (error) {
      console.error('Failed to send invite:', error)
      alert('Failed to send invite')
    } finally {
      setSendingInvite(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      case 'EMAIL_SENT':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'EMAIL_OPENED':
        return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
      case 'LINK_CLICKED':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
      case 'CONVERTED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'EXPIRED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'FACEBOOK_MARKETPLACE':
        return <IoLogoFacebook className="w-4 h-4 text-blue-600" />
      case 'CRAIGSLIST':
        return <IoGlobeOutline className="w-4 h-4 text-purple-600" />
      case 'REFERRAL':
        return <IoPersonOutline className="w-4 h-4 text-green-600" />
      default:
        return <IoGlobeOutline className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isTokenExpired = (expDate?: string) => {
    if (!expDate) return true
    return new Date() > new Date(expDate)
  }

  const filteredProspects = prospects.filter(prospect => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        prospect.name.toLowerCase().includes(search) ||
        prospect.email.toLowerCase().includes(search) ||
        prospect.vehicleMake?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading prospects...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/fleet/requests?key=${apiKey}`}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Host Recruitment Pipeline
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {requestIdFilter ? 'Prospects for this request' : 'Manage prospective hosts from FB Marketplace'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Add Prospect</span>
            </button>
          </div>

          {/* Funnel Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <IoFunnelOutline className="w-5 h-5 text-orange-600" />
              <h2 className="font-medium text-gray-900 dark:text-white">Conversion Funnel</h2>
              {stats.conversionRate > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400 ml-auto">
                  {stats.conversionRate.toFixed(1)}% conversion rate
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { label: 'Total', value: stats.total, color: 'bg-gray-200 dark:bg-gray-700' },
                { label: 'Draft', value: stats.draft, color: 'bg-gray-300 dark:bg-gray-600' },
                { label: 'Sent', value: stats.emailSent, color: 'bg-blue-200 dark:bg-blue-900/50' },
                { label: 'Opened', value: stats.emailOpened, color: 'bg-purple-200 dark:bg-purple-900/50' },
                { label: 'Clicked', value: stats.linkClicked, color: 'bg-orange-200 dark:bg-orange-900/50' },
                { label: 'Converted', value: stats.converted, color: 'bg-green-200 dark:bg-green-900/50' }
              ].map((stat, index) => (
                <div key={stat.label} className="flex items-center">
                  <div className={`px-4 py-2 ${stat.color} rounded-lg text-center min-w-[80px]`}>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                  {index < 5 && (
                    <IoTrendingUpOutline className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            {stats.last7DaysConverted > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 inline mr-1 text-green-600" />
                {stats.last7DaysConverted} converted in the last 7 days
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'draft', 'email_sent', 'link_clicked', 'converted', 'expired'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <button
              onClick={fetchProspects}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <IoRefreshOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Prospects List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredProspects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoPersonOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No prospects found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start recruiting hosts from Facebook Marketplace'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              Add First Prospect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProspects.map((prospect) => {
              const tokenExpired = isTokenExpired(prospect.inviteTokenExp)
              const canSendInvite = prospect.status !== 'CONVERTED' && (
                prospect.status === 'DRAFT' ||
                prospect.status === 'EXPIRED' ||
                tokenExpired
              )

              return (
                <div
                  key={prospect.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {prospect.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {prospect.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(prospect.status)}`}>
                          {prospect.status.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          {getSourceIcon(prospect.source)}
                          {prospect.source.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-1">
                          <IoMailOutline className="w-4 h-4" />
                          {prospect.email}
                        </span>
                        {prospect.phone && (
                          <span className="flex items-center gap-1">
                            <IoCallOutline className="w-4 h-4" />
                            {prospect.phone}
                          </span>
                        )}
                        {prospect.vehicleMake && (
                          <span className="flex items-center gap-1">
                            <IoCarOutline className="w-4 h-4" />
                            {prospect.vehicleYear} {prospect.vehicleMake} {prospect.vehicleModel}
                          </span>
                        )}
                      </div>

                      {/* Request Link */}
                      {prospect.request && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded text-xs text-orange-700 dark:text-orange-300 mb-2">
                          <IoDocumentTextOutline className="w-3 h-3" />
                          Linked to request: {prospect.request.vehicleMake || prospect.request.vehicleType} for {prospect.request.guestName}
                        </div>
                      )}

                      {/* Invite Status */}
                      {prospect.inviteSentAt && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <IoSendOutline className="w-3 h-3" />
                            Sent: {formatDate(prospect.inviteSentAt)}
                            {prospect.inviteResendCount > 1 && ` (${prospect.inviteResendCount}x)`}
                          </span>
                          {prospect.emailOpenedAt && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <IoEyeOutline className="w-3 h-3" />
                              Opened: {formatDate(prospect.emailOpenedAt)}
                            </span>
                          )}
                          {prospect.linkClickedAt && (
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <IoLinkOutline className="w-3 h-3" />
                              Clicked: {formatDate(prospect.linkClickedAt)}
                            </span>
                          )}
                          {prospect.convertedAt && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <IoCheckmarkCircleOutline className="w-3 h-3" />
                              Converted: {formatDate(prospect.convertedAt)}
                            </span>
                          )}
                          {prospect.inviteTokenExp && !prospect.convertedAt && (
                            <span className={`flex items-center gap-1 ${tokenExpired ? 'text-red-600 dark:text-red-400' : ''}`}>
                              <IoTimeOutline className="w-3 h-3" />
                              {tokenExpired ? 'Link expired' : `Expires: ${formatDate(prospect.inviteTokenExp)}`}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes Preview */}
                      {prospect.conversationNotes && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                          Notes: {prospect.conversationNotes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {prospect.status === 'CONVERTED' ? (
                        <Link
                          href={`/fleet/hosts/${prospect.convertedHost?.id}?key=${apiKey}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                        >
                          <IoCheckmarkCircleOutline className="w-4 h-4" />
                          View Host
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => sendInvite(prospect.id)}
                            disabled={sendingInvite === prospect.id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                              canSendInvite
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {sendingInvite === prospect.id ? (
                              <>
                                <IoRefreshOutline className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : copiedLink === prospect.id ? (
                              <>
                                <IoCheckmarkCircleOutline className="w-4 h-4" />
                                Link Copied!
                              </>
                            ) : (
                              <>
                                <IoSendOutline className="w-4 h-4" />
                                {prospect.inviteSentAt ? 'Resend' : 'Send'} Invite
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setEditingProspect(prospect)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <IoPencilOutline className="w-4 h-4" />
                            Edit
                          </button>
                          {prospect.sourceUrl && (
                            <a
                              href={prospect.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            >
                              <IoLogoFacebook className="w-4 h-4" />
                              View Post
                            </a>
                          )}
                        </>
                      )}
                      <span className="text-xs text-gray-400 text-right">
                        Added {formatDate(prospect.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Prospect Modal */}
      {showCreateModal && (
        <CreateProspectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProspects()
          }}
          apiKey={apiKey}
          requestId={requestIdFilter || undefined}
        />
      )}

      {/* Edit Prospect Modal */}
      {editingProspect && (
        <EditProspectModal
          prospect={editingProspect}
          onClose={() => setEditingProspect(null)}
          onSuccess={() => {
            setEditingProspect(null)
            fetchProspects()
          }}
          apiKey={apiKey}
        />
      )}
    </div>
  )
}

// Request details for displaying in modal
interface LinkedRequest {
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

// Create Prospect Modal Component
function CreateProspectModal({
  onClose,
  onSuccess,
  apiKey,
  requestId: initialRequestId
}: {
  onClose: () => void
  onSuccess: () => void
  apiKey: string
  requestId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [linkedRequest, setLinkedRequest] = useState<LinkedRequest | null>(null)
  const [loadingRequest, setLoadingRequest] = useState(false)
  const [availableRequests, setAvailableRequests] = useState<LinkedRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequestId || '')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    source: 'FACEBOOK_MARKETPLACE',
    sourceUrl: '',
    conversationNotes: '',
    requestId: initialRequestId || ''
  })

  // Fetch all available open requests for dropdown
  useEffect(() => {
    fetchAvailableRequests()
  }, [])

  // Fetch linked request details when selection changes
  useEffect(() => {
    if (selectedRequestId) {
      fetchRequestDetails(selectedRequestId)
      setFormData(prev => ({ ...prev, requestId: selectedRequestId }))
    } else {
      setLinkedRequest(null)
      setFormData(prev => ({ ...prev, requestId: '' }))
    }
  }, [selectedRequestId])

  const fetchAvailableRequests = async () => {
    setLoadingRequests(true)
    try {
      const response = await fetch(`/api/fleet/requests?status=OPEN&key=${apiKey}`)
      const data = await response.json()
      if (data.success && data.requests) {
        setAvailableRequests(data.requests)
        // If we have an initial requestId, make sure it's selected
        if (initialRequestId) {
          const found = data.requests.find((r: LinkedRequest) => r.id === initialRequestId)
          if (found) {
            setLinkedRequest(found)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch available requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const fetchRequestDetails = async (reqId: string) => {
    if (!reqId) return
    setLoadingRequest(true)
    try {
      const response = await fetch(`/api/fleet/requests/${reqId}?key=${apiKey}`)
      const data = await response.json()
      if (data.success && data.request) {
        setLinkedRequest(data.request)
      }
    } catch (error) {
      console.error('Failed to fetch request details:', error)
    } finally {
      setLoadingRequest(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/fleet/prospects?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleYear: formData.vehicleYear ? Number(formData.vehicleYear) : undefined,
          requestId: formData.requestId || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to create prospect')
      }
    } catch (error) {
      console.error('Failed to create prospect:', error)
      alert('Failed to create prospect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Prospect
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Link to Request Section */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <IoDocumentTextOutline className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                Link to Client Request
              </h3>
              <span className="text-xs text-orange-600 dark:text-orange-400 ml-auto">
                Details included in invite email
              </span>
            </div>

            {/* Request Selector Dropdown */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Request *
              </label>
              {loadingRequests ? (
                <div className="animate-pulse h-10 bg-orange-200 dark:bg-orange-800 rounded" />
              ) : (
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">-- Select a request --</option>
                  {availableRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.requestCode} - {req.guestName} ({req.vehicleMake || req.vehicleType || 'Any vehicle'})
                      {req.offeredRate ? ` - $${req.offeredRate}/day` : ''}
                    </option>
                  ))}
                </select>
              )}
              {availableRequests.length === 0 && !loadingRequests && (
                <p className="text-xs text-red-600 mt-1">
                  No open requests available. <Link href={`/fleet/requests?key=${apiKey}`} className="underline">Create one first</Link>.
                </p>
              )}
            </div>

            {/* Selected Request Details */}
            {loadingRequest ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-3/4" />
                <div className="h-4 bg-orange-200 dark:bg-orange-800 rounded w-1/2" />
              </div>
            ) : linkedRequest ? (
              <div className="space-y-2 text-sm border-t border-orange-200 dark:border-orange-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Guest/Client:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{linkedRequest.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vehicle Needed:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {linkedRequest.vehicleMake || linkedRequest.vehicleType || 'Any'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dates:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(linkedRequest.startDate)} - {formatDate(linkedRequest.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {linkedRequest.durationDays ? `${linkedRequest.durationDays} days` : 'Flexible'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Rate:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {linkedRequest.offeredRate ? `$${linkedRequest.offeredRate}/day` : 'Negotiable'}
                  </span>
                </div>
                {linkedRequest.offeredRate && linkedRequest.durationDays && (
                  <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Potential Earnings:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-base">
                      ${(linkedRequest.offeredRate * linkedRequest.durationDays).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {linkedRequest.pickupCity || 'Phoenix'}, {linkedRequest.pickupState || 'AZ'}
                  </span>
                </div>
              </div>
            ) : selectedRequestId ? (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Loading request details...
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Select a request above to see details that will be sent to the host
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="FACEBOOK_MARKETPLACE">Facebook Marketplace</option>
                <option value="CRAIGSLIST">Craigslist</option>
                <option value="OFFERUP">OfferUp</option>
                <option value="REFERRAL">Referral</option>
                <option value="COLD_OUTREACH">Cold Outreach</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                placeholder="Honda"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="Accord"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                placeholder="2020"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Listing URL
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://facebook.com/marketplace/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to their FB Marketplace listing or post
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conversation Notes
            </label>
            <textarea
              rows={3}
              value={formData.conversationNotes}
              onChange={(e) => setFormData({ ...formData, conversationNotes: e.target.value })}
              placeholder="Notes from your conversation..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Prospect Modal Component
function EditProspectModal({
  prospect,
  onClose,
  onSuccess,
  apiKey
}: {
  prospect: HostProspect
  onClose: () => void
  onSuccess: () => void
  apiKey: string
}) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: prospect.name,
    email: prospect.email,
    phone: prospect.phone || '',
    vehicleMake: prospect.vehicleMake || '',
    vehicleModel: prospect.vehicleModel || '',
    vehicleYear: prospect.vehicleYear?.toString() || '',
    source: prospect.source,
    sourceUrl: prospect.sourceUrl || '',
    conversationNotes: prospect.conversationNotes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/fleet/prospects/${prospect.id}?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleYear: formData.vehicleYear ? Number(formData.vehicleYear) : undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to update prospect')
      }
    } catch (error) {
      console.error('Failed to update prospect:', error)
      alert('Failed to update prospect')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this prospect? This cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/fleet/prospects/${prospect.id}?key=${apiKey}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to archive prospect')
      }
    } catch (error) {
      console.error('Failed to archive prospect:', error)
      alert('Failed to archive prospect')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Prospect
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="FACEBOOK_MARKETPLACE">Facebook Marketplace</option>
                <option value="CRAIGSLIST">Craigslist</option>
                <option value="OFFERUP">OfferUp</option>
                <option value="REFERRAL">Referral</option>
                <option value="COLD_OUTREACH">Cold Outreach</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                placeholder="Honda"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="Accord"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                placeholder="2020"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Listing URL
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://facebook.com/marketplace/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conversation Notes
            </label>
            <textarea
              rows={3}
              value={formData.conversationNotes}
              onChange={(e) => setFormData({ ...formData, conversationNotes: e.target.value })}
              placeholder="Notes from your conversation..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <IoTrashOutline className="w-4 h-4" />
              {deleting ? 'Archiving...' : 'Archive'}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
