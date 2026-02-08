// app/fleet/choe/components/OverviewTab.tsx

'use client'

import type { ChoeStatsResponse, ConversationSummary } from '../types'
import StatCard from './StatCard'
import OutcomeBadge from './OutcomeBadge'

interface AnthropicUsage {
  configured: boolean
  today: { tokens: number; cost: number; requests: number }
  week: { tokens: number; cost: number; requests: number }
  month: { tokens: number; cost: number; requests: number }
  cacheSavings: number
}

interface OverviewTabProps {
  stats: ChoeStatsResponse['data']
  dailyStats: { date: string; conversations: number; cost: number }[]
  conversations: ConversationSummary[]
  anthropicUsage: AnthropicUsage | null
}

export default function OverviewTab({ stats, dailyStats, conversations, anthropicUsage }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Conversations"
          value={stats.today.conversations}
          subtext={`${stats.today.conversionRate}% conversion`}
          trend={stats.today.conversations > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="This Week"
          value={stats.week.conversations}
          subtext={`${stats.week.completed} completed`}
        />
        <StatCard
          label="Today's Cost"
          value={`$${stats.today.estimatedCost.toFixed(4)}`}
          subtext={`${stats.today.tokens.toLocaleString()} tokens`}
        />
        <StatCard
          label="Revenue Attributed"
          value={`$${stats.week.revenueGenerated.toLocaleString()}`}
          subtext={`${stats.week.bookingsGenerated} bookings`}
          highlight
        />
      </div>

      {/* Anthropic Admin API Usage */}
      {anthropicUsage?.configured && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anthropic API Usage</h3>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
              Admin API Connected
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${anthropicUsage.today.cost.toFixed(4)}
              </p>
              <p className="text-xs text-gray-400">
                {anthropicUsage.today.tokens.toLocaleString()} tokens
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${anthropicUsage.week.cost.toFixed(4)}
              </p>
              <p className="text-xs text-gray-400">
                {anthropicUsage.week.requests} requests
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${anthropicUsage.month.cost.toFixed(4)}
              </p>
              <p className="text-xs text-gray-400">
                {anthropicUsage.month.tokens.toLocaleString()} tokens
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="text-xs text-purple-600 dark:text-purple-400">Cache Savings</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ${anthropicUsage.cacheSavings.toFixed(4)}
              </p>
              <p className="text-xs text-purple-400">~90% on cached</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Usage</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {dailyStats.slice(-7).map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-12 bg-purple-500 rounded-t"
                style={{ height: `${Math.max(8, (day.conversations / Math.max(...dailyStats.map(d => d.conversations), 1)) * 150)}px` }}
              />
              <span className="text-xs text-gray-500">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Conversations</h3>
        <div className="space-y-3">
          {conversations.slice(0, 5).map(conv => (
            <div key={conv.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${conv.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {conv.location || 'Unknown location'}
                  </p>
                  <p className="text-xs text-gray-500">{conv.messageCount} messages</p>
                </div>
              </div>
              <OutcomeBadge outcome={conv.outcome} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
