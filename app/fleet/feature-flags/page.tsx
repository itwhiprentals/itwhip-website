'use client'

import { useState, useEffect } from 'react'
import { IoToggleOutline, IoToggle } from 'react-icons/io5'

interface FlagRecord {
  id: string
  key: string
  enabled: boolean
  updatedAt: string
  updatedBy: string | null
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FlagRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/fleet/api/feature-flags')
      .then(r => r.json())
      .then(data => setFlags(data.flags || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleFlag = async (key: string, enabled: boolean) => {
    if (!confirm(`${enabled ? 'Enable' : 'Disable'} ${key}?`)) return
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <IoToggleOutline className="text-3xl text-teal-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{flags.length} flags</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {flags.map(flag => (
          <div key={flag.key} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{flag.key}</span>
              {flag.updatedBy && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Last changed by {flag.updatedBy} · {new Date(flag.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleFlag(flag.key, !flag.enabled)}
              disabled={saving === flag.key}
              className={`text-3xl transition-colors ${saving === flag.key ? 'opacity-50' : ''}`}
            >
              {flag.enabled
                ? <IoToggle className="text-green-500" />
                : <IoToggle className="text-gray-300 dark:text-gray-600 rotate-180" />
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
