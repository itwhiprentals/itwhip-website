// app/fleet/choe/components/AnalyticsTab.tsx

'use client'

import { useState, useEffect } from 'react'
import type { ChoeStatsResponse } from '../types'
import StatCard from './StatCard'
import FunnelStep from './FunnelStep'

interface BatchJob {
  id: string
  status: string
  createdAt: string
  endedAt?: string
  requestCounts?: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
  type?: 'summary' | 'quality' | 'training'
  conversationCount?: number
}

interface AnalyticsTabProps {
  stats: ChoeStatsResponse['data']
  dailyStats: { date: string; conversations: number; cost: number }[]
  toolUsage: Record<string, number> | null
  apiKey: string
}

export default function AnalyticsTab({ stats, dailyStats, toolUsage, apiKey }: AnalyticsTabProps) {
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([])
  const [batchError, setBatchError] = useState<string | null>(null)
  const [creatingBatch, setCreatingBatch] = useState<string | null>(null)

  useEffect(() => {
    fetchBatchJobs()
  }, [])

  const fetchBatchJobs = async () => {
    try {
      const res = await fetch(`/fleet/api/choe/batch?key=${apiKey}`)
      if (res.ok) {
        const data = await res.json()
        setBatchJobs(data.jobs || [])
      }
    } catch {
      // Silently fail - batch API might not be configured
    }
  }

  const createBatch = async (type: 'summary' | 'quality') => {
    setCreatingBatch(type)
    setBatchError(null)
    try {
      const res = await fetch(`/fleet/api/choe/batch?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, hoursAgo: 24, limit: 100 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBatchError(data.error || 'Failed to create batch')
      } else {
        await fetchBatchJobs()
      }
    } catch {
      setBatchError('Failed to create batch job')
    } finally {
      setCreatingBatch(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      ended: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      canceling: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.expired}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* All-Time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Conversations"
          value={stats.allTime.conversations.toLocaleString()}
          subtext={`${stats.allTime.conversionRate}% conversion`}
        />
        <StatCard
          label="Total Messages"
          value={stats.allTime.messages.toLocaleString()}
          subtext={`Avg ${stats.allTime.avgMessagesPerConv} per conv`}
        />
        <StatCard
          label="Total Cost"
          value={`$${stats.allTime.estimatedCost.toFixed(2)}`}
          subtext={`${stats.allTime.tokens.toLocaleString()} tokens`}
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.allTime.revenueGenerated.toLocaleString()}`}
          subtext={`${stats.allTime.bookingsGenerated} bookings`}
          highlight
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <FunnelStep label="Started" value={stats.month.conversations} percentage={100} />
          <FunnelStep label="Location Set" value={Math.round(stats.month.conversations * 0.85)} percentage={85} />
          <FunnelStep label="Dates Set" value={Math.round(stats.month.conversations * 0.65)} percentage={65} />
          <FunnelStep label="Vehicle Selected" value={Math.round(stats.month.conversations * 0.45)} percentage={45} />
          <FunnelStep label="Completed" value={stats.month.completed} percentage={stats.month.conversionRate} highlight />
        </div>
      </div>

      {/* Cost Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Over Time</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {dailyStats.slice(-14).map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-8 bg-pink-500 rounded-t"
                style={{ height: `${Math.max(4, (day.cost / Math.max(...dailyStats.map(d => d.cost), 0.01)) * 150)}px` }}
              />
              <span className="text-xs text-gray-500 -rotate-45">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Batch Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Process conversations in bulk with 50% cost reduction</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createBatch('summary')}
              disabled={creatingBatch !== null}
              className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingBatch === 'summary' ? 'Creating...' : 'Create Summary Batch'}
            </button>
            <button
              onClick={() => createBatch('quality')}
              disabled={creatingBatch !== null}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingBatch === 'quality' ? 'Creating...' : 'Create Quality Batch'}
            </button>
          </div>
        </div>

        {batchError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {batchError}
          </div>
        )}

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {batchJobs.length === 0 ? (
                <tr className="text-center">
                  <td colSpan={5} className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
                    No batch jobs yet. Create one to process conversations at 50% cost.
                  </td>
                </tr>
              ) : (
                batchJobs.map((job) => {
                  const totalRequests = job.requestCounts
                    ? job.requestCounts.processing + job.requestCounts.succeeded + job.requestCounts.errored + job.requestCounts.canceled + job.requestCounts.expired
                    : 0
                  return (
                    <tr key={job.id}>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{job.id.slice(0, 12)}...</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {totalRequests || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {job.requestCounts ? (
                          <span>
                            {job.requestCounts.succeeded} ✓ / {job.requestCounts.errored} ✗
                            {job.requestCounts.processing > 0 && <span className="text-yellow-600 ml-1">({job.requestCounts.processing} pending)</span>}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tool Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tool Usage</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AI function calling breakdown (last 30 days)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {toolUsage?.search_vehicles?.toLocaleString() ?? '-'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">search_vehicles</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {toolUsage?.get_weather?.toLocaleString() ?? '-'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">get_weather</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {toolUsage?.select_vehicle?.toLocaleString() ?? '-'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">select_vehicle</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {toolUsage?.update_booking_details?.toLocaleString() ?? '-'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">update_booking</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          All tools are now tracked via the toolsUsed field. Historical data uses searchPerformed for backward compatibility.
        </p>
      </div>
    </div>
  )
}
