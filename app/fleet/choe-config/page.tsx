'use client'

import { useState, useEffect } from 'react'
import { IoOptionsOutline, IoSaveOutline } from 'react-icons/io5'

interface ConfigField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  options?: string[]
  isJson?: boolean
}

const CONFIG_FIELDS: ConfigField[] = [
  { key: 'SYSTEM_PROMPT_ADDON', label: 'System Prompt Addition', type: 'textarea' },
  { key: 'ACTIVE_PROMOTIONS', label: 'Active Promotions (JSON array)', type: 'textarea', isJson: true },
  { key: 'SEASONAL_MESSAGE', label: 'Seasonal Message', type: 'text' },
  { key: 'BLOCKED_CARS', label: 'Blocked Car IDs (JSON array)', type: 'textarea', isJson: true },
  { key: 'MIN_BOOKING_DAYS', label: 'Minimum Booking Days', type: 'number' },
  { key: 'MAX_BOOKING_DAYS', label: 'Maximum Booking Days', type: 'number' },
  { key: 'SEARCH_RADIUS_MILES', label: 'Search Radius (miles)', type: 'number' },
  { key: 'CHOE_PERSONALITY', label: 'Personality', type: 'select', options: ['friendly', 'professional', 'casual'] },
  { key: 'CHOE_LANGUAGE_DEFAULT', label: 'Default Language', type: 'select', options: ['en', 'es', 'fr'] },
]

export default function ChoeConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/fleet/api/choe-config')
      .then(r => r.json())
      .then(data => setConfig(data.config || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const validateJson = (key: string, value: string): boolean => {
    if (!value || value.trim() === '') return true
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        setErrors(prev => ({ ...prev, [key]: 'Must be a JSON array (e.g. ["item1", "item2"])' }))
        return false
      }
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next })
      return true
    } catch {
      setErrors(prev => ({ ...prev, [key]: 'Invalid JSON syntax' }))
      return false
    }
  }

  const handleSave = async () => {
    // Validate all JSON fields first
    let hasErrors = false
    for (const field of CONFIG_FIELDS) {
      if (field.isJson && config[field.key]) {
        if (!validateJson(field.key, config[field.key])) hasErrors = true
      }
    }
    if (hasErrors) return

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
        <button onClick={handleSave} disabled={saving || Object.keys(errors).length > 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700'
          } disabled:opacity-50`}>
          <IoSaveOutline />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Changes take effect within 60 seconds. Choé picks up config on every message.
      </p>

      <div className="space-y-4">
        {CONFIG_FIELDS.map(field => (
          <div key={field.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
            <span className="text-xs font-mono text-gray-400 mb-2 block">{field.key}</span>
            {field.type === 'textarea' ? (
              <textarea
                value={config[field.key] || ''}
                onChange={e => {
                  setConfig(prev => ({ ...prev, [field.key]: e.target.value }))
                  if (field.isJson) validateJson(field.key, e.target.value)
                }}
                rows={3}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-900 dark:text-white font-mono ${
                  errors[field.key] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
            ) : field.type === 'select' ? (
              <select
                value={config[field.key] || ''}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              >
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                value={config[field.key] || ''}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            )}
            {errors[field.key] && (
              <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
