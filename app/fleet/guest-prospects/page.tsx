// app/fleet/guest-prospects/page.tsx
// Fleet Admin - Guest Recruitment Pipeline

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoSearchOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoGiftOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSendOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoEyeOutline,
  IoWarningOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface GuestProspect {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
  source?: string
  creditAmount: number
  creditType: string
  creditNote?: string
  creditExpirationDays?: number
  inviteToken?: string
  inviteTokenExp?: string
  inviteSentAt?: string
  inviteResendCount: number
  emailOpenedAt?: string
  emailOpenCount: number
  linkClickedAt?: string
  linkClickCount: number
  status: string
  convertedAt?: string
  creditAppliedAt?: string
  createdAt: string
  isEmailKnown: boolean
  linkedTo?: string
  existingProfileId?: string
  convertedProfile?: {
    id: string
    name: string
    email: string
    stripeIdentityStatus?: string
    documentsVerified?: boolean
    creditBalance?: number
    bonusBalance?: number
  }
}

interface FunnelStats {
  total: number
  draft: number
  invited: number
  clicked: number
  converted: number
  expired: number
  last7DaysConverted: number
  conversionRate: number
  totalCreditsOffered: number
}

interface ExistingGuest {
  id: string
  name: string
  email: string
  phone?: string
  balances: {
    credit: number
    bonus: number
    deposit: number
    total: number
  }
  verification: {
    isIdentityVerified: boolean
    stripeStatus?: string
    documentsVerified?: boolean
  }
}

