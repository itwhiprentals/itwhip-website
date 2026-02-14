// app/fleet/components/AddKeyModal.tsx
// Add New Translation Key Modal
// Phase 2 of Fleet Language Admin
'use client'

import { useState } from 'react'

const FLEET_KEY = 'phoenix-fleet-2847'

interface LanguageInfo {
  code: string
  label: string
  flag: string
}

interface AddKeyModalProps {
  isOpen: boolean
  onClose: () => void
  languages: LanguageInfo[]
  namespaces: string[]
  onAdded: () => void
}

export default function AddKeyModal({
  isOpen,
  onClose,
  languages,
  namespaces,
  onAdded,
}: AddKeyModalProps) {
  const [namespace, setNamespace] = useState('')
  const [newNamespace, setNewNamespace] = useState('')
  const [isNewNs, setIsNewNs] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const effectiveNs = isNewNs ? newNamespace : namespace

  const handleSubmit = async () => {
    setError(null)

    if (!effectiveNs) {
      setError('Please select or enter a namespace')
      return
    }
    if (!keyName) {
      setError('Please enter a key name')
      return
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(keyName)) {
      setError('Key must start with a letter and contain only letters, numbers, dots, and underscores')
      return
    }
    if (!values['en']) {
      setError('English value is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/fleet/api/language/add?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namespace: effectiveNs,
          key: keyName,
          values,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add key')
      }

      setSuccess(true)
      onAdded()

      // Reset after brief success state
      setTimeout(() => {
        setSuccess(false)
        setKeyName('')
        setValues({})
        setError(null)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add key')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setNamespace('')
    setNewNamespace('')
    setIsNewNs(false)
    setKeyName('')
    setValues({})
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add Translation Key</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Key added to all language files
            </div>
          )}

          {/* Namespace */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Namespace</label>
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={!isNewNs}
                  onChange={() => setIsNewNs(false)}
                  className="text-blue-600"
                />
                Existing
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={isNewNs}
                  onChange={() => setIsNewNs(true)}
                  className="text-blue-600"
                />
                Create New
              </label>
            </div>

            {isNewNs ? (
              <input
                type="text"
                value={newNamespace}
                onChange={e => setNewNamespace(e.target.value)}
                placeholder="NewNamespace"
                className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-mono"
              />
            ) : (
              <select
                value={namespace}
                onChange={e => setNamespace(e.target.value)}
                className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              >
                <option value="">Select namespace...</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            )}
          </div>

          {/* Key Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              placeholder="myNewKey"
              className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Use camelCase. Dots create nested keys (e.g. section.label).</p>
          </div>

          {/* Values per language */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Values</label>

            {languages.map(lang => (
              <div key={lang.code}>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <span>{lang.flag}</span> {lang.label}
                  {lang.code === 'en' && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={values[lang.code] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [lang.code]: e.target.value }))}
                  placeholder={lang.code === 'en' ? 'Required' : 'Optional — can fill later'}
                  className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !effectiveNs || !keyName || !values['en']}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30"
          >
            {saving ? 'Adding...' : 'Add Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
