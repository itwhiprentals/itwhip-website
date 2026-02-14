// app/fleet/components/BulkTranslateReview.tsx
// AI Bulk Translation Review — approve/edit/regenerate AI suggestions
// Phase 3 of Fleet Language Admin
'use client'

import { useState } from 'react'

const FLEET_KEY = 'phoenix-fleet-2847'

interface TranslationSuggestion {
  namespace: string
  key: string
  englishValue: string
  translation: string
}

interface BulkTranslateReviewProps {
  isOpen: boolean
  onClose: () => void
  targetLocale: string
  translations: TranslationSuggestion[]
  onApproved: () => void
}

export default function BulkTranslateReview({
  isOpen,
  onClose,
  targetLocale,
  translations: initialTranslations,
  onApproved,
}: BulkTranslateReviewProps) {
  const [translations, setTranslations] = useState(initialTranslations)
  const [selected, setSelected] = useState<Set<number>>(new Set(initialTranslations.map((_, i) => i)))
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || translations.length === 0) return null

  const toggleItem = (idx: number) => {
    const next = new Set(selected)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === translations.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(translations.map((_, i) => i)))
    }
  }

  const startEdit = (idx: number) => {
    setEditIdx(idx)
    setEditValue(translations[idx].translation)
  }

  const saveEdit = () => {
    if (editIdx === null) return
    const updated = [...translations]
    updated[editIdx] = { ...updated[editIdx], translation: editValue }
    setTranslations(updated)
    setEditIdx(null)
  }

  const handleApprove = async () => {
    const approved = translations.filter((_, i) => selected.has(i))
    if (approved.length === 0) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/fleet/api/language/bulk-update?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: targetLocale,
          updates: approved.map(t => ({
            namespace: t.namespace,
            key: t.key,
            value: t.translation,
          })),
          source: 'ai-generated',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
      onApproved()
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Review AI Translations — {targetLocale.toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {selected.size} of {translations.length} selected
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {saved && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-700 dark:text-green-300">
              {selected.size} translations saved successfully
            </div>
          )}

          {/* Select all */}
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer pb-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="checkbox"
              checked={selected.size === translations.length}
              onChange={toggleAll}
              className="rounded text-blue-600"
            />
            Select All
          </label>

          {translations.map((t, i) => (
            <div
              key={`${t.namespace}.${t.key}`}
              className={`p-3 rounded-md border transition-colors ${
                selected.has(i)
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleItem(i)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">
                    {t.namespace}.{t.key}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    EN: <span className="text-gray-600 dark:text-gray-300">{t.englishValue}</span>
                  </div>

                  {editIdx === i ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="flex-1 text-sm px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 dark:border-blue-500 rounded text-gray-900 dark:text-gray-100 font-mono"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Save</button>
                      <button onClick={() => setEditIdx(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{t.translation}</span>
                      <button
                        onClick={() => startEdit(i)}
                        className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex-shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={selected.size === 0 || saving || saved}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : `Approve ${selected.size} Translation${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
