'use client'

import { useState, useEffect } from 'react'
import { IoToggle, IoToggleOutline, IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5'

interface FlagRecord {
  id: string
  key: string
  enabled: boolean
  updatedAt: string
  updatedBy: string | null
}

interface FlagMeta {
  label: string
  desc: string
  wired: boolean
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FlagRecord[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, FlagMeta>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/fleet/api/feature-flags')
      .then(r => r.json())
      .then(data => {
        setFlags(data.flags || [])
        setDescriptions(data.descriptions || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleFlag = async (key: string, enabled: boolean) => {
    const meta = descriptions[key]
    const action = enabled ? 'Enable' : 'Disable'
    if (!confirm(`${action} ${meta?.label || key}?\n\n${meta?.desc || ''}`)) return
    setSaving(key)
    try {
      await fetch('/fleet/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      })
      setFlags(prev => prev.map(f =>
        f.key === key ? { ...f, enabled, updatedAt: new Date().toISOString(), updatedBy: 'fleet-admin' } : f
      ))
    } catch {}
    finally { setSaving(null) }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading flags...</div>

  const wiredFlags = flags.filter(f => descriptions[f.key]?.wired)
  const unwiredFlags = flags.filter(f => !descriptions[f.key]?.wired)

  const renderFlag = (flag: FlagRecord) => {
    const meta = descriptions[flag.key]
    return (
      <div key={flag.key} className="flex items-start justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{meta?.label || flag.key}</span>
            {meta?.wired ? (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <IoCheckmarkCircle className="text-sm" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <IoEllipseOutline className="text-sm" /> Planned
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meta?.desc || flag.key}</p>
          {flag.updatedBy && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Changed by {flag.updatedBy} · {new Date(flag.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={() => toggleFlag(flag.key, !flag.enabled)}
          disabled={saving === flag.key}
          className={`text-3xl transition-colors flex-shrink-0 ${saving === flag.key ? 'opacity-50' : ''}`}
        >
          {flag.enabled
            ? <IoToggle className="text-green-500" />
            : <IoToggle className="text-gray-300 dark:text-gray-600 rotate-180" />
          }
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <IoToggleOutline className="text-3xl text-teal-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Control platform features without deploying code. Wired flags are checked on every request — flipping one OFF immediately disables that feature. Planned flags are reserved for future features.
      </p>

      {/* Wired flags (active in production) */}
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Wired into Routes</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {wiredFlags.map(renderFlag)}
      </div>

      {/* Planned flags (not yet wired) */}
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Planned Features</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {unwiredFlags.map(renderFlag)}
      </div>
    </div>
  )
}
