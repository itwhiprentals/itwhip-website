// app/fleet/choe/page.tsx
// Choé AI Fleet Admin Dashboard

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  IoStatsChartOutline,
  IoChatbubblesOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoRefreshOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarningOutline,
  IoSparkles,
} from 'react-icons/io5'
import { CHOE_TABS, CHOE_COLORS, OUTCOME_COLORS, SEVERITY_COLORS, MODEL_OPTIONS, DEFAULT_SETTINGS } from './constants'
import type { ChoeStatsResponse, ChoeConversationListResponse, ChoeSecurityResponse, ConversationSummary, SecurityEventSummary, ChoeAISettings } from './types'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChoeAdminPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || ''

  const [activeTab, setActiveTab] = useState<string>('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<ChoeStatsResponse['data'] | null>(null)
  const [liveMetrics, setLiveMetrics] = useState<ChoeStatsResponse['liveMetrics'] | null>(null)
  const [dailyStats, setDailyStats] = useState<{ date: string; conversations: number; cost: number }[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [conversationsPagination, setConversationsPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [settings, setSettings] = useState<ChoeAISettings | null>(null)
  const [securityEvents, setSecurityEvents] = useState<SecurityEventSummary[]>([])
  const [securityStats, setSecurityStats] = useState<ChoeSecurityResponse['stats'] | null>(null)
  const [toolUsage, setToolUsage] = useState<Record<string, number> | null>(null)

  // Settings edit state
  const [editingSettings, setEditingSettings] = useState<Partial<ChoeAISettings>>({})
  const [savingSettings, setSavingSettings] = useState(false)

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      // Fetch based on active tab
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const res = await fetch(`/fleet/api/choe/stats?key=${apiKey}`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data.data)
        setLiveMetrics(data.liveMetrics)
        setDailyStats(data.dailyStats || [])
        setToolUsage(data.toolUsage || null)
      }

      if (activeTab === 'conversations') {
        const res = await fetch(`/fleet/api/choe/conversations?key=${apiKey}&page=${conversationsPagination.page}&limit=20`)
        if (!res.ok) throw new Error('Failed to fetch conversations')
        const data: ChoeConversationListResponse = await res.json()
        setConversations(data.data)
        setConversationsPagination(data.pagination)
      }

      if (activeTab === 'settings') {
        const res = await fetch(`/fleet/api/choe?key=${apiKey}`)
        if (!res.ok) throw new Error('Failed to fetch settings')
        const data = await res.json()
        setSettings(data.settings)
        setEditingSettings({})
      }

      if (activeTab === 'security') {
        const res = await fetch(`/fleet/api/choe/security?key=${apiKey}&limit=25`)
        if (!res.ok) throw new Error('Failed to fetch security events')
        const data: ChoeSecurityResponse = await res.json()
        setSecurityEvents(data.data)
        setSecurityStats(data.stats)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [apiKey, activeTab, conversationsPagination.page])

  useEffect(() => {
    if (apiKey) {
      fetchData()
    }
  }, [apiKey, activeTab, fetchData])

  // =============================================================================
  // SETTINGS HANDLERS
  // =============================================================================

  const handleSettingChange = (key: keyof ChoeAISettings, value: unknown) => {
    setEditingSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    if (!settings || Object.keys(editingSettings).length === 0) return

    setSavingSettings(true)
    try {
      const res = await fetch(`/fleet/api/choe?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingSettings, updatedBy: 'fleet-admin' }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save settings')
      }

      const data = await res.json()
      setSettings(data.settings)
      setEditingSettings({})
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Missing API key</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${CHOE_COLORS.primary.gradient} rounded-lg p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/choe-logo.png"
              alt="Choé"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Choé AI Admin
                <IoSparkles className="text-yellow-300" />
              </h1>
              <p className="text-purple-200 text-sm">choe.cloud Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <IoRefreshOutline className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Live Metrics Bar */}
        {liveMetrics && (
          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>{liveMetrics.activeSessions} active</span>
            </div>
            <div>
              <span className="text-purple-200">Last hour:</span> {liveMetrics.messagesLastHour} messages
            </div>
            <div>
              <span className="text-purple-200">Today&apos;s cost:</span> ${liveMetrics.currentCostToday.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 -mb-px overflow-x-auto">
          {CHOE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.id === 'overview' && <IoStatsChartOutline />}
              {tab.id === 'conversations' && <IoChatbubblesOutline />}
              {tab.id === 'settings' && <IoSettingsOutline />}
              {tab.id === 'security' && <IoShieldCheckmarkOutline />}
              {tab.id === 'analytics' && <IoAnalyticsOutline />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {activeTab === 'overview' && stats && (
            <OverviewTab stats={stats} dailyStats={dailyStats} conversations={conversations} />
          )}

          {activeTab === 'conversations' && (
            <ConversationsTab
              conversations={conversations}
              pagination={conversationsPagination}
              onPageChange={(page) => setConversationsPagination(prev => ({ ...prev, page }))}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'settings' && settings && (
            <SettingsTab
              settings={settings}
              editingSettings={editingSettings}
              onChange={handleSettingChange}
              onSave={handleSaveSettings}
              saving={savingSettings}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab events={securityEvents} stats={securityStats} />
          )}

          {activeTab === 'analytics' && stats && (
            <AnalyticsTab stats={stats} dailyStats={dailyStats} />
          )}
        </>
      )}
    </div>
  )
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  stats,
  dailyStats,
  conversations,
}: {
  stats: ChoeStatsResponse['data']
  dailyStats: { date: string; conversations: number; cost: number }[]
  conversations: ConversationSummary[]
}) {
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

// =============================================================================
// CONVERSATIONS TAB
// =============================================================================

function ConversationsTab({
  conversations,
  pagination,
  onPageChange,
  apiKey,
}: {
  conversations: ConversationSummary[]
  pagination: { page: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
  apiKey: string
}) {
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [convDetail, setConvDetail] = useState<ConversationSummary & { messages?: unknown[] } | null>(null)

  const loadConvDetail = async (id: string) => {
    setSelectedConv(id)
    const res = await fetch(`/fleet/api/choe/conversations/${id}?key=${apiKey}`)
    if (res.ok) {
      const data = await res.json()
      setConvDetail(data.data)
    }
  }

  return (
    <div className="space-y-4">
      {/* Conversations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map(conv => (
              <tr
                key={conv.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => loadConvDetail(conv.id)}
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${conv.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {conv.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {conv.location || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {conv.messageCount}
                </td>
                <td className="px-4 py-3">
                  <OutcomeBadge outcome={conv.outcome} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(conv.startedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {conversations.length} of {pagination.total} conversations
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConv && convDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedConv(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Details</h3>
              <p className="text-sm text-gray-500">Session: {convDetail.sessionId}</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Outcome</dt>
                  <dd><OutcomeBadge outcome={convDetail.outcome} /></dd>
                </div>
                <div>
                  <dt className="text-gray-500">Messages</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.messageCount}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tokens</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.totalTokens.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Cost</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">${convDetail.estimatedCost.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Duration</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{Math.round(convDetail.duration / 60)} min</dd>
                </div>
              </dl>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedConv(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  settings,
  editingSettings,
  onChange,
  onSave,
  saving,
}: {
  settings: ChoeAISettings
  editingSettings: Partial<ChoeAISettings>
  onChange: (key: keyof ChoeAISettings, value: unknown) => void
  onSave: () => void
  saving: boolean
}) {
  const getValue = <K extends keyof ChoeAISettings>(key: K): ChoeAISettings[K] => {
    return key in editingSettings ? editingSettings[key] as ChoeAISettings[K] : settings[key]
  }

  const hasChanges = Object.keys(editingSettings).length > 0

  return (
    <div className="space-y-6">
      {/* Model Settings */}
      <SettingsSection title="Model Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
            <select
              value={getValue('modelId')}
              onChange={e => onChange('modelId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
            <input
              type="number"
              value={getValue('maxTokens')}
              onChange={e => onChange('maxTokens', parseInt(e.target.value))}
              min={256}
              max={4096}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperature</label>
            <input
              type="number"
              step={0.1}
              value={getValue('temperature')}
              onChange={e => onChange('temperature', parseFloat(e.target.value))}
              min={0}
              max={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Rate Limits */}
      <SettingsSection title="Rate Limits">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Messages per Window</label>
            <input
              type="number"
              value={getValue('messagesPerWindow')}
              onChange={e => onChange('messagesPerWindow', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Window (minutes)</label>
            <input
              type="number"
              value={getValue('rateLimitWindowMins')}
              onChange={e => onChange('rateLimitWindowMins', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily API Limit</label>
            <input
              type="number"
              value={getValue('dailyApiLimit')}
              onChange={e => onChange('dailyApiLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Limit</label>
            <input
              type="number"
              value={getValue('sessionMessageLimit')}
              onChange={e => onChange('sessionMessageLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Feature Flags */}
      <SettingsSection title="Feature Flags">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleSetting
            label="Enabled"
            checked={getValue('enabled')}
            onChange={v => onChange('enabled', v)}
          />
          <ToggleSetting
            label="Weather"
            checked={getValue('weatherEnabled')}
            onChange={v => onChange('weatherEnabled', v)}
          />
          <ToggleSetting
            label="Risk Assessment"
            checked={getValue('riskAssessmentEnabled')}
            onChange={v => onChange('riskAssessmentEnabled', v)}
          />
          <ToggleSetting
            label="Anonymous Access"
            checked={getValue('anonymousAccessEnabled')}
            onChange={v => onChange('anonymousAccessEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Advanced AI Features */}
      <SettingsSection title="Advanced AI Features">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Control streaming responses, tool use, and other advanced AI capabilities.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleSettingWithDescription
            label="Streaming"
            description="Real-time text streaming via SSE"
            checked={getValue('streamingEnabled')}
            onChange={v => onChange('streamingEnabled', v)}
          />
          <ToggleSettingWithDescription
            label="Tool Use"
            description="Function calling for search & actions"
            checked={getValue('toolUseEnabled')}
            onChange={v => onChange('toolUseEnabled', v)}
          />
          <ToggleSettingWithDescription
            label="Extended Thinking"
            description="Deep reasoning for complex queries"
            checked={getValue('extendedThinkingEnabled')}
            onChange={v => onChange('extendedThinkingEnabled', v)}
          />
          <ToggleSettingWithDescription
            label="Batch Analytics"
            description="50% cost reduction for bulk processing"
            checked={getValue('batchAnalyticsEnabled')}
            onChange={v => onChange('batchAnalyticsEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Vehicle Type Preferences */}
      <SettingsSection title="Vehicle Type Preferences">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Configure how Choé handles different vehicle types in search results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-medium text-gray-900 dark:text-white">Rideshare</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              For Uber, DoorDash, Instacart drivers. Weekly/monthly rentals with mileage packages.
            </p>
            <ToggleSetting
              label="Prioritize in results"
              checked={getValue('preferRideshare')}
              onChange={v => onChange('preferRideshare', v)}
            />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-medium text-gray-900 dark:text-white">Rental (Instant)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Traditional peer-to-peer rentals. Daily/weekend rentals with standard pricing.
            </p>
            <ToggleSetting
              label="Show type badges"
              checked={getValue('showVehicleTypeBadges')}
              onChange={v => onChange('showVehicleTypeBadges', v)}
            />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">No Deposit</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Highlight vehicles with no security deposit for budget-conscious renters.
            </p>
            <ToggleSetting
              label="Prioritize no-deposit"
              checked={getValue('preferNoDeposit')}
              onChange={v => onChange('preferNoDeposit', v)}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SECURITY TAB
// =============================================================================

function SecurityTab({
  events,
  stats,
}: {
  events: SecurityEventSummary[]
  stats: ChoeSecurityResponse['stats'] | null
}) {
  return (
    <div className="space-y-6">
      {/* Threat Metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Rate Limits (Today)"
            value={stats.today.rateLimitHits}
            subtext={`${stats.week.rateLimitHits} this week`}
          />
          <StatCard
            label="Bots Blocked"
            value={stats.today.botsBlocked}
            subtext={`${stats.week.botsBlocked} this week`}
          />
          <StatCard
            label="Prompt Injections"
            value={stats.today.promptInjections}
            subtext={`${stats.week.promptInjections} this week`}
          />
          <StatCard
            label="Unique IPs"
            value={stats.today.uniqueIPs}
            subtext="flagged today"
          />
        </div>
      )}

      {/* Security Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Security Events</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blocked</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map(event => (
              <tr key={event.id}>
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {event.eventType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={event.severity} />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                  {event.ipAddress}
                </td>
                <td className="px-4 py-3">
                  {event.blocked ? (
                    <IoCloseCircle className="text-red-500 text-lg" />
                  ) : (
                    <IoCheckmarkCircle className="text-green-500 text-lg" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// ANALYTICS TAB
// =============================================================================

function AnalyticsTab({
  stats,
  dailyStats,
}: {
  stats: ChoeStatsResponse['data']
  dailyStats: { date: string; conversations: number; cost: number }[]
}) {
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
            <button className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50">
              Create Summary Batch
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50">
              Create Quality Batch
            </button>
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversations</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Savings</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="text-center">
                <td colSpan={5} className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
                  No batch jobs yet. Create one to process conversations at 50% cost.
                </td>
              </tr>
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
      </div>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatCard({
  label,
  value,
  subtext,
  trend,
  highlight,
}: {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
      )}
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function ToggleSetting({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )
}

function ToggleSettingWithDescription({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg ${disabled ? 'opacity-60' : ''}`}>
      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </label>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: string | null }) {
  if (!outcome) return <span className="text-xs text-gray-400">In Progress</span>

  const colors = OUTCOME_COLORS[outcome as keyof typeof OUTCOME_COLORS] || OUTCOME_COLORS.ABANDONED

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
      {outcome.charAt(0) + outcome.slice(1).toLowerCase()}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.INFO

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {severity}
    </span>
  )
}

function FunnelStep({
  label,
  value,
  percentage,
  highlight,
}: {
  label: string
  value: number
  percentage: number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
        <div
          className={`h-full ${highlight ? 'bg-purple-500' : 'bg-blue-500'} transition-all`}
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {value.toLocaleString()} ({percentage}%)
        </span>
      </div>
    </div>
  )
}