export default function GuestProspectsPage() {
  const [activeTab, setActiveTab] = useState<'invites' | 'existing'>('invites')
  const [prospects, setProspects] = useState<GuestProspect[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<FunnelStats>({
    total: 0,
    draft: 0,
    invited: 0,
    clicked: 0,
    converted: 0,
    expired: 0,
    last7DaysConverted: 0,
    conversionRate: 0,
    totalCreditsOffered: 0
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [resendingSecurityEmail, setResendingSecurityEmail] = useState<string | null>(null)

  // Existing guest search state
  const [existingSearch, setExistingSearch] = useState('')
  const [existingGuests, setExistingGuests] = useState<ExistingGuest[]>([])
  const [searchingExisting, setSearchingExisting] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<ExistingGuest | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter.toUpperCase())
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/fleet/guest-prospects?${params}`)
      const data = await response.json()

      if (data.success) {
        setProspects(data.prospects || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch guest prospects:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, searchTerm])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  // Search existing guests
  const searchExistingGuests = async () => {
    if (existingSearch.length < 2) {
      setExistingGuests([])
      return
    }

    setSearchingExisting(true)
    try {
      const response = await fetch(`/api/fleet/guests?key=phoenix-fleet-2847&search=${encodeURIComponent(existingSearch)}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setExistingGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Failed to search existing guests:', error)
    } finally {
      setSearchingExisting(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (existingSearch.length >= 2) {
        searchExistingGuests()
      } else {
        setExistingGuests([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [existingSearch])

  const sendInvite = async (prospectId: string) => {
    setSendingInvite(prospectId)
    try {
      const response = await fetch(`/api/fleet/guest-prospects/${prospectId}/invite`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        try {
          await navigator.clipboard.writeText(data.inviteLink)
          setCopiedLink(prospectId)
          setTimeout(() => setCopiedLink(null), 3000)
        } catch {
          console.log('Clipboard unavailable, invite link:', data.inviteLink)
        }
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

  const resendSecurityEmail = async (prospectId: string) => {
    setResendingSecurityEmail(prospectId)
    try {
      const response = await fetch(`/api/fleet/guest-prospects/${prospectId}/resend-security-email`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        alert('Security setup email sent successfully!')
      } else {
        alert(data.error || 'Failed to send security email')
      }
    } catch (error) {
      console.error('Failed to resend security email:', error)
      alert('Failed to send security email')
    } finally {
      setResendingSecurityEmail(null)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isTokenExpired = (exp?: string) => {
    if (!exp) return true
    return new Date(exp) < new Date()
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-600', text: 'Draft' },
      INVITED: { color: 'bg-blue-100 text-blue-600', text: 'Invited' },
      CLICKED: { color: 'bg-purple-100 text-purple-600', text: 'Clicked' },
      CONVERTED: { color: 'bg-green-100 text-green-600', text: 'Converted' },
      EXPIRED: { color: 'bg-red-100 text-red-600', text: 'Expired' }
    }
    const badge = badges[status] || badges.DRAFT
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const filteredProspects = prospects.filter(prospect => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        prospect.name.toLowerCase().includes(search) ||
        prospect.email.toLowerCase().includes(search) ||
        prospect.phone?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading guest prospects...</div>
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
              href="/fleet/requests"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guest Invitations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send credit invites to prospective guests
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Invite Guest</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Invited</p>
              <p className="text-xl font-bold text-blue-600">{stats.invited}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Clicked</p>
              <p className="text-xl font-bold text-purple-600">{stats.clicked}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Converted</p>
              <p className="text-xl font-bold text-green-600">{stats.converted}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Credits Offered</p>
              <p className="text-xl font-bold text-orange-600">${stats.totalCreditsOffered.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'invites'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <IoGiftOutline className="w-4 h-4 inline mr-2" />
              New Invites
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'existing'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <IoPersonOutline className="w-4 h-4 inline mr-2" />
              Existing Guests
            </button>
          </div>

          {/* Search and Filter - Only for Invites tab */}
          {activeTab === 'invites' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {['all', 'draft', 'invited', 'clicked', 'converted', 'expired'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === f
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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
          )}

          {/* Existing Guest Search - Only for Existing tab */}
          {activeTab === 'existing' && (
            <div className="mb-4">
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, or phone..."
                  value={existingSearch}
                  onChange={(e) => setExistingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {searchingExisting && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <IoRefreshOutline className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter at least 2 characters to search</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Existing Guests Tab */}
        {activeTab === 'existing' && (
          <div className="space-y-4">
            {existingSearch.length < 2 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                <IoSearchOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Search Existing Guests
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter an email, name, or phone number to find existing guests and manage their credits
                </p>
              </div>
            ) : existingGuests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                <IoPersonOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No guests found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No existing guests match "{existingSearch}"
                </p>
                <button
                  onClick={() => {
                    setActiveTab('invites')
                    setShowCreateModal(true)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <IoAddOutline className="w-5 h-5" />
                  Create New Invite Instead
                </button>
              </div>
            ) : (
              existingGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  {/* Header Row: Name + Action Button */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-base">
                      {guest.name || 'Unknown'}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedGuest(guest)
                        setShowCreditModal(true)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap"
                    >
                      <IoGiftOutline className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Manage Credits</span>
                      <span className="sm:hidden">Credits</span>
                    </button>
                  </div>

                  {/* Verification Badge */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {guest.verification?.isIdentityVerified ? (
                      <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <IoCheckmarkCircleOutline className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <IoLockClosedOutline className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1 truncate">
                      <IoMailOutline className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </span>
                    {guest.phone && (
                      <span className="flex items-center gap-1">
                        <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                        {guest.phone}
                      </span>
                    )}
                  </div>

                  {/* Balance display - Grid on mobile for better layout */}
                  <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-gray-400 dark:text-gray-500">Credit</p>
                      <p className="text-green-600 font-semibold">
                        ${guest.balances?.credit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 dark:text-gray-500">Bonus</p>
                      <p className="text-purple-600 font-semibold">
                        ${guest.balances?.bonus?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 dark:text-gray-500">Deposit</p>
                      <p className="text-blue-600 font-semibold">
                        ${guest.balances?.deposit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invites Tab - Prospects List */}
        {activeTab === 'invites' && filteredProspects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoGiftOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No guest invites found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by inviting a guest with credit incentive'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              Invite First Guest
            </button>
          </div>
        ) : activeTab === 'invites' ? (
          <div className="space-y-3">
            {filteredProspects.map((prospect) => (
              <div
                key={prospect.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                {/* Header Row: Name + Action Button */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-base">
                    {prospect.name}
                  </h3>

                  {/* Action Button - Always visible */}
                  <div className="flex-shrink-0">
                    {prospect.status !== 'CONVERTED' ? (
                      <button
                        onClick={() => sendInvite(prospect.id)}
                        disabled={sendingInvite === prospect.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          isTokenExpired(prospect.inviteTokenExp) && prospect.inviteSentAt
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        } disabled:opacity-50`}
                      >
                        {sendingInvite === prospect.id ? (
                          <IoRefreshOutline className="w-3.5 h-3.5 animate-spin" />
                        ) : copiedLink === prospect.id ? (
                          <IoCopyOutline className="w-3.5 h-3.5" />
                        ) : (
                          <IoMailOutline className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {sendingInvite === prospect.id
                            ? 'Sending...'
                            : copiedLink === prospect.id
                              ? 'Copied!'
                              : prospect.inviteSentAt
                                ? `Resend`
                                : 'Send'
                          }
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => resendSecurityEmail(prospect.id)}
                        disabled={resendingSecurityEmail === prospect.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 whitespace-nowrap"
                        title="Send email to set up password"
                      >
                        {resendingSecurityEmail === prospect.id ? (
                          <IoRefreshOutline className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <IoLockClosedOutline className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {resendingSecurityEmail === prospect.id ? 'Sending...' : 'Security'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {getStatusBadge(prospect.status)}
                  {prospect.isEmailKnown && (
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded font-medium">
                      Existing
                    </span>
                  )}
                  {prospect.creditAmount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                      <IoGiftOutline className="w-3 h-3" />
                      ${prospect.creditAmount.toFixed(0)}
                    </span>
                  )}
                  {prospect.creditAppliedAt && (
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                      <IoCheckmarkCircleOutline className="w-3 h-3" />
                      Applied
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1 truncate">
                    <IoMailOutline className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{prospect.email}</span>
                  </span>
                  {prospect.phone && (
                    <span className="flex items-center gap-1">
                      <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                      {prospect.phone}
                    </span>
                  )}
                </div>

                {/* Credit Note (if any) */}
                {prospect.creditNote && prospect.creditAmount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                    "{prospect.creditNote}"
                  </p>
                )}

                {/* Timeline - Stacked on mobile, inline on desktop */}
                {prospect.inviteSentAt && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Sent {formatDate(prospect.inviteSentAt)}</span>
                    {prospect.emailOpenedAt && (
                      <span className="text-blue-600">
                        Opened {formatDate(prospect.emailOpenedAt)} ({prospect.emailOpenCount}x)
                      </span>
                    )}
                    {prospect.linkClickedAt && (
                      <span className="text-purple-600">
                        Clicked {formatDate(prospect.linkClickedAt)}
                      </span>
                    )}
                    {prospect.convertedAt && (
                      <span className="text-green-600">
                        Converted {formatDate(prospect.convertedAt)}
                      </span>
                    )}
                  </div>
                )}

                {/* Verification status if converted */}
                {prospect.convertedProfile && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    {prospect.convertedProfile.stripeIdentityStatus === 'verified' || prospect.convertedProfile.documentsVerified ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                        Verified - Credits Unlocked
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <IoLockClosedOutline className="w-3.5 h-3.5" />
                        Pending Verification - Credits Locked
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateGuestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProspects()
          }}
        />
      )}

      {/* Credit Management Modal */}
      {showCreditModal && selectedGuest && (
        <CreditManagementModal
          guest={selectedGuest}
          onClose={() => {
            setShowCreditModal(false)
            setSelectedGuest(null)
          }}
          onSuccess={() => {
            setShowCreditModal(false)
            setSelectedGuest(null)
            searchExistingGuests()
          }}
        />
      )}
    </div>
  )
}

// Create Guest Modal
function CreateGuestModal({
  onClose,
  onSuccess
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    creditAmount: 250,
    creditType: 'credit',
    creditPurpose: 'guest_invite' as 'guest_invite' | 'booking_credit' | 'refund_credit',
    creditNote: '',
    creditExpirationDays: 90,
    sendImmediately: true,
    // Reference booking fields (for booking_credit)
    referenceVehicle: '',
    referenceId: '',
    referencePickupDate: '',
    referenceReturnDate: '',
    referenceLocation: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build reference booking object if this is a booking credit
      const referenceBooking = formData.creditPurpose === 'booking_credit' && formData.referenceId
        ? {
            vehicle: formData.referenceVehicle,
            referenceId: formData.referenceId,
            pickupDate: formData.referencePickupDate,
            returnDate: formData.referenceReturnDate,
            location: formData.referenceLocation
          }
        : null

      // Create the prospect
      const response = await fetch('/api/fleet/guest-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          creditAmount: formData.creditAmount,
          creditType: formData.creditType,
          creditPurpose: formData.creditPurpose,
          creditNote: formData.creditNote,
          creditExpirationDays: formData.creditExpirationDays || null,
          referenceBooking,
          sendInviteImmediately: false // We'll send separately if needed
        })
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.error || 'Failed to create guest invite')
        setLoading(false)
        return
      }

      // If send immediately, send the invite
      if (formData.sendImmediately && data.prospect?.id) {
        const inviteResponse = await fetch(`/api/fleet/guest-prospects/${data.prospect.id}/invite`, {
          method: 'POST'
        })
        const inviteData = await inviteResponse.json()

        if (!inviteData.success) {
          console.error('Failed to send invite:', inviteData.error)
          // Still consider it a success since prospect was created
        }
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to create guest invite:', error)
      alert('Failed to create guest invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col shadow-xl">
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3" />

          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Invite Guest
            </h2>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Credit Section */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <IoGiftOutline className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                  Credit Incentive
                </h3>
              </div>

              {/* Credit Purpose */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purpose
                </label>
                <select
                  value={formData.creditPurpose}
                  onChange={(e) => setFormData({
                    ...formData,
                    creditPurpose: e.target.value as 'guest_invite' | 'booking_credit' | 'refund_credit',
                    // Set default expiration based on purpose
                    creditExpirationDays: e.target.value === 'booking_credit' ? 7 : 90
                  })}
                  className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="guest_invite">New Guest Invite</option>
                  <option value="booking_credit">Booking Credit (previous booking resolution)</option>
                  <option value="refund_credit">Refund Credit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.creditAmount}
                      onChange={(e) => setFormData({ ...formData, creditAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.creditType}
                    onChange={(e) => setFormData({ ...formData, creditType: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="credit">Credit</option>
                    <option value="bonus">Bonus</option>
                    <option value="deposit">Deposit</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason (shown to guest)
                </label>
                <input
                  type="text"
                  value={formData.creditNote}
                  onChange={(e) => setFormData({ ...formData, creditNote: e.target.value })}
                  placeholder="Welcome bonus, Referral reward, etc."
                  className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires after (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.creditExpirationDays}
                  onChange={(e) => setFormData({ ...formData, creditExpirationDays: parseInt(e.target.value) || 0 })}
                  placeholder="90"
                  className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.creditPurpose === 'booking_credit'
                    ? 'Recommended: 7 days for booking credits'
                    : 'Leave empty for no expiration'}
                </p>
              </div>

              {/* Reference Booking Fields (for booking_credit) */}
              {formData.creditPurpose === 'booking_credit' && (
                <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-3">
                    Reference Booking Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Vehicle
                      </label>
                      <input
                        type="text"
                        value={formData.referenceVehicle}
                        onChange={(e) => setFormData({ ...formData, referenceVehicle: e.target.value })}
                        placeholder="e.g. 2017 Lamborghini Huracan"
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Reference ID
                      </label>
                      <input
                        type="text"
                        value={formData.referenceId}
                        onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                        placeholder="e.g. WM1742688059"
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Pickup Date
                        </label>
                        <input
                          type="text"
                          value={formData.referencePickupDate}
                          onChange={(e) => setFormData({ ...formData, referencePickupDate: e.target.value })}
                          placeholder="e.g. 4/5/2025"
                          className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Return Date
                        </label>
                        <input
                          type="text"
                          value={formData.referenceReturnDate}
                          onChange={(e) => setFormData({ ...formData, referenceReturnDate: e.target.value })}
                          placeholder="e.g. 4/6/2025"
                          className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.referenceLocation}
                        onChange={(e) => setFormData({ ...formData, referenceLocation: e.target.value })}
                        placeholder="e.g. Tempe, AZ"
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why we're inviting this guest..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
              />
            </div>

            {/* Send Options */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendImmediately"
                checked={formData.sendImmediately}
                onChange={(e) => setFormData({ ...formData, sendImmediately: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor="sendImmediately" className="text-sm text-gray-700 dark:text-gray-300">
                Send invite email immediately
              </label>
            </div>

            {/* Info box */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <IoWarningOutline className="w-4 h-4 inline mr-1" />
                Credits will be locked until the guest completes Stripe identity verification.
              </p>
            </div>
          </form>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                const form = document.querySelector('form') as HTMLFormElement
                if (form) form.requestSubmit()
              }}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : formData.sendImmediately ? 'Create & Send' : 'Create Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Credit Management Modal for Existing Guests
function CreditManagementModal({
  guest,
  onClose,
  onSuccess
}: {
  guest: ExistingGuest
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'add' | 'remove'>('add')
  const [formData, setFormData] = useState({
    amount: 0,
    type: 'credit' as 'credit' | 'bonus' | 'deposit',
    reason: '',
    expirationDays: 90
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      alert('Amount must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/fleet/guests/${guest.id}/credits?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formData.amount,
          type: formData.type,
          action,
          reason: formData.reason,
          expirationDays: action === 'add' ? formData.expirationDays : undefined
        })
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.error || 'Failed to update credits')
        setLoading(false)
        return
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to update credits:', error)
      alert('Failed to update credits')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col shadow-xl">
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3" />

          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Credits
            </h2>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Guest Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p className="font-medium text-gray-900 dark:text-white">{guest.name || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{guest.email}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="text-green-600">Credit: ${guest.balances?.credit?.toFixed(2) || '0.00'}</span>
                <span className="text-purple-600">Bonus: ${guest.balances?.bonus?.toFixed(2) || '0.00'}</span>
                <span className="text-blue-600">Deposit: ${guest.balances?.deposit?.toFixed(2) || '0.00'}</span>
              </div>
              {!guest.verification?.isIdentityVerified && (
                <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                  <IoLockClosedOutline className="w-3 h-3" />
                  Credits are locked until verified
                </div>
              )}
            </div>

            {/* Action Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAction('add')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action === 'add'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Add Credits
              </button>
              <button
                type="button"
                onClick={() => setAction('remove')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action === 'remove'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Remove Credits
              </button>
            </div>

            {/* Amount and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'bonus' | 'deposit' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="credit">Credit</option>
                  <option value="bonus">Bonus</option>
                  <option value="deposit">Deposit</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder={action === 'add' ? 'e.g. Referral bonus, Compensation' : 'e.g. Refund reversal, Error correction'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            {/* Expiration (only for add) */}
            {action === 'add' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires after (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.expirationDays}
                  onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) || 0 })}
                  placeholder="90"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Leave 0 for no expiration</p>
              </div>
            )}

            {/* Warning for remove */}
            {action === 'remove' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-800 dark:text-red-300">
                  <IoWarningOutline className="w-4 h-4 inline mr-1" />
                  This will immediately reduce the guest's balance. This action cannot be undone.
                </p>
              </div>
            )}
          </form>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                const form = e.currentTarget.closest('.flex-col')?.querySelector('form') as HTMLFormElement
                if (form) form.requestSubmit()
              }}
              disabled={loading || formData.amount <= 0}
              className={`px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                action === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : action === 'add' ? 'Add Credits' : 'Remove Credits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
