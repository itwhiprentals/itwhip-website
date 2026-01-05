// app/partner/dashboard/components/InvitationsStatsCard.tsx
// Displays invitation statistics for Fleet Managers

'use client'

import { useState, useEffect } from 'react'
import {
  IoMailOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoSwapHorizontalOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface InvitationStats {
  sent: {
    total: number
    pending: number
    accepted: number
    declined: number
    expired: number
    counterOffered: number
  }
  received: {
    total: number
    pending: number
    accepted: number
    declined: number
    expired: number
    counterOffered: number
  }
}

interface InvitationsStatsCardProps {
  onViewInvitations?: (type: 'sent' | 'received') => void
}

export default function InvitationsStatsCard({ onViewInvitations }: InvitationsStatsCardProps) {
  const [stats, setStats] = useState<InvitationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/fleet-manager/invitations/stats', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invitation stats')
      }

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching invitation stats:', err)
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-2">{error}</p>
          <button
            onClick={fetchStats}
            className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1 mx-auto"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const sentStats = stats?.sent || { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0, counterOffered: 0 }
  const receivedStats = stats?.received || { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0, counterOffered: 0 }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoMailOutline className="w-5 h-5 text-purple-600" />
          Invitations
        </h2>
        <button
          onClick={fetchStats}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh"
        >
          <IoRefreshOutline className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sent Invitations */}
        <div
          className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-md transition-all"
          onClick={() => onViewInvitations?.('sent')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoSendOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-900 dark:text-purple-100">Sent</span>
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sentStats.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <IoTimeOutline className="w-3 h-3" />
              <span>{sentStats.pending} pending</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              <span>{sentStats.accepted} accepted</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <IoCloseCircleOutline className="w-3 h-3" />
              <span>{sentStats.declined} declined</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <IoSwapHorizontalOutline className="w-3 h-3" />
              <span>{sentStats.counterOffered} negotiating</span>
            </div>
          </div>
        </div>

        {/* Received Invitations */}
        <div
          className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-md transition-all"
          onClick={() => onViewInvitations?.('received')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoMailOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Received</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{receivedStats.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <IoTimeOutline className="w-3 h-3" />
              <span>{receivedStats.pending} pending</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              <span>{receivedStats.accepted} accepted</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <IoCloseCircleOutline className="w-3 h-3" />
              <span>{receivedStats.declined} declined</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <IoSwapHorizontalOutline className="w-3 h-3" />
              <span>{receivedStats.counterOffered} negotiating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      {sentStats.pending > 0 || receivedStats.pending > 0 ? (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {receivedStats.pending > 0 && (
              <span className="font-medium">
                {receivedStats.pending} invitation{receivedStats.pending > 1 ? 's' : ''} awaiting your response
              </span>
            )}
            {receivedStats.pending > 0 && sentStats.pending > 0 && ' • '}
            {sentStats.pending > 0 && (
              <span>
                {sentStats.pending} sent invitation{sentStats.pending > 1 ? 's' : ''} pending
              </span>
            )}
          </p>
        </div>
      ) : null}
    </div>
  )
}
