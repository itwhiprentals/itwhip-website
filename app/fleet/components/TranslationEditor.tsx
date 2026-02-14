// app/fleet/components/TranslationEditor.tsx
// Inline Translation Editor Modal — edit a key across all languages
// Phase 2 of Fleet Language Admin
'use client'

import { useState, useEffect, useCallback } from 'react'

const FLEET_KEY = 'phoenix-fleet-2847'

interface LanguageInfo {
  code: string
  label: string
  flag: string
}

interface TranslationEditorProps {
  isOpen: boolean
  onClose: () => void
  namespace: string
  keyPath: string
  languages: LanguageInfo[]
  onSaved: () => void
}

// Extract {variables} from a string
function extractVariables(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g)
  return matches ? [...new Set(matches)].sort() : []
}

export default function TranslationEditor({
  isOpen,
  onClose,
  namespace,
  keyPath,
  languages,
  onSaved,
}: TranslationEditorProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const fetchValues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/fleet/api/language/lookup?key=${FLEET_KEY}&namespace=${namespace}&key=${keyPath}`
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setValues(data.values || {})
      setOriginal(data.values || {})
      setSaved(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [namespace, keyPath])

  useEffect(() => {
    if (isOpen && namespace && keyPath) {
      fetchValues()
    }
  }, [isOpen, namespace, keyPath, fetchValues])

  if (!isOpen) return null

  const enValue = values['en'] || ''
  const enVars = extractVariables(enValue)
  const nonEnLanguages = languages.filter(l => l.code !== 'en')

  const handleSave = async (locale: string) => {
    const newValue = values[locale]
    if (newValue === original[locale]) return // No change

    setSaving(locale)
    setError(null)
    try {
      const res = await fetch(`/fleet/api/language/update?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          namespace,
          key: keyPath,
          value: newValue,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      setOriginal(prev => ({ ...prev, [locale]: newValue }))
      setSaved(prev => new Set(prev).add(locale))
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  const handleSaveAll = async () => {
    for (const lang of nonEnLanguages) {
      if (values[lang.code] !== original[lang.code]) {
        await handleSave(lang.code)
      }
    }
  }

  const hasChanges = nonEnLanguages.some(l => values[l.code] !== original[l.code])

  // Check for variable warnings
  const getWarnings = (locale: string): string[] => {
    const warnings: string[] = []
    const val = values[locale] || ''
    if (!val) return warnings

    const localeVars = extractVariables(val)
    const missingVars = enVars.filter(v => !localeVars.includes(v))
    if (missingVars.length > 0) {
      warnings.push(`Missing variables: ${missingVars.join(', ')}`)
    }

    if (val.length > enValue.length * 2 && enValue.length > 10) {
      warnings.push(`Translation is ${Math.round(val.length / enValue.length)}x longer than English`)
    }

    return warnings
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Edit Translation</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
              {namespace}.{keyPath}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400" />
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* English (read-only reference) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="text-base">🇺🇸</span> English (reference)
                  </label>
                  <span className="text-xs text-gray-400">{enValue.length} chars</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md text-sm text-gray-700 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700">
                  {enValue || <span className="italic text-gray-400">(empty)</span>}
                </div>
                {enVars.length > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    Variables: {enVars.map(v => (
                      <code key={v} className="mx-0.5 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{v}</code>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable languages */}
              {nonEnLanguages.map(lang => {
                const val = values[lang.code] || ''
                const isChanged = val !== original[lang.code]
                const isSaved = saved.has(lang.code)
                const isSaving = saving === lang.code
                const warnings = getWarnings(lang.code)

                return (
                  <div key={lang.code}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="text-base">{lang.flag}</span> {lang.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{val.length} chars</span>
                        {isSaved && (
                          <span className="text-xs text-green-500 flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Saved
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={val}
                        onChange={e => setValues(prev => ({ ...prev, [lang.code]: e.target.value }))}
                        rows={Math.max(2, Math.ceil(val.length / 60))}
                        className={`flex-1 text-sm px-3 py-2 bg-white dark:bg-gray-900 rounded-md font-mono resize-y border ${
                          isChanged
                            ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-800'
                            : 'border-gray-300 dark:border-gray-600'
                        } text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <button
                        onClick={() => handleSave(lang.code)}
                        disabled={!isChanged || isSaving}
                        className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-start"
                      >
                        {isSaving ? '...' : 'Save'}
                      </button>
                    </div>
                    {warnings.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {warnings.map((w, i) => (
                          <p key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {w}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { setValues({ ...original }); setSaved(new Set()) }}
            disabled={!hasChanges}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
          >
            Revert Changes
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges || saving !== null}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
