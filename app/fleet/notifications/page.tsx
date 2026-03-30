'use client'

import { useState, useEffect, useCallback } from 'react'
import { IoNotifications, IoSend, IoTime, IoStatsChart, IoSettings, IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5'

const API_BASE = '/fleet/api/notifications'
const KEY = 'phoenix-fleet-2847'

const AUDIENCES = [
  { value: 'all_users', label: 'All Users' },
  { value: 'all_guests', label: 'All Guests' },
  { value: 'all_hosts', label: 'All Hosts/Partners' },
  { value: 'specific_user', label: 'Specific User' },
  { value: 'hosts_no_insurance', label: 'Hosts Missing Insurance' },
  { value: 'inactive_guests', label: 'Inactive Guests (30+ days)' },
]

const DEEP_LINKS = [
  { value: '', label: 'None' },
  { value: 'home', label: 'Home / Dashboard' },
  { value: 'search', label: 'Search' },
  { value: 'choe', label: 'Choe AI' },
  { value: 'messages', label: 'Messages / Inbox' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'account', label: 'Account' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'claims', label: 'Claims' },
  { value: 'tracking', label: 'Tracking' },
]

const TABS = ['Send', 'History', 'Stats', 'Settings']

export default function FleetNotificationsPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <IoNotifications className="text-2xl text-purple-500" />
        <h1 className="text-2xl font-bold dark:text-white">Notification Center</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${tab === i ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <SendTab />}
      {tab === 1 && <HistoryTab />}
      {tab === 2 && <StatsTab />}
      {tab === 3 && <SettingsTab />}
    </div>
  )
}

