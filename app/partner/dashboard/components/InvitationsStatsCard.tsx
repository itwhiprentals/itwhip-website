// app/partner/dashboard/components/InvitationsStatsCard.tsx
// Displays invitation statistics — muted colors

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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('PartnerDashboard')

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
      setError(t('isFailedToLoad'))
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
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1 mx-auto"
          >
            <IoRefreshOutline className="w-4 h-4" />
            {t('isRetry')}
          </button>
        </div>
      </div>
    )
  }

  const sentStats = stats?.sent || { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0, counterOffered: 0 }
  const receivedStats = stats?.received || { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0, counterOffered: 0 }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoMailOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {t('isInvitations')}
        </h2>
        <button
          onClick={fetchStats}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title={t('isRefresh')}
        >
          <IoRefreshOutline className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sent Invitations */}
        <div
          className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => onViewInvitations?.('sent')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <IoSendOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('isSent')}</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{sentStats.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoTimeOutline className="w-3 h-3" />
              <span>{t('isPending', { count: sentStats.pending })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              <span>{t('isAccepted', { count: sentStats.accepted })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoCloseCircleOutline className="w-3 h-3" />
              <span>{t('isDeclined', { count: sentStats.declined })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoSwapHorizontalOutline className="w-3 h-3" />
              <span>{t('isNegotiating', { count: sentStats.counterOffered })}</span>
            </div>
          </div>
        </div>

        {/* Received Invitations */}
        <div
          className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => onViewInvitations?.('received')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <IoMailOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('isReceived')}</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{receivedStats.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoTimeOutline className="w-3 h-3" />
              <span>{t('isPending', { count: receivedStats.pending })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              <span>{t('isAccepted', { count: receivedStats.accepted })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoCloseCircleOutline className="w-3 h-3" />
              <span>{t('isDeclined', { count: receivedStats.declined })}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <IoSwapHorizontalOutline className="w-3 h-3" />
              <span>{t('isNegotiating', { count: receivedStats.counterOffered })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending notice */}
      {(sentStats.pending > 0 || receivedStats.pending > 0) && (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {receivedStats.pending > 0 && (
              <span className="font-medium">
                {t('isAwaitingResponse', { count: receivedStats.pending })}
              </span>
            )}
            {receivedStats.pending > 0 && sentStats.pending > 0 && ' \u2022 '}
            {sentStats.pending > 0 && (
              <span>
                {t('isSentPending', { count: sentStats.pending })}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
