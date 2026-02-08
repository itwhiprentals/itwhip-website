// app/fleet/choe/page.tsx
// Choé AI Fleet Admin Dashboard — Orchestrator

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
  IoSparkles,
} from 'react-icons/io5'
import { CHOE_TABS, CHOE_COLORS } from './constants'
import type { ChoeStatsResponse, ChoeConversationListResponse, ChoeSecurityResponse, ConversationSummary, SecurityEventSummary, ChoeAISettings } from './types'
import {
  OverviewTab,
  ConversationsTab,
  SettingsTab,
  SecurityTab,
  AnalyticsTab,
} from './components'

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

  // Anthropic Admin API usage data
  const [anthropicUsage, setAnthropicUsage] = useState<{
    configured: boolean
    today: { tokens: number; cost: number; requests: number }
    week: { tokens: number; cost: number; requests: number }
    month: { tokens: number; cost: number; requests: number }
    cacheSavings: number
  } | null>(null)

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

        // Fetch Anthropic Admin API usage (if configured)
        try {
          const usageRes = await fetch(`/fleet/api/choe/anthropic-usage?key=${apiKey}&view=quick`)
          if (usageRes.ok) {
            const usageData = await usageRes.json()
            if (usageData.success) {
              setAnthropicUsage({
                configured: usageData.configured,
                ...usageData.data,
              })
            }
          }
        } catch (e) {
          console.log('[Choe Dashboard] Anthropic Admin API not available')
        }
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
            <OverviewTab stats={stats} dailyStats={dailyStats} conversations={conversations} anthropicUsage={anthropicUsage} />
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
            <AnalyticsTab stats={stats} dailyStats={dailyStats} toolUsage={toolUsage} apiKey={apiKey} />
          )}
        </>
      )}
    </div>
  )
}
