'use client'

import { useState, useEffect } from 'react'
import { IoOptionsOutline, IoSaveOutline } from 'react-icons/io5'

interface ConfigItem {
  key: string
  value: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  options?: string[]
}

const CONFIG_FIELDS: ConfigItem[] = [
  { key: 'SYSTEM_PROMPT_ADDON', value: '', label: 'System Prompt Addition', type: 'textarea' },
  { key: 'ACTIVE_PROMOTIONS', value: '[]', label: 'Active Promotions (JSON array)', type: 'textarea' },
  { key: 'SEASONAL_MESSAGE', value: '', label: 'Seasonal Message', type: 'text' },
  { key: 'BLOCKED_CARS', value: '[]', label: 'Blocked Car IDs (JSON array)', type: 'textarea' },
  { key: 'MIN_BOOKING_DAYS', value: '1', label: 'Minimum Booking Days', type: 'number' },
  { key: 'MAX_BOOKING_DAYS', value: '30', label: 'Maximum Booking Days', type: 'number' },
  { key: 'SEARCH_RADIUS_MILES', value: '50', label: 'Search Radius (miles)', type: 'number' },
  { key: 'CHOE_PERSONALITY', value: 'friendly', label: 'Personality', type: 'select', options: ['friendly', 'professional', 'casual'] },
  { key: 'CHOE_LANGUAGE_DEFAULT', value: 'en', label: 'Default Language', type: 'select', options: ['en', 'es', 'fr'] },
]

export default function ChoeConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/fleet/api/choe-config')
      .then(r => r.json())
      .then(data => setConfig(data.config || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/fleet/api/choe-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Choé config...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IoOptionsOutline className="text-3xl text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choé AI Config</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium">
          <IoSaveOutline />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      <div className="space-y-4">
        {CONFIG_FIELDS.map(field => (
          <div key={field.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{field.label}</label>
            <span className="text-xs font-mono text-gray-400 mb-2 block">{field.key}</span>
            {field.type === 'textarea' ? (
              <textarea
                value={config[field.key] || field.value}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
              />
            ) : field.type === 'select' ? (
              <select
                value={config[field.key] || field.value}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              >
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                value={config[field.key] || field.value}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
