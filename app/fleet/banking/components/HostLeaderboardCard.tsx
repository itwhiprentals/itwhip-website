// app/fleet/banking/components/HostLeaderboardCard.tsx
// Shows top and bottom performing hosts for Host University coaching

'use client'

import { useState } from 'react'
import { formatCurrency, HostLeaderboardData, HostLeaderboardEntry } from '../types'

interface HostLeaderboardCardProps {
  data: HostLeaderboardData
}

const TIER_STYLES: Record<string, string> = {
  Diamond: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Platinum: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Gold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  Standard: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

function HostRow({ host, rank, showRank }: { host: HostLeaderboardEntry; rank: number; showRank: boolean }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
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

export function HostLeaderboardCard({ data }: HostLeaderboardCardProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top')

  const displayedHosts = activeTab === 'top' ? data.topHosts : data.bottomHosts

  return (
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
  )
}
