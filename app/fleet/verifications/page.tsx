// app/fleet/verifications/page.tsx
// Fleet ID Verification Queue — review guest DL/insurance uploads + AI & Stripe results
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IoIdCardOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoCheckmarkCircle,
  IoCloudDownloadOutline,
} from 'react-icons/io5'
import type { Verification, VerificationStats, FilterTab, StripeGuestProfile } from './types'
import { StatBox, VerificationCard, StripeGuestsList } from './components'

export default function FleetVerificationsPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [verifications, setVerifications] = useState<Verification[]>([])
  const [stripeGuests, setStripeGuests] = useState<StripeGuestProfile[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0, aiPassed: 0, stripeVerified: 0, stripeVerifiedProfiles: 0, totalStripeProfiles: 0, reviewedToday: 0, totalWithDocs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchVerifications = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        key: apiKey,
        filter,
        ...(search && { search }),
      })
      const res = await fetch(`/fleet/api/verifications?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setVerifications(data.verifications || [])
      setStripeGuests(data.stripeGuests || [])
      setStats(data.stats || { pending: 0, aiPassed: 0, stripeVerified: 0, stripeVerifiedProfiles: 0, totalStripeProfiles: 0, reviewedToday: 0, totalWithDocs: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [apiKey, filter, search])

  useEffect(() => {
    fetchVerifications()
    const interval = setInterval(fetchVerifications, 60000)
    return () => clearInterval(interval)
  }, [fetchVerifications])

  const handleAction = async (bookingId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/fleet/api/bookings?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action, notes }),
      })
      if (!res.ok) throw new Error('Action failed')
      await fetchVerifications()
      setExpandedId(null)
    } catch {
      setError('Failed to perform action')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSyncStripe = async () => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const res = await fetch(`/fleet/api/verifications/sync-stripe?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Sync failed')
      const data = await res.json()
      const parts: string[] = []
      if (data.synced > 0) parts.push(`${data.synced} profile${data.synced !== 1 ? 's' : ''} synced`)
      if (data.pendingChecked > 0) parts.push(`${data.pendingChecked} pending session${data.pendingChecked !== 1 ? 's' : ''} checked`)
      if (parts.length > 0) {
        setSyncMessage(parts.join(', '))
        await fetchVerifications()
      } else {
        setSyncMessage('All profiles already up to date')
      }
    } catch {
      setError('Failed to sync from Stripe')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const formatTimeAgo = (d: string | null) => {
    if (!d) return 'N/A'
    const hrs = (Date.now() - new Date(d).getTime()) / 3600000
    if (hrs < 1) return `${Math.floor(hrs * 60)}m ago`
    if (hrs < 24) return `${Math.floor(hrs)}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'ai_passed', label: 'AI Passed', count: stats.aiPassed },
    { id: 'stripe_verified', label: 'Stripe', count: stats.stripeVerifiedProfiles },
    { id: 'needs_review', label: 'Needs Review' },
    { id: 'reviewed', label: 'Reviewed', count: stats.reviewedToday },
    { id: 'all', label: 'All' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading verifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoIdCardOutline className="text-teal-600" />
            ID Verification Queue
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review guest documents — Claude AI + Stripe Identity
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchVerifications() }}
          disabled={refreshing}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <IoRefreshOutline className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <StatBox label="Pending Review" value={stats.pending} color="text-orange-600" />
        <StatBox label="AI Auto-Passed" value={stats.aiPassed} color="text-green-600" />
        <StatBox label="Stripe Verified" value={stats.stripeVerifiedProfiles} color="text-blue-600" />
        <StatBox label="Reviewed Today" value={stats.reviewedToday} color="text-purple-600" />
        <StatBox label="Total Submitted" value={stats.totalWithDocs} color="text-gray-600" />
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === t.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === t.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stripe Identity Guests List — shown when Stripe tab is active */}
      {filter === 'stripe_verified' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stripe Identity Verified Guests
            </h2>
            <button
              onClick={handleSyncStripe}
              disabled={syncing}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <IoCloudDownloadOutline className={`text-sm ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync from Stripe'}
            </button>
          </div>
          {syncMessage && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-400">
              {syncMessage}
            </div>
          )}
          <StripeGuestsList
            guests={stripeGuests}
            totalVerified={stats.stripeVerifiedProfiles}
            totalProfiles={stats.totalStripeProfiles}
          />
        </div>
      )}

      {/* Booking Verification list */}
      {verifications.length === 0 && filter !== 'stripe_verified' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <IoCheckmarkCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">All clear</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">No verifications matching this filter</p>
        </div>
      ) : verifications.length > 0 ? (
        <div className="space-y-3">
          {filter === 'stripe_verified' && verifications.length > 0 && (
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
              Bookings with Stripe-verified guests
            </h3>
          )}
          {verifications.map(v => (
            <VerificationCard
              key={v.id}
              v={v}
              expanded={expandedId === v.id}
              onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)}
              onApprove={() => handleAction(v.id, 'approve')}
              onReject={(notes) => handleAction(v.id, 'reject', notes)}
              actionLoading={actionLoading === v.id}
              formatDate={formatDate}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