// ─── Send Tab ────────────────────────────────────────────────
function SendTab() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all_users')
  const [targetUserId, setTargetUserId] = useState('')
  const [targetUserLabel, setTargetUserLabel] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<{ id: string; name: string; email: string; role: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [deepLink, setDeepLink] = useState('')
  const [preview, setPreview] = useState<{ audienceCount: number; tokenCount: number } | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handlePreview = async () => {
    const res = await fetch(`${API_BASE}/send?key=${KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, audience, targetUserId: audience === 'specific_user' ? targetUserId : undefined, deepLink, dryRun: true }),
    })
    const data = await res.json()
    if (res.ok) setPreview(data)
    else alert(data.error)
  }

  const handleSend = async () => {
    if (!confirm(`Send "${title}" to ${preview?.audienceCount || '?'} users (${preview?.tokenCount || 0} with push tokens)?`)) return
    setSending(true)
    const res = await fetch(`${API_BASE}/send?key=${KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, audience, targetUserId: audience === 'specific_user' ? targetUserId : undefined, deepLink, dryRun: false }),
    })
    const data = await res.json()
    setSending(false)
    if (res.ok) { setResult(data); setTitle(''); setBody(''); setPreview(null) }
    else alert(data.error)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (max 50 chars)</label>
          <input value={title} onChange={e => setTitle(e.target.value.slice(0, 50))} placeholder="New Feature Available!"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <span className="text-xs text-gray-400">{title.length}/50</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body (max 150 chars)</label>
          <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 150))} rows={3} placeholder="Check out the latest updates..."
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <span className="text-xs text-gray-400">{body.length}/150</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience</label>
          <select value={audience} onChange={e => setAudience(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        {audience === 'specific_user' && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search User</label>
            {targetUserId ? (
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${targetUserLabel.includes('Host') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {targetUserLabel.includes('Host') ? 'Host' : 'Guest'}
                </span>
                <span className="dark:text-white text-sm flex-1">{targetUserLabel}</span>
                <button onClick={() => { setTargetUserId(''); setTargetUserLabel(''); setUserSearch(''); }} className="text-gray-400 hover:text-red-500">&times;</button>
              </div>
            ) : (
              <>
                <input value={userSearch} placeholder="Type name or email..."
                  onChange={e => {
                    const v = e.target.value; setUserSearch(v);
                    if (v.length >= 2) {
                      fetch(`${API_BASE}/search-users?key=${KEY}&q=${encodeURIComponent(v)}`).then(r => r.json()).then(d => { setUserResults(d.users || []); setShowDropdown(true); });
                    } else { setUserResults([]); setShowDropdown(false); }
                  }}
                  onFocus={() => userResults.length > 0 && setShowDropdown(true)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                {showDropdown && userResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {userResults.map(u => (
                      <button key={u.id} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        onClick={() => { setTargetUserId(u.id); setTargetUserLabel(`${u.name} (${u.role === 'host' ? 'Host' : 'Guest'})`); setShowDropdown(false); setUserSearch(''); }}>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${u.role === 'host' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role === 'host' ? 'Host' : 'Guest'}
                        </span>
                        <div>
                          <p className="text-sm font-medium dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep Link (optional)</label>
          <select value={deepLink} onChange={e => setDeepLink(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            {DEEP_LINKS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePreview} disabled={!title || !body}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium">
            Preview Audience
          </button>
          <button onClick={handleSend} disabled={!title || !body || !preview || sending}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
            <IoSend /> {sending ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </div>

      {/* Preview + Result */}
      <div className="space-y-4">
        {/* iOS Lock Screen Preview */}
        <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
          <p className="text-gray-400 text-xs mb-2">iOS Lock Screen Preview</p>
          <div className="bg-gray-800 rounded-xl p-3 flex gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-bold">W</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{title || 'Notification Title'}</p>
              <p className="text-gray-300 text-xs mt-0.5">{body || 'Notification body text will appear here...'}</p>
              <p className="text-gray-500 text-xs mt-1">now</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="font-medium text-blue-800 dark:text-blue-300">Audience Preview</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{preview.audienceCount} users match, {preview.tokenCount} have push tokens</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2"><IoCheckmarkCircle className="text-green-600" /><p className="font-medium text-green-800 dark:text-green-300">Sent Successfully</p></div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Sent: {result.sent} | Delivered: {result.delivered} | Failed: {result.failed}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── History Tab ─────────────────────────────────────────────
function HistoryTab() {
  const [history, setHistory] = useState<any>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${API_BASE}/history?key=${KEY}&page=${page}`).then(r => r.json()).then(setHistory).catch(() => {})
  }, [page])

  if (!history) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <h3 className="font-semibold mb-3 dark:text-white">Manual Notifications ({history.manualTotal})</h3>
      <div className="space-y-2">
        {history.manual?.map((n: any) => (
          <div key={n.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
            <div>
              <p className="font-medium dark:text-white">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()} | {n.audience}</p>
            </div>
            <div className="text-right text-xs">
              <span className="text-green-600">{n.deliveredCount} delivered</span>
              {n.failedCount > 0 && <span className="text-red-500 ml-2">{n.failedCount} failed</span>}
            </div>
          </div>
        ))}
        {history.manual?.length === 0 && <p className="text-gray-400 text-sm">No manual notifications sent yet</p>}
      </div>

      <h3 className="font-semibold mt-6 mb-3 dark:text-white">Automated (Last 30 Days)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {history.automated?.map((s: any) => (
          <div key={s.type} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-center">
            <p className="text-lg font-bold dark:text-white">{s.count}</p>
            <p className="text-xs text-gray-500">{s.type.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {history.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-30">Prev</button>
          <span className="px-3 py-1 text-sm text-gray-500">{page} / {history.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= history.totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Stats Tab ───────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch(`${API_BASE}/stats?key=${KEY}`).then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  if (!stats) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Push (All Time)', value: stats.summary.totalPushAllTime, color: 'purple' },
          { label: 'This Month', value: stats.summary.totalPushThisMonth, color: 'blue' },
          { label: 'Active Devices', value: stats.summary.activeDeviceTokens, color: 'green' },
          { label: 'Success Rate', value: `${stats.summary.deliverySuccessRate}%`, color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3 dark:text-white">Token Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Registered</span><span className="dark:text-white font-medium">{stats.tokens.total}</span></div>
            <div className="flex justify-between"><span className="text-green-500">Active</span><span className="dark:text-white font-medium">{stats.tokens.active}</span></div>
            <div className="flex justify-between"><span className="text-red-500">Deactivated</span><span className="dark:text-white font-medium">{stats.tokens.inactive}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">iOS</span><span className="dark:text-white font-medium">{stats.tokens.ios}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Android</span><span className="dark:text-white font-medium">{stats.tokens.android}</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3 dark:text-white">Top Notification Types</h3>
          <div className="space-y-2 text-sm">
            {stats.typeBreakdown?.map((t: any) => (
              <div key={t.type} className="flex justify-between">
                <span className="text-gray-500">{t.type.replace(/_/g, ' ')}</span>
                <span className="dark:text-white font-medium">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState<{ type: string; enabled: boolean }[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/settings?key=${KEY}`).then(r => r.json()).then(d => setSettings(d.settings || [])).catch(() => {})
  }, [])

  const toggle = async (type: string, enabled: boolean) => {
    setSaving(type)
    await fetch(`${API_BASE}/settings?key=${KEY}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, enabled }),
    })
    setSettings(prev => prev.map(s => s.type === type ? { ...s, enabled } : s))
    setSaving(null)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Toggle automated notification types. Disabled types will not send push notifications.</p>
      <div className="space-y-1">
        {settings.map(s => (
          <div key={s.type} className="flex items-center justify-between bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium dark:text-white text-sm">{s.type.replace(/_/g, ' ')}</p>
            </div>
            <button onClick={() => toggle(s.type, !s.enabled)} disabled={saving === s.type}
              className={`w-12 h-6 rounded-full transition relative ${s.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${s.enabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
