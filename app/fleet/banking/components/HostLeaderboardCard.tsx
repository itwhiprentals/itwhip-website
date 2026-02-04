// app/fleet/banking/components/HostLeaderboardCard.tsx
// Shows top and bottom performing hosts with clickable detail modal

'use client'

import { useState } from 'react'
import { formatCurrency, HostLeaderboardData, HostLeaderboardEntry } from '../types'

interface HostLeaderboardCardProps {
  data: HostLeaderboardData
}

interface HostDetailData {
  id: string
  name: string
  email: string
  phone?: string
  totalPayouts: number
  tripCount: number
  rating: number
  tier: string
  fleetSize: number
  stripeAccountId?: string | null
  stripeAccountStatus?: 'NOT_CONNECTED' | 'PENDING' | 'ACTIVE' | 'RESTRICTED'
  instantPayoutEnabled?: boolean
  payoutSchedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  lastPayoutDate?: string | null
  currentBalance?: number
  pendingBalance?: number
  holdBalance?: number
  negativeBalance?: number
}

const TIER_STYLES: Record<string, string> = {
  Diamond: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Platinum: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Gold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  Standard: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

const STRIPE_STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  ACTIVE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✓' },
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '⏳' },
  RESTRICTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '!' },
  NOT_CONNECTED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: '✗' }
}

function HostRow({
  host,
  rank,
  showRank,
  onClick
}: {
  host: HostLeaderboardEntry
  rank: number
  showRank: boolean
  onClick: () => void
}) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-2">
        {showRank && (
          <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
            rank <= 3
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {rank}
          </span>
        )}
      </td>
      <td className="py-3 px-2">
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {host.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {host.email}
          </p>
        </div>
      </td>
      <td className="py-3 px-2">
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TIER_STYLES[host.tier] || TIER_STYLES.Standard}`}>
          {host.tier}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {formatCurrency(host.totalPayouts)}
        </span>
      </td>
      <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {host.tripCount}
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">{host.rating.toFixed(1)}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {host.fleetSize}
      </td>
    </tr>
  )
}

function HostDetailModal({
  host,
  onClose
}: {
  host: HostDetailData | null
  onClose: () => void
}) {
  if (!host) return null

  const stripeStatus = host.stripeAccountStatus || 'NOT_CONNECTED'
  const statusStyle = STRIPE_STATUS_STYLES[stripeStatus] || STRIPE_STATUS_STYLES.NOT_CONNECTED

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Host Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {host.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{host.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{host.email}</p>
              {host.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{host.phone}</p>
              )}
            </div>
            <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${TIER_STYLES[host.tier] || TIER_STYLES.Standard}`}>
              {host.tier}
            </span>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(host.totalPayouts)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Payouts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {host.tripCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trips</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {host.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {host.fleetSize}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fleet</p>
            </div>
          </div>

          {/* Stripe Account Info */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Stripe Account</span>
              </div>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.icon} {stripeStatus.replace('_', ' ')}
                </span>
              </div>
              {host.stripeAccountId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {host.stripeAccountId.slice(0, 12)}...
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Instant Payout</span>
                <span className={`text-sm font-medium ${host.instantPayoutEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                  {host.instantPayoutEnabled ? '✓ Enabled' : 'Not Enabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Payout Schedule</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {host.payoutSchedule || 'Standard'}
                </span>
              </div>
              {host.lastPayoutDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Payout</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(host.lastPayoutDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">Available</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrency(host.currentBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(host.pendingBalance || 0)}
              </p>
            </div>
            {(host.holdBalance || 0) > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-xs text-orange-600 dark:text-orange-400">On Hold</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(host.holdBalance || 0)}
                </p>
              </div>
            )}
            {(host.negativeBalance || 0) > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">Negative</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(host.negativeBalance || 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={`/fleet/hosts/${host.id}`}
            className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium text-center"
          >
            View Full Profile
          </a>
          <a
            href={`/fleet/hosts/${host.id}/banking`}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center"
          >
            View Payouts
          </a>
        </div>
      </div>
    </div>
  )
}

export function HostLeaderboardCard({ data }: HostLeaderboardCardProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top')
  const [selectedHost, setSelectedHost] = useState<HostDetailData | null>(null)
  const [loading, setLoading] = useState(false)

  const displayedHosts = activeTab === 'top' ? data.topHosts : data.bottomHosts

  // Fetch full host details when clicked
  const handleHostClick = async (host: HostLeaderboardEntry) => {
    setLoading(true)
    try {
      const res = await fetch(`/fleet/api/banking/host/${host.id}?key=phoenix-fleet-2847`)
      if (res.ok) {
        const data = await res.json()
        setSelectedHost(data.host)
      } else {
        // Fallback to basic data if API fails
        setSelectedHost({
          ...host,
          stripeAccountStatus: 'NOT_CONNECTED'
        })
      }
    } catch (error) {
      console.error('Failed to fetch host details:', error)
      // Fallback
      setSelectedHost({
        ...host,
        stripeAccountStatus: 'NOT_CONNECTED'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Host Leaderboard
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data.totalHosts} hosts total
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Payout</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.averagePayout)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Median Payout</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.medianPayout)}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'top'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Top Performers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bottom')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bottom'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Needs Coaching
            </div>
          </button>
        </div>

        {/* Coaching Banner for Bottom Tab */}
        {activeTab === 'bottom' && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Host University Candidates
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  These hosts may benefit from coaching to improve their performance
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Click on a host to view details and Stripe info
        </p>

        {/* Host Table */}
        {displayedHosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No hosts to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium w-10">#</th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Host</th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Tier</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Payouts</th>
                  <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Trips</th>
                  <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Rating</th>
                  <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Fleet</th>
                </tr>
              </thead>
              <tbody>
                {displayedHosts.map((host, index) => (
                  <HostRow
                    key={host.id}
                    host={host}
                    rank={index + 1}
                    showRank={activeTab === 'top'}
                    onClick={() => handleHostClick(host)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export for Coaching
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {(selectedHost || loading) && (
        <HostDetailModal
          host={selectedHost}
          onClose={() => setSelectedHost(null)}
        />
      )}
    </>
  )
}
